"""
Logs routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas.schemas import LogActiviteResponse
from app.models.models import LogActivite, ActorTypeEnum

router = APIRouter()


@router.get("/", response_model=List[LogActiviteResponse])
async def get_logs(
    skip: int = 0, 
    limit: int = 100,
    acteur_type: Optional[ActorTypeEnum] = None,
    db: Session = Depends(get_db)
):
    """Get all activity logs with optional filters"""
    query = db.query(LogActivite)
    
    if acteur_type:
        query = query.filter(LogActivite.acteur_type == acteur_type)
    
    logs = query.order_by(LogActivite.created_at.desc()).offset(skip).limit(limit).all()
    return logs


@router.get("/recent", response_model=List[LogActiviteResponse])
async def get_recent_logs(limit: int = 50, db: Session = Depends(get_db)):
    """Get recent activity logs"""
    logs = db.query(LogActivite).order_by(LogActivite.created_at.desc()).limit(limit).all()
    return logs


@router.get("/by-user/{user_id}", response_model=List[LogActiviteResponse])
async def get_user_logs(user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get logs for a specific user"""
    logs = db.query(LogActivite).filter(
        LogActivite.acteur_id == user_id
    ).order_by(LogActivite.created_at.desc()).offset(skip).limit(limit).all()
    return logs
