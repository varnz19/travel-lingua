from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Travel-Lingua Backend"
    API_V1_STR: str = "/api/v1"

    # Supabase Configuration
    SUPABASE_URL: str = "https://oaajgvymysdrfvmtpczf.supabase.co"
    SUPABASE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hYWpndnlteXNkcmZ2bXRwY3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MTM4ODMsImV4cCI6MjEwMjk4OTg4M30.C4-XkLtrHemz4wmqSy0z5Owx1YIjtR1IKBCgfzi_eME"
    SUPABASE_JWT_SECRET: str = "super-secret-supabase-jwt-key-for-development"

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
