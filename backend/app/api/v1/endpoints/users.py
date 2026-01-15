"""
User (Members) routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.db.database import get_db
from app.schemas.schemas import UserCreate, UserUpdate, UserResponse
from app.models.models import User, UserStatus, LogActivite, ActorType
from app.core.security import get_password_hash

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all users"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/en-attente", response_model=List[UserResponse])
async def get_pending_users(db: Session = Depends(get_db)):
    """Get users pending validation"""
    users = db.query(User).filter(User.statut == UserStatus.EN_ATTENTE).all()
    return users


@router.get("/valides", response_model=List[UserResponse])
async def get_validated_users(db: Session = Depends(get_db)):
    """Get validated users"""
    users = db.query(User).filter(User.statut == UserStatus.VALIDE).all()
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    
    # Check if email exists
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    # Hash password
    hashed_password = get_password_hash(user.mot_de_passe)
    
    # Create user
    db_user = User(
        **user.model_dump(exclude={'mot_de_passe'}),
        mot_de_passe=hashed_password,
        statut=UserStatus.EN_ATTENTE
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorType.SYSTEM,
        acteur_id=db_user.id,
        action=f"Création membre: {db_user.prenom} {db_user.nom}"
    )
    db.add(log)
    db.commit()
    
    return db_user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    """Update user"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Hash password if provided
    if 'mot_de_passe' in update_data and update_data['mot_de_passe']:
        update_data['mot_de_passe'] = get_password_hash(update_data['mot_de_passe'])
    
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorType.SYSTEM,
        acteur_id=db_user.id,
        action=f"Modification membre: {db_user.prenom} {db_user.nom}"
    )
    db.add(log)
    db.commit()
    
    return db_user


@router.delete("/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete user"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    db.delete(db_user)
    db.commit()
    
    return {"message": "Utilisateur supprimé avec succès"}


@router.post("/{user_id}/valider", response_model=UserResponse)
async def validate_user(user_id: int, db: Session = Depends(get_db)):
    """Validate a user"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    db_user.statut = UserStatus.VALIDE
    db_user.date_validation = datetime.utcnow()
    
    db.commit()
    db.refresh(db_user)
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorType.ADMIN,
        acteur_id=user_id,
        action=f"Validation membre: {db_user.prenom} {db_user.nom}"
    )
    db.add(log)
    db.commit()
    
    return db_user


@router.post("/{user_id}/rejeter", response_model=UserResponse)
async def reject_user(user_id: int, db: Session = Depends(get_db)):
    """Reject a user"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    db_user.statut = UserStatus.REJETE
    
    db.commit()
    db.refresh(db_user)
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorType.ADMIN,
        acteur_id=user_id,
        action=f"Rejet membre: {db_user.prenom} {db_user.nom}"
    )
    db.add(log)
    db.commit()
    
    return db_user
