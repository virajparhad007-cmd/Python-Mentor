import aiosqlite
import uuid
from datetime import datetime, timezone
from app.db.database import get_db_path
from app.models import ConversationSummary, ConversationDetail, ChatMessage, UserSettings


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ──────────────────────────────────────────────
# Conversations
# ──────────────────────────────────────────────

async def create_conversation(title: str = "New Chat") -> str:
    """Create a new conversation and return its ID."""
    conv_id = str(uuid.uuid4())
    now = _now()
    async with aiosqlite.connect(get_db_path()) as db:
        await db.execute(
            "INSERT INTO conversations (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
            (conv_id, title, now, now),
        )
        await db.commit()
    return conv_id


async def get_all_conversations() -> list[ConversationSummary]:
    async with aiosqlite.connect(get_db_path()) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            """
            SELECT c.id, c.title, c.created_at, c.updated_at,
                   COUNT(m.id) AS message_count
            FROM conversations c
            LEFT JOIN messages m ON m.conversation_id = c.id
            GROUP BY c.id
            ORDER BY c.updated_at DESC
            """
        ) as cursor:
            rows = await cursor.fetchall()
    return [
        ConversationSummary(
            id=r["id"],
            title=r["title"],
            created_at=r["created_at"],
            updated_at=r["updated_at"],
            message_count=r["message_count"],
        )
        for r in rows
    ]


async def get_conversation(conv_id: str) -> ConversationDetail | None:
    async with aiosqlite.connect(get_db_path()) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM conversations WHERE id = ?", (conv_id,)
        ) as cursor:
            conv = await cursor.fetchone()
        if not conv:
            return None
        async with db.execute(
            "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY id",
            (conv_id,),
        ) as cursor:
            msgs = await cursor.fetchall()
    return ConversationDetail(
        id=conv["id"],
        title=conv["title"],
        created_at=conv["created_at"],
        updated_at=conv["updated_at"],
        messages=[ChatMessage(role=m["role"], content=m["content"]) for m in msgs],
    )


async def rename_conversation(conv_id: str, title: str) -> bool:
    async with aiosqlite.connect(get_db_path()) as db:
        cursor = await db.execute(
            "UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?",
            (title, _now(), conv_id),
        )
        await db.commit()
        return cursor.rowcount > 0


async def delete_conversation(conv_id: str) -> bool:
    async with aiosqlite.connect(get_db_path()) as db:
        cursor = await db.execute(
            "DELETE FROM conversations WHERE id = ?", (conv_id,)
        )
        await db.commit()
        return cursor.rowcount > 0


# ──────────────────────────────────────────────
# Messages
# ──────────────────────────────────────────────

async def add_message(conv_id: str, role: str, content: str) -> None:
    now = _now()
    async with aiosqlite.connect(get_db_path()) as db:
        await db.execute(
            "INSERT INTO messages (conversation_id, role, content, created_at) VALUES (?, ?, ?, ?)",
            (conv_id, role, content, now),
        )
        await db.execute(
            "UPDATE conversations SET updated_at = ? WHERE id = ?", (now, conv_id)
        )
        await db.commit()


async def get_messages(conv_id: str) -> list[ChatMessage]:
    async with aiosqlite.connect(get_db_path()) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY id",
            (conv_id,),
        ) as cursor:
            rows = await cursor.fetchall()
    return [ChatMessage(role=r["role"], content=r["content"]) for r in rows]


async def update_conversation_title_from_message(conv_id: str, user_msg: str) -> None:
    """Auto-title a conversation from the first user message (truncated)."""
    title = (user_msg[:50] + "…") if len(user_msg) > 50 else user_msg
    async with aiosqlite.connect(get_db_path()) as db:
        async with db.execute(
            "SELECT COUNT(*) as cnt FROM messages WHERE conversation_id = ?", (conv_id,)
        ) as cursor:
            row = await cursor.fetchone()
        if row and row[0] == 0:
            await db.execute(
                "UPDATE conversations SET title = ? WHERE id = ?", (title, conv_id)
            )
            await db.commit()


# ──────────────────────────────────────────────
# User Settings
# ──────────────────────────────────────────────

async def get_settings_from_db() -> UserSettings:
    async with aiosqlite.connect(get_db_path()) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM user_settings WHERE id = 1") as cursor:
            row = await cursor.fetchone()
    if not row:
        return UserSettings()
    return UserSettings(
        model=row["model"],
        temperature=row["temperature"],
        max_tokens=row["max_tokens"],
        theme=row["theme"],
        font_size=row["font_size"],
    )


async def save_settings_to_db(s: UserSettings) -> None:
    async with aiosqlite.connect(get_db_path()) as db:
        await db.execute(
            """
            INSERT INTO user_settings (id, model, temperature, max_tokens, theme, font_size)
            VALUES (1, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                model       = excluded.model,
                temperature = excluded.temperature,
                max_tokens  = excluded.max_tokens,
                theme       = excluded.theme,
                font_size   = excluded.font_size
            """,
            (s.model, s.temperature, s.max_tokens, s.theme, s.font_size),
        )
        await db.commit()
