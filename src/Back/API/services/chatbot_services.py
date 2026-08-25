def get_chatbot_status():
    return {
        "status": "not_ready",
        "message": "دستیار هوشمند (AI Agent) هنوز پیاده‌سازی نشده و به‌زودی فعال خواهد شد.",
    }


def send_chat_message(message: str):
    return {
        "status": "not_ready",
        "reply": "این قابلیت هنوز آماده نیست. لطفاً بعداً دوباره تلاش کنید.",
        "received_message": message,
    }