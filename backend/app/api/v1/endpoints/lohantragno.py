"""
Lohantragno routes - Subdivisions des tragnobes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas.schemas import LohantragnoCreate, LohantragnoUpdate, LohantragnoResponse
from app.models.models import Lohantragno, Tragnobe, LogActivite, ActorTypeEnum

router = APIRouter()


@router.get("/", response_model=List[LohantragnoResponse])
async def get_lohantragno(
    skip: int = 0, 
    limit: int = 100,
    id_tragnobe: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all lohantragno with optional filter by tragnobe"""
    query = db.query(Lohantragno)
    
    if id_tragnobe:
        query = query.filter(Lohantragno.id_tragnobe == id_tragnobe)
    
    lohantragno = query.offset(skip).limit(limit).all()
    return lohantragno


@router.get("/{lohantragno_id}", response_model=LohantragnoResponse)
async def get_lohantragno_by_id(lohantragno_id: int, db: Session = Depends(get_db)):
    """Get lohantragno by ID"""
    lohantragno = db.query(Lohantragno).filter(Lohantragno.id == lohantragno_id).first()
    if not lohantragno:
        raise HTTPException(status_code=404, detail="Lohantragno non trouvé")
    return lohantragno


@router.get("/by-tragnobe/{tragnobe_id}", response_model=List[LohantragnoResponse])
async def get_lohantragno_by_tragnobe(tragnobe_id: int, db: Session = Depends(get_db)):
    """Get all lohantragno for a specific tragnobe"""
    # Verify tragnobe exists
    tragnobe = db.query(Tragnobe).filter(Tragnobe.id == tragnobe_id).first()
    if not tragnobe:
        raise HTTPException(status_code=404, detail="Tragnobe non trouvé")
    
    lohantragno = db.query(Lohantragno).filter(Lohantragno.id_tragnobe == tragnobe_id).all()
    return lohantragno


@router.post("/", response_model=LohantragnoResponse, status_code=status.HTTP_201_CREATED)
async def create_lohantragno(lohantragno: LohantragnoCreate, db: Session = Depends(get_db)):
    """Create a new lohantragno"""
    
    # Verify tragnobe exists
    tragnobe = db.query(Tragnobe).filter(Tragnobe.id == lohantragno.id_tragnobe).first()
    if not tragnobe:
        raise HTTPException(status_code=404, detail="Tragnobe non trouvé")
    
    db_lohantragno = Lohantragno(**lohantragno.model_dump())
    db.add(db_lohantragno)
    db.commit()
    db.refresh(db_lohantragno)
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorTypeEnum.ADMIN,
        acteur_id=0,
        action="Création lohantragno",
        description=f"{db_lohantragno.nom} - Tragnobe: {tragnobe.nom}"
    )
    db.add(log)
    db.commit()
    
    return db_lohantragno


@router.put("/{lohantragno_id}", response_model=LohantragnoResponse)
async def update_lohantragno(
    lohantragno_id: int, 
    lohantragno_update: LohantragnoUpdate, 
    db: Session = Depends(get_db)
):
    """Update lohantragno"""
    db_lohantragno = db.query(Lohantragno).filter(Lohantragno.id == lohantragno_id).first()
    if not db_lohantragno:
        raise HTTPException(status_code=404, detail="Lohantragno non trouvé")
    
    update_data = lohantragno_update.model_dump(exclude_unset=True)
    
    # Verify tragnobe if being updated
    if 'id_tragnobe' in update_data:
        tragnobe = db.query(Tragnobe).filter(Tragnobe.id == update_data['id_tragnobe']).first()
        if not tragnobe:
            raise HTTPException(status_code=404, detail="Tragnobe non trouvé")
    
    for field, value in update_data.items():
        setattr(db_lohantragno, field, value)
    
    db.commit()
    db.refresh(db_lohantragno)
    
    return db_lohantragno


@router.delete("/{lohantragno_id}")
async def delete_lohantragno(lohantragno_id: int, db: Session = Depends(get_db)):
    """Delete lohantragno"""
    db_lohantragno = db.query(Lohantragno).filter(Lohantragno.id == lohantragno_id).first()
    if not db_lohantragno:
        raise HTTPException(status_code=404, detail="Lohantragno non trouvé")
    
    db.delete(db_lohantragno)
    db.commit()
    
    return {"message": "Lohantragno supprimé avec succès"}
