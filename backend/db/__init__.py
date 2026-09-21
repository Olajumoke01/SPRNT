# Re-export the full public surface so callers can do:
#   from backend.db import get_connection, init_db, register_user, ...
from backend.db.connection import get_connection
from backend.db.schema import init_db
from backend.db.sessions import (
    complete_session,
    create_session,
    delete_session,
    get_session,
    list_sessions,
)
from backend.db.tasks import (
    complete_task,
    create_tasks_for_session,
    get_session_progress,
)
from backend.db.users import (
    authenticate_user,
    create_auth_token,
    delete_auth_token,
    ensure_default_user,
    get_user_by_token,
    hash_password,
    register_user,
    verify_password,
)

__all__ = [
    # connection
    "get_connection",
    # schema
    "init_db",
    # sessions
    "complete_session",
    "create_session",
    "delete_session",
    "get_session",
    "list_sessions",
    # tasks
    "complete_task",
    "create_tasks_for_session",
    "get_session_progress",
    # users / auth
    "authenticate_user",
    "create_auth_token",
    "delete_auth_token",
    "ensure_default_user",
    "get_user_by_token",
    "hash_password",
    "register_user",
    "verify_password",
]
