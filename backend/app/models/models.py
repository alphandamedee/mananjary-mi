"""
SQLAlchemy models for the application
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Decimal, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.db.database import Base


# Enums
class UserStatus(str, enum.Enum):
    EN_ATTENTE = "en_attente"
    VALIDE = "valide"
    REJETE = "rejete"


class PaymentMethod(str, enum.Enum):
    ESPECES = "especes"
    MOBILE_MONEY = "mobile_money"
    VIREMENT = "virement"
    CHEQUE = "cheque"


class CotisationType(str, enum.Enum):
    MENSUELLE = "mensuelle"
    ANNUELLE = "annuelle"
    EXCEPTIONNELLE = "exceptionnelle"


class DonType(str, enum.Enum):
    ARGENT = "argent"
    MATERIEL = "materiel"
    NOURRITURE = "nourriture"
    AUTRE = "autre"


class EventType(str, enum.Enum):
    FAMILIAL = "familial"
    CULTUREL = "culturel"
    COUTUME = "coutume"
    ANNONCE = "annonce"


class CoutumeCategory(str, enum.Enum):
    RITUEL = "rituel"
    CEREMONIE = "ceremonie"
    FETE = "fete"
    TRADITION = "tradition"
    INTERDICTION = "interdiction"


class CoutumePeriodicity(str, enum.Enum):
    ANNUELLE = "annuelle"
    SEMESTRIELLE = "semestrielle"
    MENSUELLE = "mensuelle"
    PONCTUELLE = "ponctuelle"
    PERMANENTE = "permanente"


class CoutumeImportance(str, enum.Enum):
    FAIBLE = "faible"
    MOYEN = "moyen"
    ELEVE = "eleve"
    SACRE = "sacre"


class ActorType(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    USER = "user"
    SYSTEM = "system"


# Models
class SuperAdmin(Base):
    __tablename__ = "super_admins"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    telephone = Column(String(30))
    mot_de_passe = Column(String(255), nullable=False)
    date_creation = Column(DateTime, server_default=func.now())
    
    # Relationships
    coutumes = relationship("Coutume", back_populates="createur")


class Tragnobe(Base):
    __tablename__ = "tragnobes"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(150), unique=True, nullable=False)
    description = Column(Text)
    nom_chef = Column(String(150))
    localisation = Column(String(200))
    actif = Column(Boolean, default=True)
    date_creation = Column(DateTime, server_default=func.now())
    
    # Relationships
    admins = relationship("Admin", back_populates="tragnobe")
    users = relationship("User", back_populates="tragnobe")


class Admin(Base):
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    telephone = Column(String(30))
    mot_de_passe = Column(String(255), nullable=False)
    id_tragnobe = Column(Integer, ForeignKey("tragnobes.id"), nullable=True)
    date_creation = Column(DateTime, server_default=func.now())
    
    # Relationships
    tragnobe = relationship("Tragnobe", back_populates="admins")
    evenements = relationship("Evenement", back_populates="admin")


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    telephone = Column(String(30), unique=True)
    mot_de_passe = Column(String(255), nullable=False)
    date_naissance = Column(DateTime)
    adresse = Column(Text)
    photo = Column(String(255))
    id_tragnobe = Column(Integer, ForeignKey("tragnobes.id"), nullable=False)
    statut = Column(Enum(UserStatus), default=UserStatus.EN_ATTENTE)
    date_inscription = Column(DateTime, server_default=func.now())
    date_validation = Column(DateTime)
    
    # Relationships
    tragnobe = relationship("Tragnobe", back_populates="users")
    cotisations = relationship("Cotisation", back_populates="user")
    dons = relationship("Don", back_populates="user")


class Cotisation(Base):
    __tablename__ = "cotisations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    montant = Column(Decimal(10, 2), nullable=False)
    date_paiement = Column(DateTime, server_default=func.now())
    type_cotisation = Column(Enum(CotisationType), default=CotisationType.MENSUELLE)
    moyen_paiement = Column(Enum(PaymentMethod), default=PaymentMethod.ESPECES)
    notes = Column(Text)
    
    # Relationships
    user = relationship("User", back_populates="cotisations")


class Don(Base):
    __tablename__ = "dons"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    montant = Column(Decimal(10, 2), nullable=False)
    date_don = Column(DateTime, server_default=func.now())
    nom_donateur = Column(String(150))
    type_don = Column(Enum(DonType), default=DonType.ARGENT)
    description = Column(Text)
    anonyme = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="dons")


class Evenement(Base):
    __tablename__ = "evenements"
    
    id = Column(Integer, primary_key=True, index=True)
    id_admin = Column(Integer, ForeignKey("admins.id"), nullable=False)
    titre = Column(String(150), nullable=False)
    description = Column(Text)
    date_evenement = Column(DateTime, nullable=False)
    lieu = Column(String(200))
    type = Column(Enum(EventType), default=EventType.FAMILIAL)
    participants_attendus = Column(Integer)
    date_publication = Column(DateTime, server_default=func.now())
    
    # Relationships
    admin = relationship("Admin", back_populates="evenements")


class Coutume(Base):
    __tablename__ = "coutumes"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    categorie = Column(Enum(CoutumeCategory), default=CoutumeCategory.TRADITION)
    periodicite = Column(Enum(CoutumePeriodicity), default=CoutumePeriodicity.ANNUELLE)
    date_celebration = Column(DateTime)
    importance = Column(Enum(CoutumeImportance), default=CoutumeImportance.MOYEN)
    regles = Column(Text)
    created_by = Column(Integer, ForeignKey("super_admins.id"), nullable=True)
    date_creation = Column(DateTime, server_default=func.now())
    
    # Relationships
    createur = relationship("SuperAdmin", back_populates="coutumes")


class LogActivite(Base):
    __tablename__ = "logs_activites"
    
    id = Column(Integer, primary_key=True, index=True)
    acteur_type = Column(Enum(ActorType), nullable=False)
    acteur_id = Column(Integer, nullable=False)
    action = Column(String(255), nullable=False)
    date_action = Column(DateTime, server_default=func.now(), index=True)
