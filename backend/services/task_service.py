from backend.db import (
    complete_session,
    complete_task,
    create_session,
    create_tasks_for_session,
    get_session,
    get_session_progress,
)
from backend.db.tasks import get_task_with_next
from backend.services.ai_service import ai_service


def create_new_session(
    title: str,
    description: str | None = None,
    planning_mode: str = "ai",
    duration_minutes: int = 30,
    custom_tasks: list[str] | None = None,
    user_id: int | None = None,
) -> dict:
    cleaned_title = (title or "").strip()
    if not cleaned_title:
        raise ValueError("Session title is required.")

    duration = max(15, min(180, int(duration_minutes or 30)))
    mode = (planning_mode or "ai").lower()
    if mode not in {"ai", "manual"}:
        mode = "ai"

    session = create_session(cleaned_title, description, duration, user_id=user_id)

    if mode == "manual" and custom_tasks:
        cleaned_tasks = [t.strip() for t in custom_tasks if t and t.strip()]
        tasks = cleaned_tasks if cleaned_tasks else ai_service.generate_tasks(cleaned_title, planning_mode="manual", duration_minutes=duration)
    else:
        tasks = ai_service.generate_tasks(cleaned_title, planning_mode=mode, duration_minutes=duration)

    created_tasks = create_tasks_for_session(session["id"], tasks)
    return {
        "session_id": session["id"],
        "user_id": session.get("user_id"),
        "title": session["title"],
        "description": session["description"],
        "duration_minutes": session["duration_minutes"],
        "planning_mode": mode,
        "tasks": created_tasks,
    }


def get_session_details(session_id: int) -> dict | None:
    return get_session(session_id)


def advance_task(task_id: int, user_response: str) -> dict:
    curr, nxt = get_task_with_next(task_id)
    if not curr:
        raise ValueError(f"Task {task_id} not found")

    next_title = nxt["title"] if nxt else None
    ai_message = ai_service.generate_checkin_message(user_response, next_title)
    return complete_task(task_id, user_response, ai_message=ai_message)


def get_progress(session_id: int) -> dict:
    return get_session_progress(session_id)


def end_session(session_id: int) -> dict:
    return complete_session(session_id)

