"""
Notifications routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas.schemas import NotificationCreate, NotificationUpdate, NotificationResponse
from app.models.models import Notification, User

router = APIRouter()


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    skip: int = 0, 
    limit: int = 100,
    user_id: Optional[int] = None,
    lue: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get all notifications with optional filters"""
    query = db.query(Notification)
    
    if user_id:
        query = query.filter(Notification.id_user == user_id)
    
    if lue is not None:
        query = query.filter(Notification.lue == lue)
    
    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return notifications


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(notification_id: int, db: Session = Depends(get_db)):
    """Get notification by ID"""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification non trouvée")
    return notification


@router.get("/user/{user_id}", response_model=List[NotificationResponse])
async def get_user_notifications(user_id: int, db: Session = Depends(get_db)):
    """Get all notifications for a specific user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    notifications = db.query(Notification).filter(
        Notification.id_user == user_id
    ).order_by(Notification.created_at.desc()).all()
    return notifications


@router.get("/user/{user_id}/unread", response_model=List[NotificationResponse])
async def get_user_unread_notifications(user_id: int, db: Session = Depends(get_db)):
    """Get unread notifications for a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    notifications = db.query(Notification).filter(
        Notification.id_user == user_id,
        Notification.lue == False
    ).order_by(Notification.created_at.desc()).all()
    return notifications


@router.get("/user/{user_id}/unread-count")
async def get_unread_count(user_id: int, db: Session = Depends(get_db)):
    """Get count of unread notifications for a user"""
    count = db.query(Notification).filter(
        Notification.id_user == user_id,
        Notification.lue == False
    ).count()
    return {"count": count}


@router.post("/", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(notification: NotificationCreate, db: Session = Depends(get_db)):
    """Create a new notification"""
    
    # Verify user exists
    user = db.query(User).filter(User.id == notification.id_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    db_notification = Notification(**notification.model_dump())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    
    return db_notification


@router.patch("/{notification_id}/mark-read", response_model=NotificationResponse)
async def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    """Mark notification as read"""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification non trouvée")
    
    notification.lue = True
    db.commit()
    db.refresh(notification)
    
    return notification


@router.patch("/{notification_id}/mark-unread", response_model=NotificationResponse)
async def mark_notification_unread(notification_id: int, db: Session = Depends(get_db)):
    """Mark notification as unread"""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification non trouvée")
    
    notification.lue = False
    db.commit()
    db.refresh(notification)
    
    return notification


@router.post("/user/{user_id}/mark-all-read")
async def mark_all_notifications_read(user_id: int, db: Session = Depends(get_db)):
    """Mark all notifications as read for a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    db.query(Notification).filter(
        Notification.id_user == user_id,
        Notification.lue == False
    ).update({Notification.lue: True})
    
    db.commit()
    
    return {"message": "Toutes les notifications ont été marquées comme lues"}


@router.delete("/{notification_id}")
async def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    """Delete notification"""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification non trouvée")
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification supprimée avec succès"}


@router.delete("/user/{user_id}/clear-all")
async def clear_all_notifications(user_id: int, db: Session = Depends(get_db)):
    """Delete all notifications for a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    count = db.query(Notification).filter(Notification.id_user == user_id).delete()
    db.commit()
    
    return {"message": f"{count} notification(s) supprimée(s)"}
