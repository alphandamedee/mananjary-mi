"""
Coutumes routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.schemas import CoutumeCreate, CoutumeUpdate, CoutumeResponse
from app.models.models import Coutume, User, LogActivite, ActorTypeEnum

router = APIRouter()


@router.get("/", response_model=List[CoutumeResponse])
async def get_coutumes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all coutumes"""
    coutumes = db.query(Coutume).offset(skip).limit(limit).all()
    return coutumes


@router.get("/{coutume_id}", response_model=CoutumeResponse)
async def get_coutume(coutume_id: int, db: Session = Depends(get_db)):
    """Get coutume by ID"""
    coutume = db.query(Coutume).filter(Coutume.id == coutume_id).first()
    if not coutume:
        raise HTTPException(status_code=404, detail="Coutume non trouvée")
    return coutume


@router.post("/", response_model=CoutumeResponse, status_code=status.HTTP_201_CREATED)
async def create_coutume(coutume: CoutumeCreate, db: Session = Depends(get_db)):
    """Create a new coutume"""
    
    db_coutume = Coutume(**coutume.model_dump())
    db.add(db_coutume)
    db.commit()
    db.refresh(db_coutume)
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorTypeEnum.SUPER_ADMIN,
        acteur_id=coutume.created_by if coutume.created_by else 0,
        action="Nouvelle coutume",
        description=f"{coutume.titre}"
    )
    db.add(log)
    db.commit()
    
    return db_coutume


@router.put("/{coutume_id}", response_model=CoutumeResponse)
async def update_coutume(coutume_id: int, coutume_update: CoutumeUpdate, db: Session = Depends(get_db)):
    """Update coutume"""
    db_coutume = db.query(Coutume).filter(Coutume.id == coutume_id).first()
    if not db_coutume:
        raise HTTPException(status_code=404, detail="Coutume non trouvée")
    
    update_data = coutume_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_coutume, field, value)
    
    db.commit()
    db.refresh(db_coutume)
    
    return db_coutume


@router.delete("/{coutume_id}")
async def delete_coutume(coutume_id: int, db: Session = Depends(get_db)):
    """Delete coutume"""
    db_coutume = db.query(Coutume).filter(Coutume.id == coutume_id).first()
    if not db_coutume:
        raise HTTPException(status_code=404, detail="Coutume non trouvée")
    
    db.delete(db_coutume)
    db.commit()
    
    return {"message": "Coutume supprimée avec succès"}
