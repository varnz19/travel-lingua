from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Travel-Lingua Backend"
    API_V1_STR: str = "/api/v1"

    # Supabase Configuration (Loaded from .env environment variables)
    SUPABASE_URL: str = "https://oaajgvymysdrfvmtpczf.supabase.co"
    SUPABASE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    DATABASE_URL: str = ""

    # Redis Cache Configuration
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS origins
    CORS_ORIGINS: List[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
