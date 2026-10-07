from django.db import models


class ProductKpi(models.Model):
    product = models.OneToOneField(
        "catalog.Products",
        db_column="product_id",
        primary_key=True,
        db_constraint=False,
        on_delete=models.DO_NOTHING,
        related_name="kpi",
    )
    title_fa = models.TextField(null=True)
    raw_product_rate = models.DecimalField(max_digits=20, decimal_places=4, null=True)
    rate_cnt = models.IntegerField(null=True)
    positive_comments = models.IntegerField(null=True)
    negative_comments = models.IntegerField(null=True)
    bayesian_product_score = models.DecimalField(max_digits=20, decimal_places=4, null=True)
    sentiment_score = models.DecimalField(max_digits=20, decimal_places=4, null=True)
    product_health_score = models.DecimalField(max_digits=20, decimal_places=4, null=True)
    product_status = models.TextField(null=True)

    class Meta:
        managed = False
        db_table = "product_kpi_mv"


class SellerKpi(models.Model):
    seller_code = models.TextField(primary_key=True)
    seller_title = models.TextField(null=True)
    sold_products = models.IntegerField(null=True)
    total_comments = models.IntegerField(null=True)
    positive_comments = models.IntegerField(null=True)
    negative_comments = models.IntegerField(null=True)
    customer_satisfaction_score = models.DecimalField(max_digits=20, decimal_places=4, null=True)
    fake_product_percent = models.DecimalField(max_digits=20, decimal_places=4, null=True)
    low_rated_product_percent = models.DecimalField(max_digits=20, decimal_places=4, null=True)
    seller_health_score = models.DecimalField(max_digits=20, decimal_places=4, null=True)
    seller_status = models.TextField(null=True)

    class Meta:
        managed = False
        db_table = "seller_kpi_mv"