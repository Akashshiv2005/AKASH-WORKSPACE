from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["AI Assistance"])

class MotivationRequest(BaseModel):
    topic: Optional[str] = "productivity"

class ChatRequest(BaseModel):
    message: str

@router.post("/motivate")
async def get_motivation(data: MotivationRequest):
    return await AIService.get_daily_motivation(data.topic or "productivity")

@router.post("/chat")
async def chat_ai(data: ChatRequest):
    reply = await AIService.chat_with_gemini(data.message)
    return {"reply": reply}
