# PyMentor AI 🐍

**Python-Only AI Tutor powered by the xAI Grok API**

---

## Features

- 🎯 **Python-Only** — refuses non-Python questions with a polite message
- ⚡ **Streaming responses** via Server-Sent Events
- 🎨 **Premium dark UI** — glassmorphism, gradients, animations
- 💬 **Persistent conversation history** with SQLite
- 📝 **Markdown + syntax highlighting** for Python, JSON, Bash, SQL
- ⚙️ **Settings** — model, temperature, max tokens, theme, font size
- 📱 **Responsive** — works on mobile

---

## Setup

### 1. Get your xAI API Key

Sign up at [https://console.x.ai/](https://console.x.ai/) and get your API key.

---

### 2. Backend

```bash
cd backend

# Add your API key
# Edit .env and set XAI_API_KEY=your_key_here

# Create a virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python run.py
```

The FastAPI backend will run at **http://localhost:8000**

API docs: **http://localhost:8000/docs**

---

### 3. Frontend

```bash
cd frontend

# Install dependencies (already done during setup)
npm install

# Start the dev server
npm run dev
```

The React frontend will run at **http://localhost:5173**

---

## Project Structure

```
Python bot/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── config.py            # Settings from .env
│   │   ├── models.py            # Pydantic schemas
│   │   ├── db/database.py       # SQLite setup
│   │   ├── services/
│   │   │   ├── grok.py          # Grok streaming client
│   │   │   └── history.py       # Conversation CRUD
│   │   └── routers/
│   │       ├── chat.py          # POST /chat (SSE)
│   │       ├── history.py       # GET/DELETE /history
│   │       └── settings_router.py
│   ├── .env                     # XAI_API_KEY goes here
│   ├── requirements.txt
│   └── run.py
│
└── frontend/
    ├── src/
    │   ├── components/          # Chat, Sidebar, Settings, UI
    │   ├── hooks/               # useChat, useSettings
    │   ├── lib/api.ts           # Axios + SSE client
    │   ├── pages/               # ChatPage, HistoryPage, etc.
    │   └── types/index.ts
    └── vite.config.ts
```

---

## API Endpoints

| Method | Path              | Description               |
|--------|-------------------|---------------------------|
| POST   | `/chat`           | Stream chat response (SSE)|
| GET    | `/history`        | List all conversations    |
| GET    | `/history/{id}`   | Get conversation messages |
| PATCH  | `/history/{id}`   | Rename conversation       |
| DELETE | `/history/{id}`   | Delete conversation       |
| GET    | `/settings`       | Get user settings         |
| POST   | `/settings`       | Update user settings      |

---

## Configuration (`.env`)

```env
XAI_API_KEY=your_key_here
MODEL=grok-3
MAX_TOKENS=4096
TEMPERATURE=0.7
```

---

## Tech Stack

| Layer     | Technology               |
|-----------|--------------------------|
| AI        | xAI Grok API (OpenAI-compatible) |
| Backend   | FastAPI + Uvicorn        |
| DB        | SQLite (aiosqlite)       |
| Frontend  | React + TypeScript + Vite |
| Styling   | Vanilla CSS (custom design system) |
| Markdown  | react-markdown + remark-gfm |
| Syntax HL | highlight.js             |
| Animation | Framer Motion            |
