import hashlib
import secrets
from datetime import datetime

from backend.db.connection import get_connection


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}${key.hex()}"


def verify_password(password: str, hashed: str | None) -> bool:
    if not hashed or "$" not in hashed:
        return False
    try:
        salt, key_hex = hashed.split("$", 1)
        test_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
        return secrets.compare_digest(test_key.hex(), key_hex)
    except Exception:
        return False


def register_user(username: str, password: str) -> dict:
    import sqlite3

    clean_user = username.strip()
    if not clean_user:
        raise ValueError("Username cannot be empty.")
    if len(clean_user) < 3:
        raise ValueError("Username must be at least 3 characters.")
    if len(password) < 4:
        raise ValueError("Password must be at least 4 characters.")

    password_hash = hash_password(password)
    now = datetime.utcnow().isoformat()
    with get_connection() as conn:
        try:
            cursor = conn.execute(
                "INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)",
                (clean_user, password_hash, now),
            )
            conn.commit()
            user_id = cursor.lastrowid
        except sqlite3.IntegrityError:
            raise ValueError("That username is already taken. Please choose another.")
    return {"id": user_id, "username": clean_user, "created_at": now}


def authenticate_user(username: str, password: str) -> dict | None:
    clean_user = username.strip()
    if not clean_user or not password:
        return None
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE username = ?", (clean_user,)).fetchone()
        if not row:
            return None
        if not verify_password(password, row["password_hash"]):
            return None
        return {"id": row["id"], "username": row["username"], "created_at": row["created_at"]}


def ensure_default_user() -> int:
    with get_connection() as conn:
        row = conn.execute("SELECT id FROM users WHERE username = 'default' LIMIT 1").fetchone()
        if row:
            return row["id"]
        now = datetime.utcnow().isoformat()
        cursor = conn.execute(
            "INSERT INTO users (username, created_at) VALUES (?, ?)",
            ("default", now),
        )
        conn.commit()
        return cursor.lastrowid


def create_auth_token(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    now = datetime.utcnow().isoformat()
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO auth_tokens (token, user_id, created_at) VALUES (?, ?, ?)",
            (token, user_id, now),
        )
        conn.commit()
    return token


def get_user_by_token(token: str) -> dict | None:
    if not token:
        return None
    with get_connection() as conn:
        row = conn.execute(
            """
            SELECT u.id, u.username, u.created_at
            FROM users u
            JOIN auth_tokens t ON u.id = t.user_id
            WHERE t.token = ?
            """,
            (token,),
        ).fetchone()
        if row:
            return dict(row)
        return None


def delete_auth_token(token: str) -> None:
    with get_connection() as conn:
        conn.execute("DELETE FROM auth_tokens WHERE token = ?", (token,))
        conn.commit()
