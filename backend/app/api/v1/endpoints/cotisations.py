"""
Cotisations routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.schemas import CotisationCreate, CotisationUpdate, CotisationResponse
from app.models.models import Cotisation, User, LogActivite, ActorTypeEnum

router = APIRouter()


@router.get("/", response_model=List[CotisationResponse])
async def get_cotisations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all cotisations"""
    cotisations = db.query(Cotisation).offset(skip).limit(limit).all()
    return cotisations


@router.get("/{cotisation_id}", response_model=CotisationResponse)
async def get_cotisation(cotisation_id: int, db: Session = Depends(get_db)):
    """Get cotisation by ID"""
    cotisation = db.query(Cotisation).filter(Cotisation.id == cotisation_id).first()
    if not cotisation:
        raise HTTPException(status_code=404, detail="Cotisation non trouvée")
    return cotisation


@router.post("/", response_model=CotisationResponse, status_code=status.HTTP_201_CREATED)
async def create_cotisation(cotisation: CotisationCreate, db: Session = Depends(get_db)):
    """Create a new cotisation"""
    
    # Verify user exists
    user = db.query(User).filter(User.id == cotisation.id_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    db_cotisation = Cotisation(**cotisation.model_dump())
    db.add(db_cotisation)
    db.commit()
    db.refresh(db_cotisation)
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorTypeEnum.USER,
        acteur_id=cotisation.id_user,
        action="Nouvelle cotisation",
        description=f"{cotisation.montant} Ar - {cotisation.moyen_paiement.value}"
    )
    db.add(log)
    db.commit()
    
    return db_cotisation


@router.put("/{cotisation_id}", response_model=CotisationResponse)
async def update_cotisation(cotisation_id: int, cotisation_update: CotisationUpdate, db: Session = Depends(get_db)):
    """Update cotisation"""
    db_cotisation = db.query(Cotisation).filter(Cotisation.id == cotisation_id).first()
    if not db_cotisation:
        raise HTTPException(status_code=404, detail="Cotisation non trouvée")
    
    update_data = cotisation_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_cotisation, field, value)
    
    db.commit()
    db.refresh(db_cotisation)
    
    return db_cotisation


@router.delete("/{cotisation_id}")
async def delete_cotisation(cotisation_id: int, db: Session = Depends(get_db)):
    """Delete cotisation"""
    db_cotisation = db.query(Cotisation).filter(Cotisation.id == cotisation_id).first()
    if not db_cotisation:
        raise HTTPException(status_code=404, detail="Cotisation non trouvée")
    
    db.delete(db_cotisation)
    db.commit()
    
    return {"message": "Cotisation supprimée avec succès"}
