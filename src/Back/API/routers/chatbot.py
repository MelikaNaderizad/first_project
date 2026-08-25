from fastapi import APIRouter
from pydantic import BaseModel

from services.chatbot_services import get_chatbot_status, send_chat_message


router = APIRouter(
    prefix="/api",
    tags=["Chatbot"]
)


class ChatRequest(BaseModel):
    message: str


@router.get("/chatbot/status")
def chatbot_status():
    return get_chatbot_status()


@router.post("/chatbot/message")
def chatbot_message(payload: ChatRequest):
    return send_chat_message(payload.message)