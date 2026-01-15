"""
Tragnobe routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.schemas import TragnobeCreate, TragnobeUpdate, TragnobeResponse
from app.models.models import Tragnobe, LogActivite, ActorTypeEnum
from app.core.security import get_current_user

router = APIRouter()


@router.get("/", response_model=List[TragnobeResponse])
async def get_tragnobes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all tragnobes"""
    tragnobes = db.query(Tragnobe).offset(skip).limit(limit).all()
    return tragnobes


@router.get("/{tragnobe_id}", response_model=TragnobeResponse)
async def get_tragnobe(tragnobe_id: int, db: Session = Depends(get_db)):
    """Get tragnobe by ID"""
    tragnobe = db.query(Tragnobe).filter(Tragnobe.id == tragnobe_id).first()
    if not tragnobe:
        raise HTTPException(status_code=404, detail="Tragnobe non trouvé")
    return tragnobe


@router.post("/", response_model=TragnobeResponse, status_code=status.HTTP_201_CREATED)
async def create_tragnobe(
    tragnobe: TragnobeCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new tragnobe"""
    
    # Check if name exists
    existing = db.query(Tragnobe).filter(Tragnobe.nom == tragnobe.nom).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ce nom de tragnobe existe déjà")
    
    db_tragnobe = Tragnobe(**tragnobe.model_dump())
    db.add(db_tragnobe)
    db.commit()
    db.refresh(db_tragnobe)
    
    # Log activity with actual user
    log = LogActivite(
        acteur_type=ActorTypeEnum(current_user.get("user_type", "user")),
        acteur_id=current_user.get("user_id", 0),
        action="Création tragnobe",
        description=f"Tragnobe: {db_tragnobe.nom}"
    )
    db.add(log)
    db.commit()
    
    return db_tragnobe


@router.put("/{tragnobe_id}", response_model=TragnobeResponse)
async def update_tragnobe(
    tragnobe_id: int,
    tragnobe_update: TragnobeUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update tragnobe"""
    db_tragnobe = db.query(Tragnobe).filter(Tragnobe.id == tragnobe_id).first()
    if not db_tragnobe:
        raise HTTPException(status_code=404, detail="Tragnobe non trouvé")
    
    update_data = tragnobe_update.model_dump(exclude_unset=True)
    
    # Check name uniqueness if being updated
    if 'nom' in update_data:
        existing = db.query(Tragnobe).filter(
            Tragnobe.nom == update_data['nom'],
            Tragnobe.id != tragnobe_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Ce nom de tragnobe existe déjà")
    
    for field, value in update_data.items():
        setattr(db_tragnobe, field, value)
    
    db.commit()
    db.refresh(db_tragnobe)
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorTypeEnum(current_user.get("user_type", "user")),
        acteur_id=current_user.get("user_id", 0),
        action="Modification tragnobe",
        description=f"Tragnobe: {db_tragnobe.nom}"
    )
    db.add(log)
    db.commit()
    
    return db_tragnobe


@router.delete("/{tragnobe_id}")
async def delete_tragnobe(
    tragnobe_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete tragnobe"""
    db_tragnobe = db.query(Tragnobe).filter(Tragnobe.id == tragnobe_id).first()
    if not db_tragnobe:
        raise HTTPException(status_code=404, detail="Tragnobe non trouvé")
    
    tragnobe_nom = db_tragnobe.nom
    
    db.delete(db_tragnobe)
    db.commit()
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorTypeEnum(current_user.get("user_type", "user")),
        acteur_id=current_user.get("user_id", 0),
        action="Suppression tragnobe",
        description=f"Tragnobe: {tragnobe_nom}"
    )
    db.add(log)
    db.commit()
    
    return {"message": "Tragnobe supprimé avec succès"}
