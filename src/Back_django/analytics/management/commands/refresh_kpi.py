from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = "رفرش ویوهای KPI محصولات و فروشنده‌ها"

    def handle(self, *args, **options):
        with connection.cursor() as cur:
            for view in ("product_kpi_mv", "seller_kpi_mv"):
                cur.execute(f"REFRESH MATERIALIZED VIEW CONCURRENTLY {view};")
                self.stdout.write(self.style.SUCCESS(f"{view} رفرش شد"))