# ---------------------------------------------------------------------------
# DEPRECATED: models.py is kept as a compatibility shim only.
# All database logic has been moved to backend/db/:
#   backend.db.connection  — get_connection
#   backend.db.schema      — init_db
#   backend.db.users       — user auth & token functions
#   backend.db.sessions    — session CRUD
#   backend.db.tasks       — task & checkin functions
#
# Import directly from backend.db (or the sub-modules) in new code.
# ---------------------------------------------------------------------------

from backend.db import (  # noqa: F401
    authenticate_user,
    complete_session,
    complete_task,
    create_auth_token,
    create_session,
    create_tasks_for_session,
    delete_auth_token,
    delete_session,
    ensure_default_user,
    get_connection,
    get_session,
    get_session_progress,
    get_user_by_token,
    hash_password,
    init_db,
    list_sessions,
    register_user,
    verify_password,
)
