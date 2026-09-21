from pathlib import Path
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

if __package__ is None or __package__ == "":
    project_root = Path(__file__).resolve().parent.parent
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))

from backend.db import init_db
from backend.routes.auth import router as auth_router
from backend.routes.sessions import router as sessions_router
from backend.routes.tasks import router as tasks_router

init_db()

app = FastAPI(title="Sprnt", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(sessions_router)
app.include_router(tasks_router)


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok", "app": "Sprnt"}
