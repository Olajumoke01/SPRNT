from datetime import datetime

from backend.db.connection import get_connection


def create_tasks_for_session(session_id: int, task_titles: list[str]) -> list[dict]:
    with get_connection() as conn:
        created = []
        for order_index, raw_title in enumerate(task_titles, start=1):
            title = (raw_title or "").strip()
            if not title:
                continue
            now = datetime.utcnow().isoformat()
            cursor = conn.execute(
                "INSERT INTO tasks (session_id, title, description, order_index, status, created_at) VALUES (?, ?, ?, ?, 'todo', ?)",
                (session_id, title, None, order_index, now),
            )
            created.append({
                "id": cursor.lastrowid,
                "session_id": session_id,
                "title": title,
                "description": None,
                "order_index": order_index,
                "status": "todo",
                "created_at": now,
            })
        conn.commit()
    return created


def get_task_with_next(task_id: int) -> tuple[dict | None, dict | None]:
    """Returns (current_task, next_task) or (None, None) if current_task is not found."""
    with get_connection() as conn:
        curr = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
        if not curr:
            return None, None
        nxt = conn.execute(
            """
            SELECT * FROM tasks 
            WHERE session_id = ? AND order_index > ? AND status != 'completed' 
            ORDER BY order_index ASC LIMIT 1
            """,
            (curr["session_id"], curr["order_index"]),
        ).fetchone()
        return dict(curr), dict(nxt) if nxt else None


def get_session_progress(session_id: int) -> dict:
    with get_connection() as conn:
        tasks = conn.execute(
            "SELECT * FROM tasks WHERE session_id = ? ORDER BY order_index ASC",
            (session_id,),
        ).fetchall()
        task_list = [dict(t) for t in tasks]
        total = len(task_list)
        tasks_done = [t for t in task_list if t["status"] == "completed"]
        return {
            "completed_count": len(tasks_done),
            "total_count": total,
            "tasks_done": tasks_done,
        }


def complete_task(task_id: int, user_response: str, ai_message: str | None = None) -> dict:
    with get_connection() as conn:
        curr = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
        if not curr:
            raise ValueError(f"Task {task_id} not found")

        curr_dict = dict(curr)
        nxt = conn.execute(
            """
            SELECT * FROM tasks 
            WHERE session_id = ? AND order_index > ? AND status != 'completed' 
            ORDER BY order_index ASC LIMIT 1
            """,
            (curr_dict["session_id"], curr_dict["order_index"]),
        ).fetchone()
        nxt_dict = dict(nxt) if nxt else None

        message = ai_message
        if not message:
            if nxt_dict:
                message = f"Nice work finishing '{curr_dict['title']}'. Next up: {nxt_dict['title']}."
            else:
                message = f"Excellent! You completed '{curr_dict['title']}'. This session is ready to wrap up."

        now = datetime.utcnow().isoformat()
        conn.execute(
            "UPDATE tasks SET status = 'completed', completed_at = ? WHERE id = ?",
            (now, task_id),
        )
        conn.execute(
            "INSERT INTO checkins (session_id, task_id, timestamp, user_response, ai_message) VALUES (?, ?, ?, ?, ?)",
            (curr_dict["session_id"], task_id, now, user_response.strip(), message),
        )
        conn.commit()

    return {
        "completed": True,
        "next_task": nxt_dict,
        "ai_message": message,
    }

