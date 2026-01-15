"""
Evenements routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.schemas import EvenementCreate, EvenementUpdate, EvenementResponse
from app.models.models import Evenement, Admin, LogActivite, ActorType

router = APIRouter()


@router.get("/", response_model=List[EvenementResponse])
async def get_evenements(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all evenements"""
    evenements = db.query(Evenement).offset(skip).limit(limit).all()
    return evenements


@router.get("/{evenement_id}", response_model=EvenementResponse)
async def get_evenement(evenement_id: int, db: Session = Depends(get_db)):
    """Get evenement by ID"""
    evenement = db.query(Evenement).filter(Evenement.id == evenement_id).first()
    if not evenement:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    return evenement


@router.post("/", response_model=EvenementResponse, status_code=status.HTTP_201_CREATED)
async def create_evenement(evenement: EvenementCreate, db: Session = Depends(get_db)):
    """Create a new evenement"""
    
    # Verify admin exists
    admin = db.query(Admin).filter(Admin.id == evenement.id_admin).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin non trouvé")
    
    db_evenement = Evenement(**evenement.model_dump())
    db.add(db_evenement)
    db.commit()
    db.refresh(db_evenement)
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorType.ADMIN,
        acteur_id=evenement.id_admin,
        action=f"Nouvel événement: {evenement.titre}"
    )
    db.add(log)
    db.commit()
    
    return db_evenement


@router.put("/{evenement_id}", response_model=EvenementResponse)
async def update_evenement(evenement_id: int, evenement_update: EvenementUpdate, db: Session = Depends(get_db)):
    """Update evenement"""
    db_evenement = db.query(Evenement).filter(Evenement.id == evenement_id).first()
    if not db_evenement:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    
    update_data = evenement_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_evenement, field, value)
    
    db.commit()
    db.refresh(db_evenement)
    
    return db_evenement


@router.delete("/{evenement_id}")
async def delete_evenement(evenement_id: int, db: Session = Depends(get_db)):
    """Delete evenement"""
    db_evenement = db.query(Evenement).filter(Evenement.id == evenement_id).first()
    if not db_evenement:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    
    db.delete(db_evenement)
    db.commit()
    
    return {"message": "Événement supprimé avec succès"}
