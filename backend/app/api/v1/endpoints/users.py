"""
User (Members) routes - Synchronized with role-based system
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
import shutil

from app.db.database import get_db
from app.schemas.schemas import UserCreate, UserUpdate, UserResponse
from app.models.models import User, Role, UserStatusEnum, LogActivite, ActorTypeEnum
from app.core.security import get_password_hash

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = 0, 
    limit: int = 100,
    id_tragnobe: Optional[int] = None,
    id_lohantragno: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all users with optional filters"""
    query = db.query(User)
    
    if id_tragnobe:
        query = query.filter(User.id_tragnobe == id_tragnobe)
    
    if id_lohantragno:
        query = query.filter(User.id_lohantragno == id_lohantragno)
    
    users = query.offset(skip).limit(limit).all()
    return users


@router.get("/en-attente", response_model=List[UserResponse])
async def get_pending_users(db: Session = Depends(get_db)):
    """Get users pending validation"""
    users = db.query(User).filter(
        User.statut == UserStatusEnum.en_attente,
        User.id_role == 3  # Only members need validation
    ).all()
    return users


@router.get("/valides", response_model=List[UserResponse])
async def get_validated_users(db: Session = Depends(get_db)):
    """Get validated users"""
    users = db.query(User).filter(User.statut == UserStatusEnum.valide).all()
    return users


@router.get("/rejetes", response_model=List[UserResponse])
async def get_rejected_users(db: Session = Depends(get_db)):
    """Get rejected users"""
    users = db.query(User).filter(User.statut == UserStatusEnum.rejete).all()
    return users


@router.get("/by-role/{role_id}", response_model=List[UserResponse])
async def get_users_by_role(role_id: int, db: Session = Depends(get_db)):
    """Get users by role"""
    users = db.query(User).filter(User.id_role == role_id).all()
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
    if user.email:
        existing = db.query(User).filter(User.email == user.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    # Check if telephone exists
    existing_phone = db.query(User).filter(User.telephone == user.telephone).first()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Téléphone déjà utilisé")
    
    # Hash password
    hashed_password = get_password_hash(user.mot_de_passe)
    
    # Create user
    db_user = User(
        **user.model_dump(exclude={'mot_de_passe'}),
        mot_de_passe=hashed_password,
        statut=UserStatusEnum.en_attente if user.id_role == 3 else UserStatusEnum.valide
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Get role name
    role = db.query(Role).filter(Role.id == db_user.id_role).first()
    role_name = role.nom if role else "Utilisateur"
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorTypeEnum.admin,
        acteur_id=db_user.id,
        action=f"Création {role_name}",
        description=f"{db_user.prenom} {db_user.nom}"
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
    
    # Check email uniqueness if being updated
    if 'email' in update_data and update_data['email']:
        existing = db.query(User).filter(
            User.email == update_data['email'],
            User.id != user_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    # Check telephone uniqueness if being updated
    if 'telephone' in update_data:
        existing = db.query(User).filter(
            User.telephone == update_data['telephone'],
            User.id != user_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Téléphone déjà utilisé")
    
    # Hash password if provided
    if 'mot_de_passe' in update_data and update_data['mot_de_passe']:
        update_data['mot_de_passe'] = get_password_hash(update_data['mot_de_passe'])
    
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorTypeEnum.admin,
        acteur_id=user_id,
        action="Modification utilisateur",
        description=f"{db_user.prenom} {db_user.nom}"
    )
    db.add(log)
    db.commit()
    
    return db_user


@router.post("/{user_id}/upload-photo")
async def upload_photo(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload user photo"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Create uploads directory if not exists
    os.makedirs("uploads/photos", exist_ok=True)
    
    # Generate filename
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{int(datetime.now().timestamp())}_{user_id}{file_extension}"
    file_path = f"uploads/photos/{filename}"
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update user photo
    user.photo = f"uploads/photos/{filename}"
    db.commit()
    
    return {"photo": user.photo}


@router.delete("/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete user"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Log before deletion
    log = LogActivite(
        acteur_type=ActorTypeEnum.admin,
        acteur_id=user_id,
        action="Suppression utilisateur",
        description=f"{db_user.prenom} {db_user.nom}"
    )
    db.add(log)
    
    db.delete(db_user)
    db.commit()
    
    return {"message": "Utilisateur supprimé avec succès"}


@router.post("/{user_id}/valider", response_model=UserResponse)
async def validate_user(user_id: int, db: Session = Depends(get_db)):
    """Validate a user"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    db_user.statut = UserStatusEnum.valide
    
    db.commit()
    db.refresh(db_user)
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorTypeEnum.admin,
        acteur_id=user_id,
        action="Validation membre",
        description=f"{db_user.prenom} {db_user.nom}"
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
    
    db_user.statut = UserStatusEnum.rejete
    
    db.commit()
    db.refresh(db_user)
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorTypeEnum.admin,
        acteur_id=user_id,
        action="Rejet membre",
        description=f"{db_user.prenom} {db_user.nom}"
    )
    db.add(log)
    db.commit()
    
    return db_user


@router.post("/{user_id}/change-role/{role_id}", response_model=UserResponse)
async def change_user_role(user_id: int, role_id: int, db: Session = Depends(get_db)):
    """Change user role (1=Super Admin, 2=Admin, 3=Membre)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Check if role exists
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Rôle non trouvé")
    
    old_role = db.query(Role).filter(Role.id == user.id_role).first()
    old_role_name = old_role.nom if old_role else "Inconnu"
    
    user.id_role = role_id
    
    # Auto-validate if promoted to Admin or Super Admin
    if role_id in [1, 2]:
        user.statut = UserStatusEnum.valide
    
    db.commit()
    db.refresh(user)
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorTypeEnum.super_admin,
        acteur_id=user_id,
        action="Changement de rôle",
        description=f"{user.prenom} {user.nom}: {old_role_name} → {role.nom}"
    )
    db.add(log)
    db.commit()
    
    return user
