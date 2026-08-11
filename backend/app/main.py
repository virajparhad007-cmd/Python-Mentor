from dotenv import load_dotenv
load_dotenv()  # Load .env into os.environ (no-op on Render where vars are already set)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.db.database import init_db
from app.routers import chat, history
from app.routers.settings_router import router as settings_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the database on startup."""
    await init_db()
    yield


app = FastAPI(
    title="PyMentor AI API",
    description="Python-only AI tutor powered by the xAI Grok API.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────
app.include_router(chat.router)
app.include_router(history.router)
app.include_router(settings_router)


@app.get("/", tags=["health"])
async def health():
    return {"status": "ok", "service": "PyMentor AI", "version": "1.0.0"}
