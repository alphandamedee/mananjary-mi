"""
Dons routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.schemas import DonCreate, DonResponse
from app.models.models import Don, User, LogActivite, ActorTypeEnum

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
    if don.id_user:
        user = db.query(User).filter(User.id == don.id_user).first()
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    db_don = Don(**don.model_dump())
    db.add(db_don)
    db.commit()
    db.refresh(db_don)
    
    # Log activity
    actor_id = don.id_user if don.id_user else 0
    log = LogActivite(
        acteur_type=ActorTypeEnum.USER if don.id_user else ActorTypeEnum.USER,
        acteur_id=actor_id,
        action="Nouveau don",
        description=f"{don.montant} Ar - Anonyme: {don.anonyme}"
    )
    db.add(log)
    db.commit()
    
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
