import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from sqlalchemy import select, func, and_, cast, Numeric, true, case, or_
from database.models import Comments, Products
from queries.comments_kpi_queries import positive_comments_filter, negative_comments_filter

comment_stats = (
    select(
        Comments.product_id,
        cast(func.count().filter(positive_comments_filter()), Numeric).label("positive_comments"),
        cast(func.count().filter(negative_comments_filter()), Numeric).label("negative_comments"),
    )
    .group_by(Comments.product_id)
    .cte("comment_stats")
)

# Bayesian Average
constants = (
    select(
        (
            func.sum(cast(Products.rate, Numeric) * cast(Products.rate_cnt, Numeric))
            / func.nullif(func.sum(Products.rate_cnt), 0)
        ).label("global_product_rate"),

        func.percentile_cont(0.75).within_group(cast(Products.rate_cnt, Numeric))
            .label("product_prior_strength"),

        (
            select(
                func.sum(comment_stats.c.positive_comments)
                / func.nullif(
                    func.sum(comment_stats.c.positive_comments + comment_stats.c.negative_comments), 0
                )
            )
            .scalar_subquery()
        ).label("global_positive_ratio"),

        (
            select(
                func.percentile_cont(0.75).within_group(
                    comment_stats.c.positive_comments + comment_stats.c.negative_comments
                )
            )
            .scalar_subquery()
        ).label("comment_prior_strength"),
    )
    .where(
        Products.rate > 0,
        Products.rate_cnt > 0,
        ~func.coalesce(Products.is_fake, False),
    )
    .cte("constants")
)

# raw scores for each product
scored_products = (
    select(
        Products.id.label("product_id"),
        Products.title_fa,
        cast(Products.rate, Numeric).label("raw_product_rate"),
        Products.rate_cnt,

        func.coalesce(comment_stats.c.positive_comments, 0).label("positive_comments"),
        func.coalesce(comment_stats.c.negative_comments, 0).label("negative_comments"),

        (
            func.coalesce(comment_stats.c.positive_comments, 0)
            + func.coalesce(comment_stats.c.negative_comments, 0)
        ).label("opinionated_comments"),

        (
            (cast(Products.rate_cnt, Numeric) / (cast(Products.rate_cnt, Numeric) + constants.c.product_prior_strength))
            * cast(Products.rate, Numeric)
            +
            (constants.c.product_prior_strength / (cast(Products.rate_cnt, Numeric) + constants.c.product_prior_strength))
            * constants.c.global_product_rate
        ).label("bayesian_product_score"),

        (
                100 * (
                    (
                        func.coalesce(comment_stats.c.positive_comments, 0)
                        + constants.c.comment_prior_strength * constants.c.global_positive_ratio
                    )
                    / (
                        func.coalesce(comment_stats.c.positive_comments, 0)
                        + func.coalesce(comment_stats.c.negative_comments, 0)
                        + constants.c.comment_prior_strength
                    )
                )
            ).label("sentiment_score"),
        )
        .select_from(Products)
        .join(comment_stats, comment_stats.c.product_id == Products.id, isouter=True)  # LEFT JOIN
        .join(constants, true())  # CROSS JOIN
        .where(
            Products.rate > 0,
            ~func.coalesce(Products.is_fake, False),
        )
        .cte("scored_products")
)

health_scores = (
    select(
        scored_products.c.product_id,
        scored_products.c.title_fa,
        scored_products.c.raw_product_rate,
        scored_products.c.rate_cnt,
        scored_products.c.positive_comments,
        scored_products.c.negative_comments,
        scored_products.c.opinionated_comments,
        scored_products.c.bayesian_product_score,
        scored_products.c.sentiment_score,

        (
            0.6 * scored_products.c.bayesian_product_score
            + 0.4 * scored_products.c.sentiment_score
        ).label("product_health_score"),
    )
    .cte("health_scores")
)

product_kpi_query = select(
    health_scores.c.product_id,
    health_scores.c.title_fa,
    health_scores.c.raw_product_rate,
    health_scores.c.rate_cnt,
    health_scores.c.positive_comments,
    health_scores.c.negative_comments,

    func.round(cast(health_scores.c.bayesian_product_score, Numeric), 2).label("bayesian_product_score"),
    func.round(cast(health_scores.c.sentiment_score, Numeric), 2).label("sentiment_score"),
    func.round(cast(health_scores.c.product_health_score, Numeric), 2).label("product_health_score"),

    case(
        (
            and_(
                health_scores.c.rate_cnt < 15,
                health_scores.c.opinionated_comments < 15,
            ),
            "insufficient_data",
        ),
        (health_scores.c.product_health_score >= 80, "successful"),
        (health_scores.c.product_health_score <= 60, "unsuccessful"),
        else_="neutral",
    ).label("product_status"),
)