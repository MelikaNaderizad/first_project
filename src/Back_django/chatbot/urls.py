from django.urls import path

from . import views

urlpatterns = [
    path("chatbot/status", views.chatbot_status),
    path("chatbot/message", views.chatbot_message),
]