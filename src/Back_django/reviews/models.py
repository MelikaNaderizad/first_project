from django.db import models


class Comment(models.Model):
    id = models.IntegerField(primary_key=True)
    title = models.CharField(blank=True, null=True)
    body = models.TextField(blank=True, null=True)
    created_at = models.CharField(blank=True, null=True)  # تاریخ جلالی به‌صورت رشته
    rate = models.FloatField(blank=True, null=True)
    recommendation_status = models.CharField(blank=True, null=True)
    is_buyer = models.BooleanField(blank=True, null=True)
    product = models.ForeignKey(
    "catalog.Products",
    db_column="product_id",
    db_constraint=False,
    on_delete=models.DO_NOTHING,
    null=True,
    blank=True,
    related_name="comments",
)
    advantages = models.TextField(blank=True, null=True)
    disadvantages = models.TextField(blank=True, null=True)
    likes = models.IntegerField(blank=True, null=True)
    dislikes = models.IntegerField(blank=True, null=True)
    seller_title = models.CharField(blank=True, null=True)
    seller_code = models.CharField(blank=True, null=True)
    true_to_size_rate = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "comments"
        verbose_name = "کامنت"
        verbose_name_plural = "کامنت‌ها"

    def __str__(self):
        return f"{self.id} - {self.title or ''}"[:60]