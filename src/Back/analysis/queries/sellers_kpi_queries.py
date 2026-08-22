import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from sqlalchemy import select, func, and_, cast, Numeric, true, case, or_
from database.models import Comments, Products
from queries.comments_kpi_queries import positive_comments_filter, negative_comments_filter

seller_stats = (
    select(
        Comments.seller_code,
        func.max(Comments.seller_title).label("seller_title"),

        func.count(func.distinct(Comments.product_id)).label("sold_products"),

        func.count(func.distinct(Comments.product_id))
            .filter(Products.is_fake == True)
            .label("fake_products"),

        func.count(func.distinct(Comments.product_id))
            .filter(
                and_(
                    Products.rate >= 1,
                    Products.rate <= 40,
                    Products.rate_cnt >= 10,
                )
            )
            .label("low_rated_products"),

        func.count().label("total_comments"),

        func.count().filter(positive_comments_filter()).label("positive_comments"),
        func.count().filter(negative_comments_filter()).label("negative_comments"),
    )
    .select_from(Comments)
    .join(Products, Products.id == Comments.product_id)  # INNER JOIN
    .where(Comments.seller_code.isnot(None))
    .group_by(Comments.seller_code)
    .cte("seller_stats")
)

constants = (
    select(
        (
            func.sum(seller_stats.c.positive_comments)
            / func.nullif(
                func.sum(seller_stats.c.positive_comments + seller_stats.c.negative_comments), 0
            )
        ).label("global_positive_ratio"),

        (
            func.sum(seller_stats.c.fake_products)
            / func.nullif(func.sum(seller_stats.c.sold_products), 0)
        ).label("global_fake_ratio"),

        (
            func.sum(seller_stats.c.low_rated_products)
            / func.nullif(func.sum(seller_stats.c.sold_products), 0)
        ).label("global_low_rated_ratio"),

        cast(20, Numeric).label("comment_prior_strength"),
        cast(10, Numeric).label("product_prior_strength"),
    )
    .select_from(seller_stats)
    .cte("constants")
)

scored_sellers = (
    select(
        seller_stats.c.seller_code,
        seller_stats.c.seller_title,
        seller_stats.c.sold_products,
        seller_stats.c.fake_products,
        seller_stats.c.low_rated_products,
        seller_stats.c.total_comments,
        seller_stats.c.positive_comments,
        seller_stats.c.negative_comments,
        constants.c.comment_prior_strength,
        constants.c.product_prior_strength,

        (
            100
            * (cast(seller_stats.c.positive_comments, Numeric) + constants.c.comment_prior_strength * constants.c.global_positive_ratio)
            / (cast(seller_stats.c.positive_comments + seller_stats.c.negative_comments, Numeric) + constants.c.comment_prior_strength)
        ).label("customer_satisfaction_score"),

        (
            100
            * (cast(seller_stats.c.fake_products, Numeric) + constants.c.product_prior_strength * constants.c.global_fake_ratio)
            / (cast(seller_stats.c.sold_products, Numeric) + constants.c.product_prior_strength)
        ).label("smoothed_fake_product_percent"),

        (
            100
            * (cast(seller_stats.c.low_rated_products, Numeric) + constants.c.product_prior_strength * constants.c.global_low_rated_ratio)
            / (cast(seller_stats.c.sold_products, Numeric) + constants.c.product_prior_strength)
        ).label("smoothed_low_rated_product_percent"),
    )
    .select_from(seller_stats)
    .join(constants, true())  # CROSS JOIN
    .cte("scored_sellers")
)

health_scores = (
    select(
        scored_sellers.c.seller_code,
        scored_sellers.c.seller_title,
        scored_sellers.c.sold_products,
        scored_sellers.c.fake_products,
        scored_sellers.c.low_rated_products,
        scored_sellers.c.total_comments,
        scored_sellers.c.positive_comments,
        scored_sellers.c.negative_comments,
        scored_sellers.c.comment_prior_strength,
        scored_sellers.c.product_prior_strength,
        scored_sellers.c.customer_satisfaction_score,
        scored_sellers.c.smoothed_fake_product_percent,
        scored_sellers.c.smoothed_low_rated_product_percent,

        (
            0.5 * scored_sellers.c.customer_satisfaction_score
            + 0.3 * (100 - scored_sellers.c.smoothed_fake_product_percent)
            + 0.2 * (100 - scored_sellers.c.smoothed_low_rated_product_percent)
        ).label("seller_health_score"),
    )
    .cte("health_scores")
)

seller_kpi_query = select(
    health_scores.c.seller_code,
    health_scores.c.seller_title,
    health_scores.c.sold_products,
    health_scores.c.total_comments,
    health_scores.c.positive_comments,
    health_scores.c.negative_comments,

    func.round(cast(health_scores.c.customer_satisfaction_score, Numeric), 2).label("customer_satisfaction_score"),
    func.round(cast(health_scores.c.smoothed_fake_product_percent, Numeric), 2).label("fake_product_percent"),
    func.round(cast(health_scores.c.smoothed_low_rated_product_percent, Numeric), 2).label("low_rated_product_percent"),
    func.round(cast(health_scores.c.seller_health_score, Numeric), 2).label("seller_health_score"),

    case(
        (
            or_(
                cast(health_scores.c.sold_products, Numeric) < health_scores.c.product_prior_strength,
                cast(health_scores.c.total_comments, Numeric) < health_scores.c.comment_prior_strength,
            ),
            "insufficient_data",
        ),
        (health_scores.c.seller_health_score >= 80, "successful"),
        (health_scores.c.seller_health_score <= 60, "unsuccessful"),
        else_="neutral",
    ).label("seller_status"),
)
