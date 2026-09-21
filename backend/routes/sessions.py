from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from backend.db import delete_session, get_session, list_sessions
from backend.routes.auth import get_current_user_optional
from backend.services.task_service import create_new_session, end_session, get_progress

router = APIRouter(prefix="/sessions", tags=["sessions"])


class SessionCreateRequest(BaseModel):
    title: str = Field(..., min_length=1)
    description: str | None = None
    planning_mode: str = "ai"
    duration_minutes: int = 30
    tasks: list[str] | None = None


@router.get("")
@router.get("/")
def list_sessions_route(authorization: str | None = Header(None)):
    user = get_current_user_optional(authorization)
    user_id = user["id"] if user else None
    return list_sessions(user_id=user_id)


@router.post("")
@router.post("/")
def create_session_route(payload: SessionCreateRequest, authorization: str | None = Header(None)):
    cleaned_title = payload.title.strip()
    if not cleaned_title:
        raise HTTPException(status_code=400, detail="Title is required.")

    user = get_current_user_optional(authorization)
    user_id = user["id"] if user else None

    try:
        return create_new_session(
            title=cleaned_title,
            description=payload.description,
            planning_mode=payload.planning_mode,
            duration_minutes=payload.duration_minutes,
            custom_tasks=payload.tasks,
            user_id=user_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")


@router.get("/{session_id}")
def get_session_route(session_id: int):
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.delete("/{session_id}")
def delete_session_route(session_id: int, authorization: str | None = Header(None)):
    user = get_current_user_optional(authorization)
    user_id = user["id"] if user else None
    deleted = delete_session(session_id, user_id=user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found or permission denied.")
    return {"deleted": True, "session_id": session_id}


@router.get("/{session_id}/progress")
def get_progress_route(session_id: int):
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return get_progress(session_id)


@router.post("/{session_id}/end")
def end_session_route(session_id: int):
    try:
        return end_session(session_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


