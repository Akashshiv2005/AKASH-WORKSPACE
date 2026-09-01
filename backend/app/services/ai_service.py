import os
import random
import httpx
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

FALLBACK_MOTIVATIONS = [
  {
    "quote": "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    "author": "Aristotle",
    "mindset_tip": "Focus on taking one small action right now, Akash. Progress compounds exponentially.",
    "focus_question": "What is the single most important task you will complete today?"
  },
  {
    "quote": "Consistency beats intensity every single time. Protect your daily routines.",
    "author": "Aristotle",
    "mindset_tip": "Consistency beats intensity every single time. Protect your daily routines.",
    "focus_question": "Which positive habit will you protect at all costs today?"
  },
  {
    "quote": "Your time is limited, so don't waste it living someone else's life.",
    "author": "Steve Jobs",
    "mindset_tip": "Eliminate distractions and align your energy with your highest priorities.",
    "focus_question": "What one distraction will you say NO to today?"
  },
  {
    "quote": "Success is the sum of small efforts, repeated day in and day out.",
    "author": "Robert Collier",
    "mindset_tip": "Break big goals into daily checkmarks. Progress compounds exponentially.",
    "focus_question": "How will you celebrate your progress when you finish today's key goal?"
  },
  {
    "quote": "Do something today that your future self will thank you for.",
    "author": "Sean Patrick Flanery",
    "mindset_tip": "Small wins built every day create extraordinary long-term achievements.",
    "focus_question": "What small action today will make tomorrow significantly easier?"
  }
]

class AIService:
    @staticmethod
    async def get_daily_motivation(topic: str = "productivity") -> Dict[str, Any]:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return random.choice(FALLBACK_MOTIVATIONS)

        prompt = f"""
        You are JARVIS, an executive productivity AI assistant serving Akash Shiv.
        Provide an inspiring quote, author, a 1-sentence actionable mindset tip addressed to Akash, and a daily reflection question for '{topic}'.
        Format your response as valid JSON with keys:
        "quote", "author", "mindset_tip", "focus_question".
        Return only the JSON.
        """

        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    url,
                    json={"contents": [{"parts": [{"text": prompt}]}]}
                )
                if response.status_code == 200:
                    data = response.json()
                    text = data['candidates'][0]['content']['parts'][0]['text']
                    import json
                    clean_text = text.strip().replace("```json", "").replace("```", "").strip()
                    parsed = json.loads(clean_text)
                    return parsed
        except Exception:
            pass

        return random.choice(FALLBACK_MOTIVATIONS)

    @staticmethod
    async def chat_with_gemini(message: str) -> str:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return (
                "✨ **JARVIS Productivity Assistant**: At your service, Akash! Focus on breaking your top daily goal into 3 sub-tasks. "
                "Set a timer for 25 minutes of deep work, turn off notifications, and execute task #1!"
            )

        prompt = f"You are JARVIS, an executive productivity assistant serving Akash Shiv. User asks: '{message}'. Address the user as Akash. Keep response inspiring, concise, and helpful."
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    url,
                    json={"contents": [{"parts": [{"text": prompt}]}]}
                )
                if response.status_code == 200:
                    data = response.json()
                    return data['candidates'][0]['content']['parts'][0]['text']
        except Exception as e:
            return f"JARVIS Error: Unable to reach AI service. {str(e)}"

        return "Always at your service, Akash. Focus on your top priorities today!"
