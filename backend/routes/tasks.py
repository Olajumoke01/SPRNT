from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.services.task_service import advance_task

router = APIRouter(prefix="/tasks", tags=["tasks"])


class CompleteTaskRequest(BaseModel):
    user_response: str


@router.post("/{task_id}/complete")
def complete_task_route(task_id: int, payload: CompleteTaskRequest):
    cleaned_response = payload.user_response.strip()
    if not cleaned_response:
        raise HTTPException(status_code=400, detail="User response is required.")
    try:
        return advance_task(task_id, cleaned_response)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

