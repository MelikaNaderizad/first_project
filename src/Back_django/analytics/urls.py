from django.urls import path

from . import views

urlpatterns = [
    path("sellers", views.sellers),
    path("overview", views.overview),
    path("forecast/products", views.forecast_products),
    path("forecast/products/<int:product_id>", views.forecast_product),
]