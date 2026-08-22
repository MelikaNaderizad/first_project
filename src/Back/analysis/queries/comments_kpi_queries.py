import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select, func, and_, cast, Numeric, true, case, or_
from database.models import Comments, Products


def positive_comments_filter():
    return and_(
        Comments.recommendation_status == "recommended",
        Comments.rate >= 4
    )

def negative_comments_filter():
    return and_(
        Comments.recommendation_status == "not_recommended",
        Comments.rate <= 2
    )

comment_kpi_query = select(
    func.count().filter(positive_comments_filter())
        .label("positive_comments"),

    func.count().filter(negative_comments_filter())
        .label("negative_comments"),
).select_from(Comments)