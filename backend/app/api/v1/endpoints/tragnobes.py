"""
Tragnobe routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.schemas import TragnobeCreate, TragnobeUpdate, TragnobeResponse, UserResponse
from app.models.models import Tragnobe, User, LogActivite, ActorType

router = APIRouter()


@router.get("/", response_model=List[TragnobeResponse])
async def get_tragnobes(db: Session = Depends(get_db)):
    """Get all tragnobes"""
    tragnobes = db.query(Tragnobe).all()
    return tragnobes


@router.get("/{tragnobe_id}", response_model=TragnobeResponse)
async def get_tragnobe(tragnobe_id: int, db: Session = Depends(get_db)):
    """Get tragnobe by ID"""
    tragnobe = db.query(Tragnobe).filter(Tragnobe.id == tragnobe_id).first()
    if not tragnobe:
        raise HTTPException(status_code=404, detail="Tragnobe non trouvé")
    return tragnobe


@router.post("/", response_model=TragnobeResponse, status_code=status.HTTP_201_CREATED)
async def create_tragnobe(tragnobe: TragnobeCreate, db: Session = Depends(get_db)):
    """Create a new tragnobe"""
    
    # Check if name exists
    existing = db.query(Tragnobe).filter(Tragnobe.nom == tragnobe.nom).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ce nom de tragnobe existe déjà")
    
    db_tragnobe = Tragnobe(**tragnobe.model_dump())
    db.add(db_tragnobe)
    db.commit()
    db.refresh(db_tragnobe)
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorType.SYSTEM,
        acteur_id=db_tragnobe.id,
        action=f"Création tragnobe: {db_tragnobe.nom}"
    )
    db.add(log)
    db.commit()
    
    return db_tragnobe


@router.put("/{tragnobe_id}", response_model=TragnobeResponse)
async def update_tragnobe(tragnobe_id: int, tragnobe_update: TragnobeUpdate, db: Session = Depends(get_db)):
    """Update tragnobe"""
    db_tragnobe = db.query(Tragnobe).filter(Tragnobe.id == tragnobe_id).first()
    if not db_tragnobe:
        raise HTTPException(status_code=404, detail="Tragnobe non trouvé")
    
    update_data = tragnobe_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_tragnobe, field, value)
    
    db.commit()
    db.refresh(db_tragnobe)
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorType.SYSTEM,
        acteur_id=db_tragnobe.id,
        action=f"Modification tragnobe: {db_tragnobe.nom}"
    )
    db.add(log)
    db.commit()
    
    return db_tragnobe


@router.delete("/{tragnobe_id}")
async def delete_tragnobe(tragnobe_id: int, db: Session = Depends(get_db)):
    """Delete tragnobe"""
    db_tragnobe = db.query(Tragnobe).filter(Tragnobe.id == tragnobe_id).first()
    if not db_tragnobe:
        raise HTTPException(status_code=404, detail="Tragnobe non trouvé")
    
    # Check if tragnobe has members
    members_count = db.query(User).filter(User.id_tragnobe == tragnobe_id).count()
    if members_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Impossible de supprimer: {members_count} membres sont rattachés à ce tragnobe"
        )
    
    db.delete(db_tragnobe)
    db.commit()
    
    return {"message": "Tragnobe supprimé avec succès"}


@router.get("/{tragnobe_id}/membres", response_model=List[UserResponse])
async def get_tragnobe_members(tragnobe_id: int, db: Session = Depends(get_db)):
    """Get all members of a tragnobe"""
    tragnobe = db.query(Tragnobe).filter(Tragnobe.id == tragnobe_id).first()
    if not tragnobe:
        raise HTTPException(status_code=404, detail="Tragnobe non trouvé")
    
    members = db.query(User).filter(User.id_tragnobe == tragnobe_id).all()
    return members
