"""
Dons routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.schemas import DonCreate, DonUpdate, DonResponse
from app.models.models import Don, User, LogActivite, ActorType

router = APIRouter()


@router.get("/", response_model=List[DonResponse])
async def get_dons(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all dons"""
    dons = db.query(Don).offset(skip).limit(limit).all()
    return dons


@router.get("/{don_id}", response_model=DonResponse)
async def get_don(don_id: int, db: Session = Depends(get_db)):
    """Get don by ID"""
    don = db.query(Don).filter(Don.id == don_id).first()
    if not don:
        raise HTTPException(status_code=404, detail="Don non trouvé")
    return don


@router.post("/", response_model=DonResponse, status_code=status.HTTP_201_CREATED)
async def create_don(don: DonCreate, db: Session = Depends(get_db)):
    """Create a new don"""
    
    # Verify user if provided
    if don.user_id:
        user = db.query(User).filter(User.id == don.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    db_don = Don(**don.model_dump())
    db.add(db_don)
    db.commit()
    db.refresh(db_don)
    
    # Log activity
    actor_id = don.user_id if don.user_id else 0
    log = LogActivite(
        acteur_type=ActorType.USER if don.user_id else ActorType.SYSTEM,
        acteur_id=actor_id,
        action=f"Nouveau don: {don.montant} Ar ({don.type_don.value})"
    )
    db.add(log)
    db.commit()
    
    return db_don


@router.put("/{don_id}", response_model=DonResponse)
async def update_don(don_id: int, don_update: DonUpdate, db: Session = Depends(get_db)):
    """Update don"""
    db_don = db.query(Don).filter(Don.id == don_id).first()
    if not db_don:
        raise HTTPException(status_code=404, detail="Don non trouvé")
    
    update_data = don_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_don, field, value)
    
    db.commit()
    db.refresh(db_don)
    
    return db_don


@router.delete("/{don_id}")
async def delete_don(don_id: int, db: Session = Depends(get_db)):
    """Delete don"""
    db_don = db.query(Don).filter(Don.id == don_id).first()
    if not db_don:
        raise HTTPException(status_code=404, detail="Don non trouvé")
    
    db.delete(db_don)
    db.commit()
    
    return {"message": "Don supprimé avec succès"}
