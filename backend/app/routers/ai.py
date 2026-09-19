from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.ai_service import ai_service

router = APIRouter(prefix="/ai", tags=["AI Assistance"])

class MotivationRequest(BaseModel):
    topic: Optional[str] = "productivity"

class ChatRequest(BaseModel):
    message: str

@router.post("/motivate")
async def get_motivation(data: MotivationRequest):
    topic = data.topic or "productivity"
    prompt = f"Give me a short, highly motivating quote and one sentence of advice about {topic}."
    reply = await ai_service.generate_response(prompt)
    return {"motivation": reply}

@router.post("/chat")
async def chat_ai(data: ChatRequest):
    reply = await ai_service.generate_response(data.message)
    return {"reply": reply}
