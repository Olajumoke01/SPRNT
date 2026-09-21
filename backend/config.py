import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

for env_path in (PROJECT_ROOT / ".env", BASE_DIR / ".env"):
    if env_path.exists():
        load_dotenv(env_path, override=False)

db_env = os.getenv("DB_PATH")
DB_PATH = Path(db_env).resolve() if db_env else BASE_DIR / "sprnt.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)



class Settings:
    app_name: str = "Sprnt"
    database_url: str = f"sqlite:///{DB_PATH}"
    debug: bool = os.getenv("DEBUG", "true").lower() in {"1", "true", "yes"}
    ai_provider: str = os.getenv("AI_PROVIDER", "gemini").lower()
    ai_model: str = os.getenv("AI_MODEL", "gemini-3.6-flash")
    ai_api_key: str | None = os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY")


settings = Settings()

