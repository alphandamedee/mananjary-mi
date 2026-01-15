"""
Authentication routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.schemas import LoginRequest, RegisterRequest, Token, UserResponse
from app.models.models import User, Admin, SuperAdmin, UserStatus, ActorType, LogActivite
from app.core.security import verify_password, get_password_hash, create_access_token

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Universal login - detects user type automatically"""
    
    # Try SuperAdmin first
    super_admin = db.query(SuperAdmin).filter(SuperAdmin.email == credentials.email).first()
    if super_admin and verify_password(credentials.password, super_admin.mot_de_passe):
        token_data = {
            "user_id": super_admin.id,
            "user_type": "super_admin",
            "email": super_admin.email
        }
        access_token = create_access_token(token_data)
        
        # Log activity
        log = LogActivite(
            acteur_type=ActorType.SUPER_ADMIN,
            acteur_id=super_admin.id,
            action="Connexion réussie"
        )
        db.add(log)
        db.commit()
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_type": "super_admin",
            "user_data": {
                "id": super_admin.id,
                "nom": super_admin.nom,
                "email": super_admin.email
            }
        }
    
    # Try Admin
    admin = db.query(Admin).filter(Admin.email == credentials.email).first()
    if admin and verify_password(credentials.password, admin.mot_de_passe):
        token_data = {
            "user_id": admin.id,
            "user_type": "admin",
            "email": admin.email
        }
        access_token = create_access_token(token_data)
        
        # Log activity
        log = LogActivite(
            acteur_type=ActorType.ADMIN,
            acteur_id=admin.id,
            action="Connexion réussie"
        )
        db.add(log)
        db.commit()
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_type": "admin",
            "user_data": {
                "id": admin.id,
                "nom": admin.nom,
                "email": admin.email,
                "id_tragnobe": admin.id_tragnobe
            }
        }
    
    # Try User
    user = db.query(User).filter(User.email == credentials.email).first()
    if user and verify_password(credentials.password, user.mot_de_passe):
        if user.statut != UserStatus.VALIDE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Votre compte est en statut: {user.statut.value}"
            )
        
        token_data = {
            "user_id": user.id,
            "user_type": "user",
            "email": user.email
        }
        access_token = create_access_token(token_data)
        
        # Log activity
        log = LogActivite(
            acteur_type=ActorType.USER,
            acteur_id=user.id,
            action="Connexion réussie"
        )
        db.add(log)
        db.commit()
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_type": "user",
            "user_data": {
                "id": user.id,
                "nom": user.nom,
                "prenom": user.prenom,
                "email": user.email,
                "id_tragnobe": user.id_tragnobe,
                "statut": user.statut.value
            }
        }
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Email ou mot de passe incorrect"
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new member"""
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet email est déjà utilisé"
        )
    
    # Check if telephone already exists
    if user_data.telephone:
        existing_phone = db.query(User).filter(User.telephone == user_data.telephone).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ce numéro de téléphone est déjà utilisé"
            )
    
    # Create new user
    hashed_password = get_password_hash(user_data.mot_de_passe)
    new_user = User(
        nom=user_data.nom,
        prenom=user_data.prenom,
        email=user_data.email,
        telephone=user_data.telephone,
        mot_de_passe=hashed_password,
        date_naissance=user_data.date_naissance,
        adresse=user_data.adresse,
        id_tragnobe=user_data.id_tragnobe,
        statut=UserStatus.EN_ATTENTE
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorType.SYSTEM,
        acteur_id=new_user.id,
        action=f"Nouvelle inscription: {new_user.prenom} {new_user.nom}"
    )
    db.add(log)
    db.commit()
    
    # TODO: Send email notification
    
    return new_user


@router.post("/logout")
async def logout():
    """Logout (client-side token removal)"""
    return {"message": "Déconnexion réussie"}


@router.get("/check")
async def check_session():
    """Check if session is valid (placeholder)"""
    return {"message": "Session check endpoint"}
