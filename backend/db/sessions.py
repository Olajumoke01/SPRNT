from datetime import datetime

from backend.db.connection import get_connection
from backend.db.users import ensure_default_user


def create_session(
    title: str,
    description: str | None = None,
    duration_minutes: int = 30,
    user_id: int | None = None,
) -> dict:
    clean_title = (title or "").strip()
    if not clean_title:
        raise ValueError("Session title is required.")

    uid = user_id or ensure_default_user()
    now = datetime.utcnow().isoformat()
    duration = max(15, min(180, int(duration_minutes or 30)))
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO sessions (user_id, title, description, duration_minutes, status, created_at) VALUES (?, ?, ?, ?, 'active', ?)",
            (uid, clean_title, description.strip() if description else None, duration, now),
        )
        session_id = cursor.lastrowid
        conn.commit()
    return {
        "id": session_id,
        "user_id": uid,
        "title": clean_title,
        "description": description,
        "duration_minutes": duration,
        "status": "active",
        "created_at": now,
    }


def list_sessions(user_id: int | None = None) -> list[dict]:
    query = """
        SELECT 
            s.id,
            s.user_id,
            s.title,
            s.description,
            s.duration_minutes,
            s.status,
            s.created_at,
            s.completed_at,
            COUNT(t.id) AS total_tasks,
            COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0) AS completed_tasks
        FROM sessions s
        LEFT JOIN tasks t ON s.id = t.session_id
    """
    params: list = []
    if user_id is not None:
        query += " WHERE s.user_id = ?"
        params.append(user_id)
    query += " GROUP BY s.id ORDER BY s.created_at DESC"

    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
        return [dict(row) for row in rows]


def get_session(session_id: int) -> dict | None:
    with get_connection() as conn:
        session = conn.execute(
            "SELECT * FROM sessions WHERE id = ?", (session_id,)
        ).fetchone()
        if not session:
            return None
        tasks = conn.execute(
            "SELECT * FROM tasks WHERE session_id = ? ORDER BY order_index ASC",
            (session_id,),
        ).fetchall()
        checkins = conn.execute(
            "SELECT * FROM checkins WHERE session_id = ? ORDER BY timestamp ASC",
            (session_id,),
        ).fetchall()
        session_dict = dict(session)
    return {
        "id": session_dict["id"],
        "user_id": session_dict.get("user_id"),
        "title": session_dict["title"],
        "description": session_dict["description"],
        "duration_minutes": session_dict.get("duration_minutes", 30),
        "status": session_dict["status"],
        "created_at": session_dict["created_at"],
        "completed_at": session_dict["completed_at"],
        "tasks": [dict(t) for t in tasks],
        "checkins": [dict(c) for c in checkins],
    }


def delete_session(session_id: int, user_id: int | None = None) -> bool:
    with get_connection() as conn:
        if user_id is not None:
            sess = conn.execute(
                "SELECT id FROM sessions WHERE id = ? AND user_id = ?",
                (session_id, user_id),
            ).fetchone()
            if not sess:
                return False
        conn.execute("DELETE FROM checkins WHERE session_id = ?", (session_id,))
        conn.execute("DELETE FROM tasks WHERE session_id = ?", (session_id,))
        cursor = conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
        conn.commit()
        return cursor.rowcount > 0


def complete_session(session_id: int) -> dict:
    with get_connection() as conn:
        session = conn.execute(
            "SELECT * FROM sessions WHERE id = ?", (session_id,)
        ).fetchone()
        if not session:
            raise ValueError(f"Session {session_id} not found")

        stats = conn.execute(
            """
            SELECT 
                COUNT(*) AS total,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) AS completed
            FROM tasks
            WHERE session_id = ?
            """,
            (session_id,),
        ).fetchone()

        total = stats["total"] if stats else 0
        completed = stats["completed"] if stats else 0

        conn.execute(
            "UPDATE sessions SET status = 'completed', completed_at = ? WHERE id = ?",
            (datetime.utcnow().isoformat(), session_id),
        )
        conn.commit()

    session_dict = dict(session)
    return {
        "session_id": session_id,
        "title": session_dict["title"],
        "duration_minutes": session_dict.get("duration_minutes", 30),
        "tasks_done": completed,
        "total_tasks": total,
        "summary": f"You completed {completed} of {total} focus blocks.",
    }

