"""
Configuration settings for the application
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Mananjary-mi"
    APP_ENV: str = "development"
    DEBUG: bool = True
    
    # Database - CORRIGÉ: nom de la base de données
    DATABASE_URL: str = "mysql+pymysql://root:@localhost:3306/mananjary-mi"
    # DATABASE_URL = "mysql+pymysql://mnjr2674672:4fgti2ufui@213.255.195.35:3306/mananjary-mi"
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Email
    MAIL_FROM: str = "noreply@mananjary-mi.mg"
    MAIL_FROM_NAME: str = "Mananjary-mi"
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 1025
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
