import os

try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    genai = None
    HAS_GENAI = False

from app.core.config import settings

class AIService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", "")
        if api_key and HAS_GENAI and genai:
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel("gemini-1.5-flash")
            except Exception as e:
                print(f"Failed to initialize Gemini AI: {e}")
                self.model = None
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
        # Extract actual user message if embedded in prompt context
        user_msg = prompt
        if "User Message:" in prompt:
            try:
                user_msg = prompt.split("User Message:")[1].split("\n")[0].replace('"', '').strip()
            except Exception:
                user_msg = prompt

        lower = user_msg.lower().strip()
        words = lower.split()

        # Check Task / Work / Today queries first (handles typos like 'waht is the today work', 'today work', 'task')
        if any(w in lower for w in ['task', 'todo', 'to do', 'work', 'today', 'board', 'job', 'list']):
            tasks_context = ""
            if "Akash's Tasks:" in prompt:
                try:
                    tasks_context = prompt.split("Akash's Tasks:")[1].split("- Akash's")[0].strip()
                except Exception:
                    pass
            if tasks_context and tasks_context != 'None':
                return f"🎯 Here is your Task Board summary for today, Akash:\n\n{tasks_context}\n\nYou can ask me anytime: 'Create task [title] with High Priority'!"
            return "🎯 I am ready to organize your workflow, Akash! Ask me anytime to view or create tasks on your Task Board."

        # Check Habit / Streak / Routine queries
        if any(w in lower for w in ['habit', 'streak', 'routine', 'daily']):
            habits_context = ""
            if "Akash's Active Habits:" in prompt:
                try:
                    habits_context = prompt.split("Akash's Active Habits:")[1].split("- Streak:")[0].strip()
                except Exception:
                    pass
            if habits_context and habits_context != 'None':
                return f"🔥 Here is your live Habit Tracker status, Akash:\n\n{habits_context}\n\nKeep up the consistency!"
            return "🔥 Consistency is your super-power, Akash! Keep checking off your daily targets on your Habit Tracker."

        # Check pure greetings
        if any(w in words for w in ['hi', 'hello', 'hey', 'greetings', 'sup', 'gm']) or lower in ['hi', 'hello', 'hey', 'greetings']:
            return "👋 Hello Akash! Great to connect with you. How can I assist you with your habits, tasks, schedule, or productivity today?"

        # Wellness
        if any(w in lower for w in ['tired', 'break', 'health', 'wellness', 'rest']):
            return "❤️ Akash, your health and energy are your greatest assets. Take a 5-minute breather, hydrate, and protect your focus. I'm here to handle the heavy lifting for you!"

        return f"I am on it, Akash! Regarding your query '{user_msg}': I am keeping your workspace synced. Let me know if you want me to list or create any tasks or habits for you!"

ai_service = AIService()
