"""
Authentication routes - Synchronized with role-based system
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.database import get_db
from app.schemas.schemas import LoginRequest, RegisterRequest, Token, UserResponse
from app.models.models import User, Role, UserStatusEnum, ActorTypeEnum, LogActivite
from app.core.security import verify_password, get_password_hash, create_access_token

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Login with role-based authentication"""
    
    try:
        # Find user by email
        user = db.query(User).filter(User.email == credentials.email).first()
    except Exception as e:
        print(f"ERROR in login - Database query: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )
    
    # Verify password
    if not verify_password(credentials.password, user.mot_de_passe):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )
    
    # Check user status (only for regular members - role 3)
    if user.id_role == 3 and user.statut != UserStatusEnum.valide:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Votre compte est en statut: {user.statut.value}. Veuillez attendre la validation."
        )
    
    # Get role information
    role = db.query(Role).filter(Role.id == user.id_role).first()
    role_name = role.nom if role else "Membre"
    
    # Determine actor type for logging and user_type for frontend
    actor_type = ActorTypeEnum.user
    user_type = "user"
    if user.id_role == 1:  # Super Admin
        actor_type = ActorTypeEnum.super_admin
        user_type = "super_admin"
    elif user.id_role == 2:  # Admin
        actor_type = ActorTypeEnum.admin
        user_type = "admin"
    
    # Create access token
    token_data = {
        "user_id": user.id,
        "email": user.email,
        "role_id": user.id_role,
        "role_name": role_name,
        "user_type": user_type
    }
    access_token = create_access_token(token_data)
    
    # Log activity
    log = LogActivite(
        acteur_type=actor_type,
        acteur_id=user.id,
        action="Connexion réussie",
        description=f"{role_name}: {user.prenom} {user.nom}"
    )
    db.add(log)
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": user_type,
        "user_data": {
            "id": user.id,
            "nom": user.nom,
            "prenom": user.prenom,
            "email": user.email,
            "role_id": user.id_role,
            "role_name": role_name,
            "user_type": user_type,
            "id_tragnobe": user.id_tragnobe,
            "id_lohantragno": user.id_lohantragno,
            "photo": user.photo,
            "statut": user.statut.value
        }
    }


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user (member)"""
    
    # Check if email already exists
    if user_data.email:
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà utilisé"
            )
    
    # Check if telephone already exists
    existing_phone = db.query(User).filter(User.telephone == user_data.telephone).first()
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce numéro de téléphone est déjà utilisé"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.mot_de_passe)
    
    # Create user
    new_user = User(
        nom=user_data.nom,
        prenom=user_data.prenom,
        genre=user_data.genre,
        telephone=user_data.telephone,
        email=user_data.email,
        ville=user_data.ville,
        annee_naissance=user_data.annee_naissance,
        mot_de_passe=hashed_password,
        id_tragnobe=user_data.id_tragnobe,
        id_lohantragno=user_data.id_lohantragno,
        id_role=3,  # Default: Membre
        statut=UserStatusEnum.en_attente
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log activity (trigger will handle this, but we can add extra log)
    log = LogActivite(
        acteur_type=ActorTypeEnum.user,
        acteur_id=new_user.id,
        action="Inscription",
        description=f"Nouveau membre: {new_user.prenom} {new_user.nom}"
    )
    db.add(log)
    db.commit()
    
    return new_user


@router.post("/logout")
async def logout():
    """Logout (client-side token removal)"""
    return {"message": "Déconnexion réussie"}


@router.get("/me", response_model=UserResponse)
async def get_current_user(db: Session = Depends(get_db)):
    """Get current authenticated user - requires authentication middleware"""
    # This would need authentication middleware to get current user from token
    # For now, returning a placeholder
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Authentication middleware required"
    )
