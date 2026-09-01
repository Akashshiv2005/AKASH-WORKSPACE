# Notion Clone — Production Workspace Application

A production-grade, modular Notion clone built with FastAPI, PostgreSQL, SQLAlchemy 2.0, React, TypeScript, and Tailwind CSS.

## Features
- **Authentication**: JWT access/refresh token authentication with secure password hashing.
- **Workspaces & Members**: Multi-workspace management with role-based member permissions.
- **Hierarchical Pages**: Unlimited nested pages, drag & drop ordering, favorites, archive, and trash recovery.
- **Rich Text Block Editor**: Block-based editor powered by Tiptap with slash commands (`/heading`, `/todo`, `/bullet`, `/code`, `/quote`, `/divider`), images, and debounced auto-save.
- **Databases**: Inline Notion-style databases supporting custom properties (text, number, select, multi-select, checkbox, date, URL, email, person), views (Table, Board, List), dynamic filtering, and multi-column sorting.
- **Search & Productivity**: Quick search modal (`Cmd/Ctrl + K`), dark/light theme switching, and responsive design.

---

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Zustand, Tiptap
- **Backend**: FastAPI, Python 3.12+, Pydantic v2, SQLAlchemy 2.0, Alembic, psycopg2 / asyncpg
- **Database**: PostgreSQL 17

---

## Quickstart (Local Development)

### 1. Database Setup
Ensure PostgreSQL is running and create the database:
```sql
CREATE DATABASE notion_clone;
```

### 2. Backend Setup
```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will be available at [http://localhost:8000](http://localhost:8000) and Interactive Docs at [http://localhost:8000/docs](http://localhost:8000/docs).

### 3. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
Frontend will be accessible at [http://localhost:5173](http://localhost:5173).
