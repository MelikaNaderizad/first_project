from django.contrib import admin

from .models import Comment


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "product_id", "title", "rate", "is_buyer", "created_at")
    list_filter = ("is_buyer", "rate", "recommendation_status")
    search_fields = ("title", "body", "product_id")
    ordering = ("-id",)
    list_per_page = 50
    show_full_result_count = False  # روی جدول بزرگ سریع‌تر است

    # داده‌ی تحلیلی است، از admin تغییر نکند
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False