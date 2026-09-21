from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from backend.db import (
    authenticate_user,
    create_auth_token,
    delete_auth_token,
    get_user_by_token,
    register_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])


class AuthCredentials(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)



def extract_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    parts = authorization.strip().split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    if len(parts) == 1:
        return parts[0]
    return None


def get_current_user_required(authorization: str | None = Header(None)) -> dict:
    token = extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication token required.")
    user = get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session token.")
    return user


def get_current_user_optional(authorization: str | None = Header(None)) -> dict | None:
    token = extract_token(authorization)
    if not token:
        return None
    return get_user_by_token(token)


@router.post("/register")
def register_route(credentials: AuthCredentials):
    try:
        user = register_user(credentials.username, credentials.password)
        token = create_auth_token(user["id"])
        return {"token": token, "user": user}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
def login_route(credentials: AuthCredentials):
    user = authenticate_user(credentials.username, credentials.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password.")
    token = create_auth_token(user["id"])
    return {"token": token, "user": user}


@router.get("/me")
def me_route(authorization: str | None = Header(None)):
    user = get_current_user_required(authorization)
    return {"user": user}


@router.post("/logout")
def logout_route(authorization: str | None = Header(None)):
    token = extract_token(authorization)
    if token:
        delete_auth_token(token)
    return {"logged_out": True}
