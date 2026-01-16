"""
Pydantic schemas synchronized with mananjary-mi database
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal

from app.models.models import (
    GenreEnum, UserStatusEnum, PaymentMethodEnum, CotisationStatusEnum,
    EventTypeEnum, RelationTypeEnum, NotificationTypeEnum, ActorTypeEnum
)


# ========== AUTH SCHEMAS ==========

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_type: str
    user_data: dict


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    nom: str = Field(..., min_length=2, max_length=100)
    prenom: str = Field(..., min_length=2, max_length=100)
    genre: GenreEnum
    telephone: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    ville: Optional[str] = None
    annee_naissance: Optional[int] = None
    mot_de_passe: str = Field(..., min_length=6)
    id_tragnobe: Optional[int] = None
    id_lohantragno: Optional[int] = None


# ========== ROLE SCHEMAS ==========

class RoleBase(BaseModel):
    nom: str
    description: Optional[str] = None


class RoleResponse(RoleBase):
    id: int
    
    class Config:
        from_attributes = True


# ========== TRAGNOBE SCHEMAS ==========

class TragnobeBase(BaseModel):
    nom: str = Field(..., min_length=2, max_length=150)
    localisation: Optional[str] = None
    ampanjaka: Optional[str] = None  # Chef actuel
    lefitra: Optional[str] = None  # Adjoint
    date_debut: Optional[date] = None  # Date de début du règne
    date_fin: Optional[date] = None  # Date de fin (null si en cours)
    description: Optional[str] = None


class TragnobeCreate(TragnobeBase):
    pass


class TragnobeUpdate(BaseModel):
    nom: Optional[str] = None
    localisation: Optional[str] = None
    ampanjaka: Optional[str] = None
    lefitra: Optional[str] = None
    date_debut: Optional[date] = None
    date_fin: Optional[date] = None
    description: Optional[str] = None


class TragnobeResponse(TragnobeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ========== HISTORIQUE AMPANJAKA SCHEMAS ==========

class HistoriqueAmpanjakaBase(BaseModel):
    id_tragnobe: int
    ampanjaka: str
    lefitra: Optional[str] = None
    date_debut: date
    date_fin: Optional[date] = None
    raison_fin: Optional[str] = None


class HistoriqueAmpanjakaCreate(HistoriqueAmpanjakaBase):
    pass


class HistoriqueAmpanjakaResponse(HistoriqueAmpanjakaBase):
    id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ========== LOHANTRAGNO SCHEMAS ==========

class LohantragnoBase(BaseModel):
    nom: str
    id_tragnobe: int
    description: Optional[str] = None


class LohantragnoCreate(LohantragnoBase):
    pass


class LohantragnoUpdate(BaseModel):
    nom: Optional[str] = None
    id_tragnobe: Optional[int] = None
    description: Optional[str] = None


class LohantragnoResponse(LohantragnoBase):
    id: int
    created_at: datetime
    updated_at: datetime
    tragnobe: "TragnobeResponse" 

    class Config:
        from_attributes = True


# ========== USER SCHEMAS ==========

class UserBase(BaseModel):
    nom: str
    prenom: str
    genre: GenreEnum
    telephone: str
    email: Optional[EmailStr] = None
    ville: Optional[str] = None
    annee_naissance: Optional[int] = None
    id_tragnobe: Optional[int] = None
    id_lohantragno: Optional[int] = None


class UserCreate(UserBase):
    mot_de_passe: str = Field(..., min_length=6)
    id_role: int = 3  # Default: Membre


class UserUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    genre: Optional[GenreEnum] = None
    telephone: Optional[str] = None
    email: Optional[EmailStr] = None
    ville: Optional[str] = None
    annee_naissance: Optional[int] = None
    id_tragnobe: Optional[int] = None
    id_lohantragno: Optional[int] = None
    statut: Optional[UserStatusEnum] = None
    mot_de_passe: Optional[str] = None
    id_role: Optional[int] = None


class UserResponse(UserBase):
    id: int
    id_role: int
    photo: Optional[str] = None
    statut: UserStatusEnum
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ========== COTISATION SCHEMAS ==========

class CotisationBase(BaseModel):
    id_user: int
    montant: Decimal
    moyen_paiement: PaymentMethodEnum
    reference_transaction: Optional[str] = None
    date_cotisation: date


class CotisationCreate(CotisationBase):
    pass


class CotisationUpdate(BaseModel):
    montant: Optional[Decimal] = None
    moyen_paiement: Optional[PaymentMethodEnum] = None
    reference_transaction: Optional[str] = None
    statut: Optional[CotisationStatusEnum] = None
    date_cotisation: Optional[date] = None


class CotisationResponse(CotisationBase):
    id: int
    statut: CotisationStatusEnum
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ========== DON SCHEMAS ==========

class DonBase(BaseModel):
    montant: Decimal
    message: Optional[str] = None
    anonyme: bool = False


class DonCreate(DonBase):
    id_user: Optional[int] = None


class DonResponse(DonBase):
    id: int
    id_user: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# ========== EVENEMENT SCHEMAS ==========

class EvenementBase(BaseModel):
    titre: str
    description: Optional[str] = None
    type: EventTypeEnum
    date_debut: datetime
    date_fin: Optional[datetime] = None
    lieu: Optional[str] = None


class EvenementCreate(EvenementBase):
    id_admin: Optional[int] = None


class EvenementUpdate(BaseModel):
    titre: Optional[str] = None
    description: Optional[str] = None
    type: Optional[EventTypeEnum] = None
    date_debut: Optional[datetime] = None
    date_fin: Optional[datetime] = None
    lieu: Optional[str] = None


class EvenementResponse(EvenementBase):
    id: int
    id_admin: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ========== COUTUME SCHEMAS ==========

class CoutumeBase(BaseModel):
    titre: str
    description: str
    categorie: Optional[str] = None
    periodicite: Optional[str] = None
    date_celebration: Optional[date] = None
    niveau_importance: Optional[str] = None
    regles_pratiques: Optional[str] = None


class CoutumeCreate(CoutumeBase):
    id_super_admin: Optional[int] = None
    created_by: Optional[int] = None


class CoutumeUpdate(BaseModel):
    titre: Optional[str] = None
    description: Optional[str] = None
    categorie: Optional[str] = None
    periodicite: Optional[str] = None
    date_celebration: Optional[date] = None
    niveau_importance: Optional[str] = None
    regles_pratiques: Optional[str] = None


class CoutumeResponse(CoutumeBase):
    id: int
    id_super_admin: Optional[int] = None
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ========== RELATION SCHEMAS ==========

class RelationBase(BaseModel):
    id_user1: int
    id_user2: int
    type_relation: RelationTypeEnum


class RelationCreate(RelationBase):
    pass


class RelationResponse(RelationBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# ========== NOTIFICATION SCHEMAS ==========

class NotificationBase(BaseModel):
    id_user: int
    titre: str
    message: str
    type: NotificationTypeEnum = NotificationTypeEnum.info


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    lue: bool


class NotificationResponse(NotificationBase):
    id: int
    lue: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ========== LOG SCHEMAS ==========

class LogActiviteBase(BaseModel):
    acteur_type: ActorTypeEnum
    acteur_id: int
    action: str
    description: Optional[str] = None


class LogActiviteCreate(LogActiviteBase):
    pass


class LogActiviteResponse(LogActiviteBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
