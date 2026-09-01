# Akash Workspace — Notion Clone Web Application

A modern, high-performance executive workspace web application with ChatGPT Warm Cream theme, JARVIS AI Assistant, Habit Tracker, Kanban Board, Focus Station, and Daily Journal.

---

## 🚀 Deployment Guide (Frontend on Vercel, Backend on Render)

### Step 1: Deploy Backend to Render

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** ➔ **Web Service**.
3. Connect your GitHub repository: `https://github.com/Akashshiv2005/AKASH-WORKSPACE`.
4. Configure service settings:
   - **Name**: `akash-workspace-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `DATABASE_URL` = `sqlite:///./notion_clone.db`
   - `CORS_ORIGINS` = `*`
   - `GEMINI_API_KEY` = `your_gemini_api_key`
   - `SECRET_KEY` = `your_secure_secret_key`
6. Click **Create Web Service**.
7. Copy your deployed Render Backend URL (e.g., `https://akash-workspace-backend.onrender.com`).

---

### Step 2: Deploy Frontend to Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/new).
2. Click **Import** on `AKASH-WORKSPACE` repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://akash-workspace-backend.onrender.com/api`
5. Click **Deploy**.

---

## 💻 Local Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
