"""
Tragnobe routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional

from app.db.database import get_db
from app.schemas.schemas import TragnobeCreate, TragnobeUpdate, TragnobeResponse, HistoriqueAmpanjakaCreate, HistoriqueAmpanjakaResponse
from app.models.models import Tragnobe, HistoriqueAmpanjaka, LogActivite, ActorTypeEnum
from app.core.security import get_current_user

router = APIRouter()


@router.get("/", response_model=List[TragnobeResponse])
async def get_tragnobes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all tragnobes"""
    stmt = select(Tragnobe).offset(skip).limit(limit)
    tragnobes = db.execute(stmt).scalars().all()
    return tragnobes


@router.get("/{tragnobe_id}", response_model=TragnobeResponse)
async def get_tragnobe(tragnobe_id: int, db: Session = Depends(get_db)):
    """Get tragnobe by ID"""
    stmt = select(Tragnobe).where(Tragnobe.id == tragnobe_id)
    tragnobe = db.execute(stmt).scalar_one_or_none()
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
    stmt = select(Tragnobe).where(Tragnobe.nom == tragnobe.nom)
    existing = db.execute(stmt).scalar_one_or_none()
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
    stmt = select(Tragnobe).where(Tragnobe.id == tragnobe_id)
    db_tragnobe = db.execute(stmt).scalar_one_or_none()
    if not db_tragnobe:
        raise HTTPException(status_code=404, detail="Tragnobe non trouvé")
    
    update_data = tragnobe_update.model_dump(exclude_unset=True)
    
    # Check name uniqueness if being updated
    if 'nom' in update_data:
        stmt_check = select(Tragnobe).where(
            Tragnobe.nom == update_data['nom'],
            Tragnobe.id != tragnobe_id
        )
        existing = db.execute(stmt_check).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=400, detail="Ce nom de tragnobe existe déjà")
    
    # Si on change l'Ampanjaka, enregistrer l'ancien dans l'historique
    if 'ampanjaka' in update_data and db_tragnobe.ampanjaka and update_data['ampanjaka'] != db_tragnobe.ampanjaka:
        # Créer un enregistrement historique pour l'ancien Ampanjaka
        historique = HistoriqueAmpanjaka(
            id_tragnobe=tragnobe_id,
            ampanjaka=db_tragnobe.ampanjaka,
            lefitra=db_tragnobe.lefitra,
            date_debut=db_tragnobe.date_debut,
            date_fin=update_data.get('date_debut'),  # La date de début du nouveau devient la date de fin de l'ancien
            raison_fin="Changement d'Ampanjaka"
        )
        db.add(historique)
    
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
    
    return db_tragnobe


@router.delete("/{tragnobe_id}")
async def delete_tragnobe(
    tragnobe_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete tragnobe"""
    stmt = select(Tragnobe).where(Tragnobe.id == tragnobe_id)
    db_tragnobe = db.execute(stmt).scalar_one_or_none()
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


@router.get("/{tragnobe_id}/historique", response_model=List[HistoriqueAmpanjakaResponse])
async def get_historique_ampanjaka(tragnobe_id: int, db: Session = Depends(get_db)):
    """Get historique des Ampanjaka pour un tragnobe"""
    stmt = select(Tragnobe).where(Tragnobe.id == tragnobe_id)
    tragnobe = db.execute(stmt).scalar_one_or_none()
    if not tragnobe:
        raise HTTPException(status_code=404, detail="Tragnobe non trouvé")
    
    stmt_hist = select(HistoriqueAmpanjaka).where(
        HistoriqueAmpanjaka.id_tragnobe == tragnobe_id
    ).order_by(HistoriqueAmpanjaka.date_debut.desc())
    historique = db.execute(stmt_hist).scalars().all()
    
    return historique
