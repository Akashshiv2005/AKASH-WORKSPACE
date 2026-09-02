import os
import google.generativeai as genai
from app.core.config import settings

class AIService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", "")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash")
        else:
            self.model = None

    async def generate_response(self, prompt: str, system_instruction: str = None) -> str:
        default_system_prompt = (
            "You are JARVIS, an advanced, highly intelligent executive AI assistant (similar to ChatGPT) created for Akash Shiv. "
            "Respond naturally, warmly, intelligently, and conversationally to ANY user message or query. "
            "If the user greets you ('hi', 'hello', 'good morning'), greet Akash warmly and ask how you can help. "
            "If the user asks about their habits or tasks, analyze the provided live workspace data and give a clear bulleted breakdown. "
            "If the user asks a general knowledge, coding, or productivity question, provide a thorough, structured, ChatGPT-style answer. "
            "Always address the user as Akash Shiv or Akash."
        )
        final_prompt = f"{system_instruction or default_system_prompt}\n\nUser Message: {prompt}"

        if not self.model:
            return self._fallback_chatgpt_response(prompt)

        try:
            response = self.model.generate_content(final_prompt)
            return response.text.strip()
        except Exception:
            return self._fallback_chatgpt_response(prompt)

    def _fallback_chatgpt_response(self, prompt: str) -> str:
        lower = prompt.lower()
        if any(w in lower for w in ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon']):
            return "👋 Hello Akash! Great to connect with you. How can I assist you with your habits, tasks, schedule, or productivity today?"
        if any(w in lower for w in ['habit', 'streak', 'routine']):
            return "🔥 Here is a quick check on your habits routine, Akash: Consistency is your super-power! Keep checking off your daily targets on your Habit Tracker."
        if any(w in lower for w in ['task', 'todo', 'kanban', 'work']):
            return "🎯 I'm ready to organize your workflow, Akash. You can ask me to create tasks (e.g., 'create high priority task...'), or review your Kanban board anytime."
        return f"I understand your message, Akash. I'm here to support your productivity, assist with your tasks, and help you maintain your daily streaks."

ai_service = AIService()
