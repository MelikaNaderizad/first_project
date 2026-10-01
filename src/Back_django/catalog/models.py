from django.db import models


class Products(models.Model):
    id = models.IntegerField(primary_key=True)
    title_fa = models.TextField(null=True)
    rate = models.IntegerField(null=True)
    rate_cnt = models.IntegerField(null=True)
    category1 = models.TextField(null=True)
    category2 = models.TextField(null=True)
    brand = models.TextField(null=True)
    price = models.BigIntegerField(null=True)
    seller = models.TextField(null=True)
    is_fake = models.BooleanField(null=True)
    min_price_last_month = models.BigIntegerField(null=True)
    sub_category = models.TextField(null=True)

    class Meta:
        managed = False
        db_table = "products"