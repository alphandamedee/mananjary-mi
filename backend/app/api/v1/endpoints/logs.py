"""
Logs routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.schemas import LogActiviteResponse
from app.models.models import LogActivite

router = APIRouter()


@router.get("/", response_model=List[LogActiviteResponse])
async def get_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all activity logs"""
    logs = db.query(LogActivite).order_by(LogActivite.date_action.desc()).offset(skip).limit(limit).all()
    return logs


@router.get("/recent", response_model=List[LogActiviteResponse])
async def get_recent_logs(limit: int = 50, db: Session = Depends(get_db)):
    """Get recent activity logs"""
    logs = db.query(LogActivite).order_by(LogActivite.date_action.desc()).limit(limit).all()
    return logs
