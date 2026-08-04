import aiosqlite
from app.config import get_settings

settings = get_settings()
DB_PATH = settings.db_path


async def init_db() -> None:
    """Create tables on startup."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS conversations (
                id          TEXT PRIMARY KEY,
                title       TEXT NOT NULL,
                created_at  TEXT NOT NULL,
                updated_at  TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS messages (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                role            TEXT NOT NULL,
                content         TEXT NOT NULL,
                created_at      TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS user_settings (
                id          INTEGER PRIMARY KEY CHECK (id = 1),
                model       TEXT NOT NULL DEFAULT 'llama-3.3-70b-versatile',
                temperature REAL NOT NULL DEFAULT 0.7,
                max_tokens  INTEGER NOT NULL DEFAULT 32768,
                theme       TEXT NOT NULL DEFAULT 'dark',
                font_size   TEXT NOT NULL DEFAULT 'medium'
            );

            INSERT OR IGNORE INTO user_settings (id) VALUES (1);
        """)
        await db.commit()


def get_db_path() -> str:
    return DB_PATH
