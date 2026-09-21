from backend.db.connection import get_connection


def init_db() -> None:
    with get_connection() as conn:
        session_columns = conn.execute("PRAGMA table_info(sessions)").fetchall()
        has_duration = any(column[1] == "duration_minutes" for column in session_columns)

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT,
                created_at TEXT NOT NULL
            )
            """
        )
        user_columns = conn.execute("PRAGMA table_info(users)").fetchall()
        has_password = any(column[1] == "password_hash" for column in user_columns)
        if not has_password:
            try:
                conn.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")
            except Exception:
                pass

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS auth_tokens (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
            """
        )

        if not has_duration:
            try:
                conn.execute(
                    "ALTER TABLE sessions ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 30"
                )
            except Exception:
                pass

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title TEXT NOT NULL,
                description TEXT,
                duration_minutes INTEGER NOT NULL DEFAULT 30,
                status TEXT NOT NULL DEFAULT 'active',
                created_at TEXT NOT NULL,
                completed_at TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                order_index INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'todo',
                created_at TEXT NOT NULL,
                completed_at TEXT,
                FOREIGN KEY(session_id) REFERENCES sessions(id)
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS checkins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                task_id INTEGER,
                timestamp TEXT NOT NULL,
                user_response TEXT,
                ai_message TEXT,
                FOREIGN KEY(session_id) REFERENCES sessions(id),
                FOREIGN KEY(task_id) REFERENCES tasks(id)
            )
            """
        )
        conn.commit()
