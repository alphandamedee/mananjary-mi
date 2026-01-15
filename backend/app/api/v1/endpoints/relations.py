"""
Relations routes - Gestion des relations familiales
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas.schemas import RelationCreate, RelationResponse
from app.models.models import Relation, User, LogActivite, ActorTypeEnum, RelationTypeEnum

router = APIRouter()


@router.get("/", response_model=List[RelationResponse])
async def get_relations(
    skip: int = 0, 
    limit: int = 100,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all relations with optional filter by user"""
    query = db.query(Relation)
    
    if user_id:
        query = query.filter(
            (Relation.id_user1 == user_id) | (Relation.id_user2 == user_id)
        )
    
    relations = query.offset(skip).limit(limit).all()
    return relations


@router.get("/{relation_id}", response_model=RelationResponse)
async def get_relation(relation_id: int, db: Session = Depends(get_db)):
    """Get relation by ID"""
    relation = db.query(Relation).filter(Relation.id == relation_id).first()
    if not relation:
        raise HTTPException(status_code=404, detail="Relation non trouvée")
    return relation


@router.get("/user/{user_id}", response_model=List[RelationResponse])
async def get_user_relations(user_id: int, db: Session = Depends(get_db)):
    """Get all relations for a specific user"""
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    relations = db.query(Relation).filter(
        (Relation.id_user1 == user_id) | (Relation.id_user2 == user_id)
    ).all()
    return relations


@router.get("/family-tree/{user_id}")
async def get_family_tree(user_id: int, db: Session = Depends(get_db)):
    """Get family tree for a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Get all relations
    relations = db.query(Relation).filter(
        (Relation.id_user1 == user_id) | (Relation.id_user2 == user_id)
    ).all()
    
    family_tree = {
        "user": {
            "id": user.id,
            "nom": user.nom,
            "prenom": user.prenom,
            "genre": user.genre.value
        },
        "parents": [],
        "enfants": [],
        "conjoint": None,
        "freres_soeurs": []
    }
    
    for relation in relations:
        if relation.id_user1 == user_id:
            related_user = db.query(User).filter(User.id == relation.id_user2).first()
            if related_user:
                user_data = {
                    "id": related_user.id,
                    "nom": related_user.nom,
                    "prenom": related_user.prenom,
                    "type_relation": relation.type_relation.value
                }
                
                if relation.type_relation in [RelationTypeEnum.PERE, RelationTypeEnum.MERE]:
                    family_tree["parents"].append(user_data)
                elif relation.type_relation in [RelationTypeEnum.EPOUX, RelationTypeEnum.EPOUSE]:
                    family_tree["conjoint"] = user_data
        
        elif relation.id_user2 == user_id:
            related_user = db.query(User).filter(User.id == relation.id_user1).first()
            if related_user:
                user_data = {
                    "id": related_user.id,
                    "nom": related_user.nom,
                    "prenom": related_user.prenom,
                    "type_relation": relation.type_relation.value
                }
                
                if relation.type_relation in [RelationTypeEnum.FILS, RelationTypeEnum.FILLE]:
                    family_tree["enfants"].append(user_data)
    
    return family_tree


@router.post("/", response_model=RelationResponse, status_code=status.HTTP_201_CREATED)
async def create_relation(relation: RelationCreate, db: Session = Depends(get_db)):
    """Create a new relation"""
    
    # Verify both users exist
    user1 = db.query(User).filter(User.id == relation.id_user1).first()
    if not user1:
        raise HTTPException(status_code=404, detail="Utilisateur 1 non trouvé")
    
    user2 = db.query(User).filter(User.id == relation.id_user2).first()
    if not user2:
        raise HTTPException(status_code=404, detail="Utilisateur 2 non trouvé")
    
    # Check if relation already exists
    existing = db.query(Relation).filter(
        Relation.id_user1 == relation.id_user1,
        Relation.id_user2 == relation.id_user2
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Cette relation existe déjà")
    
    db_relation = Relation(**relation.model_dump())
    db.add(db_relation)
    db.commit()
    db.refresh(db_relation)
    
    # Log activity
    log = LogActivite(
        acteur_type=ActorTypeEnum.ADMIN,
        acteur_id=0,
        action="Nouvelle relation",
        description=f"{user1.prenom} {user1.nom} - {relation.type_relation.value} - {user2.prenom} {user2.nom}"
    )
    db.add(log)
    db.commit()
    
    return db_relation


@router.delete("/{relation_id}")
async def delete_relation(relation_id: int, db: Session = Depends(get_db)):
    """Delete relation"""
    db_relation = db.query(Relation).filter(Relation.id == relation_id).first()
    if not db_relation:
        raise HTTPException(status_code=404, detail="Relation non trouvée")
    
    db.delete(db_relation)
    db.commit()
    
    return {"message": "Relation supprimée avec succès"}
