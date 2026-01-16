"""
Lohantragno routes - Subdivisions des tragnobes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional

from app.db.database import get_db
from app.schemas.schemas import LohantragnoCreate, LohantragnoUpdate, LohantragnoResponse
from app.models.models import Lohantragno, Tragnobe, LogActivite, ActorTypeEnum, User
from app.core.security import get_current_user

router = APIRouter()


def check_lohantragno_permission(current_user: dict, lohantragno_tragnobe_id: int, db: Session) -> bool:
    """
    Vérifie si l'utilisateur a la permission de modifier/créer un lohantragno.
    - Super admin: peut tout faire
    - Admin: peut seulement modifier les lohantragno de son tragnobe
    - User: pas de permission
    """
    user_type = current_user.get("user_type", "user")
    
    # Super admin peut tout faire
    if user_type == "super_admin":
        return True
    
    # Admin peut seulement modifier dans son tragnobe
    if user_type == "admin":
        user_id = current_user.get("user_id")
        stmt = select(User).where(User.id == user_id)
        user = db.execute(stmt).scalar_one_or_none()
        if user and user.id_tragnobe == lohantragno_tragnobe_id:
            return True
        return False
    
    # Les utilisateurs normaux n'ont pas de permission
    return False


@router.get("/", response_model=List[LohantragnoResponse])
async def get_all_lohantragno(
    skip: int = 0, 
    limit: int = 100,
    id_tragnobe: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all lohantragno with optional filter by tragnobe.
    Tous les utilisateurs authentifiés peuvent voir les lohantragno.
    """
    stmt = select(Lohantragno)
    
    if id_tragnobe:
        stmt = stmt.where(Lohantragno.id_tragnobe == id_tragnobe)
    
    stmt = stmt.offset(skip).limit(limit)
    lohantragno = db.execute(stmt).scalars().all()
    return lohantragno


@router.get("/{lohantragno_id}", response_model=LohantragnoResponse)
async def get_lohantragno_by_id(lohantragno_id: int, db: Session = Depends(get_db)):
    """Get lohantragno by ID"""
    stmt = select(Lohantragno).where(Lohantragno.id == lohantragno_id)
    lohantragno = db.execute(stmt).scalar_one_or_none()
    if not lohantragno:
        raise HTTPException(status_code=404, detail="Lohantragno non trouvé")
    return lohantragno


@router.get("/by-tragnobe/{tragnobe_id}", response_model=List[LohantragnoResponse])
async def get_lohantragno_by_tragnobe(tragnobe_id: int, db: Session = Depends(get_db)):
    """Get all lohantragno for a specific tragnobe"""
    # Verify tragnobe exists
    stmt_tragnobe = select(Tragnobe).where(Tragnobe.id == tragnobe_id)
    tragnobe = db.execute(stmt_tragnobe).scalar_one_or_none()
    if not tragnobe:
        raise HTTPException(status_code=404, detail="Tragnobe non trouvé")
    
    stmt = select(Lohantragno).where(Lohantragno.id_tragnobe == tragnobe_id)
    lohantragno = db.execute(stmt).scalars().all()
    return lohantragno


@router.post("/", response_model=LohantragnoResponse, status_code=status.HTTP_201_CREATED)
async def create_lohantragno(
    lohantragno: LohantragnoCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new lohantragno.
    Super admin peut créer pour n'importe quel tragnobe.
    Admin peut seulement créer pour son propre tragnobe.
    """
    
    # Verify tragnobe exists
    stmt = select(Tragnobe).where(Tragnobe.id == lohantragno.id_tragnobe)
    tragnobe = db.execute(stmt).scalar_one_or_none()
    if not tragnobe:
        raise HTTPException(status_code=404, detail="Tragnobe non trouvé")
    
    # Vérifier les permissions
    if not check_lohantragno_permission(current_user, lohantragno.id_tragnobe, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez ajouter des lohantragno que pour votre propre tragnobe"
        )
    
    db_lohantragno = Lohantragno(**lohantragno.model_dump())
    db.add(db_lohantragno)
    db.commit()
    db.refresh(db_lohantragno)
    
    # Log activity with actual user
    log = LogActivite(
        acteur_type=ActorTypeEnum(current_user.get("user_type", "user")),
        acteur_id=current_user.get("user_id", 0),
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
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update lohantragno.
    Super admin peut modifier n'importe quel lohantragno.
    Admin peut seulement modifier les lohantragno de son tragnobe.
    """
    stmt = select(Lohantragno).where(Lohantragno.id == lohantragno_id)
    db_lohantragno = db.execute(stmt).scalar_one_or_none()
    if not db_lohantragno:
        raise HTTPException(status_code=404, detail="Lohantragno non trouvé")
    
    # Vérifier les permissions sur le lohantragno actuel
    if not check_lohantragno_permission(current_user, db_lohantragno.id_tragnobe, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez modifier que les lohantragno de votre tragnobe"
        )
    
    update_data = lohantragno_update.model_dump(exclude_unset=True)
    
    # Verify tragnobe if being updated
    if 'id_tragnobe' in update_data:
        stmt_tragnobe = select(Tragnobe).where(Tragnobe.id == update_data['id_tragnobe'])
        tragnobe = db.execute(stmt_tragnobe).scalar_one_or_none()
        if not tragnobe:
            raise HTTPException(status_code=404, detail="Tragnobe non trouvé")
        
        # Vérifier permission sur le nouveau tragnobe aussi
        if not check_lohantragno_permission(current_user, update_data['id_tragnobe'], db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous ne pouvez déplacer le lohantragno que vers votre propre tragnobe"
            )
    
    for field, value in update_data.items():
        setattr(db_lohantragno, field, value)
    
    db.commit()
    db.refresh(db_lohantragno)
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorTypeEnum(current_user.get("user_type", "user")),
        acteur_id=current_user.get("user_id", 0),
        action="Modification lohantragno",
        description=f"{db_lohantragno.nom}"
    )
    db.add(log)
    db.commit()
    
    return db_lohantragno


@router.delete("/{lohantragno_id}")
async def delete_lohantragno(
    lohantragno_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Delete lohantragno.
    Super admin peut supprimer n'importe quel lohantragno.
    Admin peut seulement supprimer les lohantragno de son tragnobe.
    """
    stmt = select(Lohantragno).where(Lohantragno.id == lohantragno_id)
    db_lohantragno = db.execute(stmt).scalar_one_or_none()
    if not db_lohantragno:
        raise HTTPException(status_code=404, detail="Lohantragno non trouvé")
    
    # Vérifier les permissions
    if not check_lohantragno_permission(current_user, db_lohantragno.id_tragnobe, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez supprimer que les lohantragno de votre tragnobe"
        )
    
    lohantragno_nom = db_lohantragno.nom
    
    db.delete(db_lohantragno)
    db.commit()
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorTypeEnum(current_user.get("user_type", "user")),
        acteur_id=current_user.get("user_id", 0),
        action="Suppression lohantragno",
        description=f"{lohantragno_nom}"
    )
    db.add(log)
    db.commit()
    
    return {"message": "Lohantragno supprimé avec succès"}
