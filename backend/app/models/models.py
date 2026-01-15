"""
SQLAlchemy models synchronized with mananjary-mi database
"""
from sqlalchemy import Column, Integer, BigInteger, String, Text, Date, DateTime, Numeric, Enum, ForeignKey, Boolean, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from decimal import Decimal
import enum

from app.db.database import Base


# ==================== ENUMS ====================

class GenreEnum(str, enum.Enum):
    H = "H"
    F = "F"


class UserStatusEnum(str, enum.Enum):
    en_attente = "en_attente"
    valide = "valide"
    rejete = "rejete"


class PaymentMethodEnum(str, enum.Enum):
    mobile_money = "mobile_money"
    virement = "virement"
    especes = "especes"
    cheque = "cheque"


class CotisationStatusEnum(str, enum.Enum):
    en_attente = "en_attente"
    reussie = "reussie"
    echouee = "echouee"


class EventTypeEnum(str, enum.Enum):
    familial = "familial"
    culturel = "culturel"
    reunion = "reunion"
    autre = "autre"


class RelationTypeEnum(str, enum.Enum):
    pere = "pere"
    mere = "mere"
    fils = "fils"
    fille = "fille"
    epoux = "epoux"
    epouse = "epouse"


class NotificationTypeEnum(str, enum.Enum):
    info = "info"
    succes = "succes"
    avertissement = "avertissement"
    erreur = "erreur"


class ActorTypeEnum(str, enum.Enum):
    super_admin = "super_admin"
    admin = "admin"
    user = "user"


# ==================== MODELS ====================

class Role(Base):
    """Table roles"""
    __tablename__ = "roles"
    
    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    nom = Column(String(50), unique=True, nullable=False)
    description = Column(String(255))
    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)
    
    # Relationships
    users = relationship("User", back_populates="role")


class Tragnobe(Base):
    """Table tragnobes"""
    __tablename__ = "tragnobes"
    
    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    nom = Column(String(150), unique=True, nullable=False)
    localisation = Column(String(200))
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    users = relationship("User", back_populates="tragnobe")
    lohantragno = relationship("Lohantragno", back_populates="tragnobe")


class Lohantragno(Base):
    """Table lohantragno - Subdivisions des tragnobes"""
    __tablename__ = "lohantragno"
    
    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    nom = Column(String(255), nullable=False)
    id_tragnobe = Column(BigInteger, ForeignKey("tragnobes.id"), nullable=False)
    description = Column(Text)
    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)
    
    # Relationships
    tragnobe = relationship("Tragnobe", back_populates="lohantragno")
    users = relationship("User", back_populates="lohantragno")


class User(Base):
    """Table users"""
    __tablename__ = "users"
    
    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    id_role = Column(BigInteger, ForeignKey("roles.id"), nullable=False, default=3)
    id_tragnobe = Column(BigInteger, ForeignKey("tragnobes.id"))
    id_lohantragno = Column(BigInteger, ForeignKey("lohantragno.id"))
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    genre = Column(Enum(GenreEnum, native_enum=False), nullable=False)
    telephone = Column(String(20), nullable=False)
    email = Column(String(150), unique=True, index=True)
    ville = Column(String(100))
    annee_naissance = Column(Integer)  # YEAR type
    photo = Column(String(255))
    statut = Column(Enum(UserStatusEnum, native_enum=False), nullable=False, default=UserStatusEnum.en_attente)
    mot_de_passe = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    role = relationship("Role", back_populates="users")
    tragnobe = relationship("Tragnobe", back_populates="users")
    lohantragno = relationship("Lohantragno", back_populates="users")
    cotisations = relationship("Cotisation", back_populates="user")
    dons = relationship("Don", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    relations_as_user1 = relationship("Relation", foreign_keys="Relation.id_user1", back_populates="user1")
    relations_as_user2 = relationship("Relation", foreign_keys="Relation.id_user2", back_populates="user2")


class Cotisation(Base):
    """Table cotisations"""
    __tablename__ = "cotisations"
    
    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    id_user = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    montant = Column(Numeric(10, 2), nullable=False)
    moyen_paiement = Column(Enum(PaymentMethodEnum, native_enum=False), nullable=False)
    reference_transaction = Column(String(100))
    statut = Column(Enum(CotisationStatusEnum, native_enum=False), nullable=False, default=CotisationStatusEnum.en_attente)
    date_cotisation = Column(Date, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="cotisations")


class Don(Base):
    """Table dons"""
    __tablename__ = "dons"
    
    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    id_user = Column(BigInteger, ForeignKey("users.id"))
    montant = Column(Numeric(10, 2), nullable=False)
    message = Column(Text)
    anonyme = Column(Boolean, nullable=False, default=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="dons")


class Evenement(Base):
    """Table evenements"""
    __tablename__ = "evenements"
    
    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    id_admin = Column(BigInteger, ForeignKey("users.id"))
    titre = Column(String(200), nullable=False)
    description = Column(Text)
    type = Column(Enum(EventTypeEnum, native_enum=False), nullable=False)
    date_debut = Column(DateTime, nullable=False)
    date_fin = Column(DateTime)
    lieu = Column(String(200))
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    admin = relationship("User", foreign_keys=[id_admin])


class Coutume(Base):
    """Table coutumes"""
    __tablename__ = "coutumes"
    
    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    id_super_admin = Column(BigInteger, ForeignKey("users.id"))
    titre = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    created_by = Column(Integer, comment="Utilisateur créateur")
    categorie = Column(String(100), comment="Catégorie de la coutume")
    periodicite = Column(String(100), comment="Périodicité de la coutume")
    date_celebration = Column(Date, comment="Date de célébration")
    niveau_importance = Column(String(50), comment="Niveau d'importance")
    regles_pratiques = Column(Text, comment="Règles et pratiques")
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    super_admin = relationship("User", foreign_keys=[id_super_admin])


class Relation(Base):
    """Table relations - Relations familiales"""
    __tablename__ = "relations"
    
    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    id_user1 = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    id_user2 = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    type_relation = Column(Enum(RelationTypeEnum, native_enum=False), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    
    # Relationships
    user1 = relationship("User", foreign_keys=[id_user1], back_populates="relations_as_user1")
    user2 = relationship("User", foreign_keys=[id_user2], back_populates="relations_as_user2")


class Notification(Base):
    """Table notifications"""
    __tablename__ = "notifications"
    
    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    id_user = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    titre = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationTypeEnum, native_enum=False), nullable=False, default=NotificationTypeEnum.info)
    lue = Column(Boolean, nullable=False, default=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="notifications")


class LogActivite(Base):
    """Table logs_activites"""
    __tablename__ = "logs_activites"
    
    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    acteur_type = Column(Enum(ActorTypeEnum, native_enum=False), nullable=False)
    acteur_id = Column(BigInteger, nullable=False)
    action = Column(String(100), nullable=False)
    description = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
