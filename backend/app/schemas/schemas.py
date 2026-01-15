"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

from app.models.models import (
    UserStatus, PaymentMethod, CotisationType, DonType,
    EventType, CoutumeCategory, CoutumePeriodicity,
    CoutumeImportance, ActorType
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
    user_type: Optional[str] = None


class RegisterRequest(BaseModel):
    nom: str = Field(..., min_length=2, max_length=100)
    prenom: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    telephone: str = Field(..., min_length=10, max_length=30)
    mot_de_passe: str = Field(..., min_length=6)
    date_naissance: Optional[datetime] = None
    adresse: Optional[str] = None
    id_tragnobe: int


# ========== USER SCHEMAS ==========
class UserBase(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    telephone: str
    date_naissance: Optional[datetime] = None
    adresse: Optional[str] = None
    id_tragnobe: int


class UserCreate(UserBase):
    mot_de_passe: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    date_naissance: Optional[datetime] = None
    adresse: Optional[str] = None
    id_tragnobe: Optional[int] = None
    statut: Optional[UserStatus] = None
    mot_de_passe: Optional[str] = None


class UserResponse(UserBase):
    id: int
    photo: Optional[str] = None
    statut: UserStatus
    date_inscription: datetime
    date_validation: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ========== TRAGNOBE SCHEMAS ==========
class TragnobeBase(BaseModel):
    nom: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = None
    nom_chef: Optional[str] = None
    localisation: Optional[str] = None
    actif: bool = True


class TragnobeCreate(TragnobeBase):
    pass


class TragnobeUpdate(BaseModel):
    nom: Optional[str] = None
    description: Optional[str] = None
    nom_chef: Optional[str] = None
    localisation: Optional[str] = None
    actif: Optional[bool] = None


class TragnobeResponse(TragnobeBase):
    id: int
    date_creation: datetime
    
    class Config:
        from_attributes = True


# ========== ADMIN SCHEMAS ==========
class AdminBase(BaseModel):
    nom: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    telephone: Optional[str] = None
    id_tragnobe: Optional[int] = None


class AdminCreate(AdminBase):
    mot_de_passe: str = Field(..., min_length=6)


class AdminUpdate(BaseModel):
    nom: Optional[str] = None
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    id_tragnobe: Optional[int] = None
    mot_de_passe: Optional[str] = None


class AdminResponse(AdminBase):
    id: int
    date_creation: datetime
    
    class Config:
        from_attributes = True


# ========== COTISATION SCHEMAS ==========
class CotisationBase(BaseModel):
    user_id: int
    montant: Decimal = Field(..., gt=0)
    type_cotisation: CotisationType = CotisationType.MENSUELLE
    moyen_paiement: PaymentMethod = PaymentMethod.ESPECES
    notes: Optional[str] = None


class CotisationCreate(CotisationBase):
    pass


class CotisationUpdate(BaseModel):
    montant: Optional[Decimal] = None
    type_cotisation: Optional[CotisationType] = None
    moyen_paiement: Optional[PaymentMethod] = None
    notes: Optional[str] = None


class CotisationResponse(CotisationBase):
    id: int
    date_paiement: datetime
    
    class Config:
        from_attributes = True


# ========== DON SCHEMAS ==========
class DonBase(BaseModel):
    montant: Decimal = Field(..., gt=0)
    nom_donateur: Optional[str] = None
    type_don: DonType = DonType.ARGENT
    description: Optional[str] = None
    anonyme: bool = False


class DonCreate(DonBase):
    user_id: Optional[int] = None


class DonUpdate(BaseModel):
    montant: Optional[Decimal] = None
    nom_donateur: Optional[str] = None
    type_don: Optional[DonType] = None
    description: Optional[str] = None
    anonyme: Optional[bool] = None


class DonResponse(DonBase):
    id: int
    user_id: Optional[int] = None
    date_don: datetime
    
    class Config:
        from_attributes = True


# ========== EVENEMENT SCHEMAS ==========
class EvenementBase(BaseModel):
    titre: str = Field(..., min_length=3, max_length=150)
    description: Optional[str] = None
    date_evenement: datetime
    lieu: Optional[str] = None
    type: EventType = EventType.FAMILIAL
    participants_attendus: Optional[int] = None


class EvenementCreate(EvenementBase):
    id_admin: int


class EvenementUpdate(BaseModel):
    titre: Optional[str] = None
    description: Optional[str] = None
    date_evenement: Optional[datetime] = None
    lieu: Optional[str] = None
    type: Optional[EventType] = None
    participants_attendus: Optional[int] = None


class EvenementResponse(EvenementBase):
    id: int
    id_admin: int
    date_publication: datetime
    
    class Config:
        from_attributes = True


# ========== COUTUME SCHEMAS ==========
class CoutumeBase(BaseModel):
    nom: str = Field(..., min_length=3, max_length=150)
    description: str = Field(..., min_length=10)
    categorie: CoutumeCategory = CoutumeCategory.TRADITION
    periodicite: CoutumePeriodicity = CoutumePeriodicity.ANNUELLE
    date_celebration: Optional[datetime] = None
    importance: CoutumeImportance = CoutumeImportance.MOYEN
    regles: Optional[str] = None


class CoutumeCreate(CoutumeBase):
    created_by: Optional[int] = None


class CoutumeUpdate(BaseModel):
    nom: Optional[str] = None
    description: Optional[str] = None
    categorie: Optional[CoutumeCategory] = None
    periodicite: Optional[CoutumePeriodicity] = None
    date_celebration: Optional[datetime] = None
    importance: Optional[CoutumeImportance] = None
    regles: Optional[str] = None


class CoutumeResponse(CoutumeBase):
    id: int
    created_by: Optional[int] = None
    date_creation: datetime
    
    class Config:
        from_attributes = True


# ========== LOG ACTIVITE SCHEMAS ==========
class LogActiviteCreate(BaseModel):
    acteur_type: ActorType
    acteur_id: int
    action: str = Field(..., max_length=255)


class LogActiviteResponse(BaseModel):
    id: int
    acteur_type: ActorType
    acteur_id: int
    action: str
    date_action: datetime
    
    class Config:
        from_attributes = True


# ========== SUPER ADMIN SCHEMAS ==========
class SuperAdminBase(BaseModel):
    nom: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    telephone: Optional[str] = None


class SuperAdminCreate(SuperAdminBase):
    mot_de_passe: str = Field(..., min_length=6)


class SuperAdminUpdate(BaseModel):
    nom: Optional[str] = None
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    mot_de_passe: Optional[str] = None


class SuperAdminResponse(SuperAdminBase):
    id: int
    date_creation: datetime
    
    class Config:
        from_attributes = True
