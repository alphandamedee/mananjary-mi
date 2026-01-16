# 🏛️ Mananjary-mi - Python (FastAPI) + React

**Plateforme de gestion communautaire pour Mananjary**

Version modernisée du projet original Laravel/Vanilla JS migré vers Python FastAPI + React.

---

## 📋 Description

Application complète de gestion de communauté avec :
- 👥 **Gestion des membres** avec validation par admins
- 🏘️ **Organisation par tragnobes** (clans familiaux)
- �‍👩‍👧‍👦 **Relations familiales** avec arbre généalogique interactif
- �💰 **Suivi des cotisations et dons**
- 📅 **Gestion des événements et coutumes**
- 📊 **Dashboard statistiques** en temps réel
- 🔐 **Authentification JWT** sécurisée

---

## 🚀 Technologies utilisées

### Backend (FastAPI)
- **Python 3.10+**
- **FastAPI** - Framework web moderne et rapide
- **SQLAlchemy** - ORM pour la base de données
- **PyMySQL** - Driver MySQL
- **Pydantic** - Validation des données
- **python-jose** - Gestion des tokens JWT
- **Passlib** - Hachage des mots de passe

### Frontend (React)
- **React 18** - Bibliothèque UI
- **Vite** - Build tool rapide
- **React Router** - Navigation
- **Axios** - Client HTTP
- **CSS moderne** - Design responsive

### Base de données
- **MySQL 9.1.0** - Base de données relationnelle

---

## 📁 Structure du projet

```
mananjary-mi/
├── backend/                    # API FastAPI
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/  # Routes API
│   │   │       │   ├── auth.py
│   │   │       │   ├── users.py
│   │   │       │   ├── tragnobes.py
│   │   │       │   ├── relations.py
│   │   │       │   ├── cotisations.py
│   │   │       │   ├── dons.py
│   │   │       │   ├── evenements.py
│   │   │       │   ├── coutumes.py
│   │   │       │   └── logs.py
│   │   │       └── api.py
│   │   ├── core/              # Configuration
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── db/                # Base de données
│   │   │   └── database.py
│   │   ├── models/            # Modèles SQLAlchemy
│   │   │   └── models.py
│   │   └── schemas/           # Schémas Pydantic
│   │       └── schemas.py
│   ├── main.py                # Point d'entrée FastAPI
│   ├── requirements.txt       # Dépendances Python
│   └── .env.example          # Configuration exemple
│
└── frontend/                  # Application React
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard/     # Composants du dashboard
    │   │   │   ├── DashboardHome.jsx
    │   │   │   ├── Members.jsx
    │   │   │   ├── Profile.jsx
    │   │   │   ├── Relations.jsx
    │   │   │   ├── Tragnobes.jsx
    │   │   │   ├── Cotisations.jsx
    │   │   │   ├── Dons.jsx
    │   │   │   ├── Evenements.jsx
    │   │   │   ├── Coutumes.jsx
    │   │   │   └── Logs.jsx
    │   │   └── Sidebar.jsx
    │   ├── contexts/          # Context API
    │   │   └── AuthContext.jsx
    │   ├── pages/             # Pages principales
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx
    │   ├── services/          # Services API
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

---

## 🔧 Installation

### Prérequis
- Python 3.10+
- Node.js 18+
- MySQL 9.1.0+

### 1. Backend FastAPI

```bash
# Aller dans le dossier backend
cd backend

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement (Windows)
venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Copier et configurer .env
copy .env.example .env
# Éditer .env avec vos paramètres de base de données

# Lancer le serveur
python main.py
# ou
uvicorn main:app --reload
```

Le backend sera accessible sur **http://localhost:8000**

**Documentation API** : http://localhost:8000/api/docs

### 2. Frontend React

```bash
# Aller dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le frontend sera accessible sur **http://localhost:5173**

### 3. Base de données

Utilisez le même schéma SQL que le projet Laravel :

```bash
# Se connecter à MySQL
mysql -u root -p

# Créer la base de données
CREATE DATABASE antambahoaka_connect;

# Importer le schéma
USE antambahoaka_connect;
SOURCE ../antambahoaka-backend/database/schema_antambahoaka_connect.sql;
```

---

## 📡 API Endpoints

### Authentification
- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/logout` - Déconnexion

### Utilisateurs
- `GET /api/v1/users` - Liste des membres
- `GET /api/v1/users/en-attente` - Membres en attente
- `GET /api/v1/users/valides` - Membres validés
- `POST /api/v1/users/{id}/valider` - Valider un membre
- `POST /api/v1/users/{id}/rejeter` - Rejeter un membre

### Tragnobes
- `GET /api/v1/tragnobes` - Liste des tragnobes
- `GET /api/v1/tragnobes/{id}` - Détails d'un tragnobe
- `GET /api/v1/tragnobes/{id}/historique` - Historique des Ampanjaka
- `POST /api/v1/tragnobes` - Créer un tragnobe
- `PUT /api/v1/tragnobes/{id}` - Modifier un tragnobe (enregistre automatiquement l'historique si changement d'Ampanjaka)
- `DELETE /api/v1/tragnobes/{id}` - Supprimer un tragnobe

### Relations Familiales
- `GET /api/v1/relations` - Liste des relations
- `POST /api/v1/relations` - Créer une relation
- `DELETE /api/v1/relations/{id}` - Supprimer une relation

### Cotisations
- `GET /api/v1/cotisations` - Liste des cotisations
- `POST /api/v1/cotisations` - Créer une cotisation

### Dons
- `GET /api/v1/dons` - Liste des dons
- `POST /api/v1/dons` - Créer un don

### Événements
- `GET /api/v1/evenements` - Liste des événements
- `POST /api/v1/evenements` - Créer un événement

### Coutumes
- `GET /api/v1/coutumes` - Liste des coutumes
- `POST /api/v1/coutumes` - Créer une coutume

### Logs
- `GET /api/v1/logs` - Liste des logs
- `GET /api/v1/logs/recent` - Logs récents

---

## 🔐 Comptes de test

### Super Admin
```
Email: alphandamedee@gmail.mg
Mot de passe: password123
```

### Admin
```
Email: paul.randria@antambahoaka.mg
Mot de passe: password123
```

### Membre
```
Email: tsiky.rakotomalala@gmail.com
Mot de passe: password123
```

---

## ✨ Fonctionnalités

### Backend
✅ API REST complète avec FastAPI  
✅ Authentification JWT  
✅ Validation des données avec Pydantic  
✅ ORM SQLAlchemy  
✅ Logging automatique des activités  
✅ CORS configuré  
✅ Documentation interactive (Swagger/ReDoc)

### Frontend
✅ Interface React moderne et responsive  
✅ Authentification avec Context API  
✅ Navigation avec React Router  
✅ Dashboard avec statistiques  
✅ Gestion complète des entités  
✅ **Arbre généalogique interactif**  
✅ **Gestion des relations familiales dans le profil**  
✅ **Détection automatique des frères et sœurs**  
✅ **Affichage visuel avec cartes interactives**  
✅ Design moderne avec CSS  
✅ Messages de succès/erreur  
✅ Chargement asynchrone des données

---

## 🚀 Build pour production

### Backend
```bash
# Installer gunicorn
pip install gunicorn

# Lancer en production
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend
```bash
# Build
npm run build

# Le dossier dist/ contient les fichiers à déployer
```

---

## 📝 Migration depuis Laravel

Ce projet est une migration complète du projet Laravel original :

**Changements principaux :**
- Backend Laravel → FastAPI (Python)
- Frontend Vanilla JS → React
- Sessions PHP → JWT Tokens
- Blade templates → React Components
- Eloquent ORM → SQLAlchemy
- Routes Laravel → FastAPI Routes

**Améliorations :**
- API plus rapide avec FastAPI
- Interface utilisateur moderne avec React
- Meilleure séparation frontend/backend
- Documentation API automatique
- Validation des données renforcée
- Code plus maintenable et scalable
- **Visualisation graphique des arbres généalogiques**
- **Gestion complète des relations familiales**
- **Détection intelligente des liens de parenté**

---

## 🌳 Gestion des Relations Familiales

### Fonctionnalités

#### Visualisation de l'arbre généalogique
- **Arbre centré sur l'utilisateur connecté** : Affichage par générations avec l'utilisateur au centre
- **Deux modes de visualisation** : Vue arbre hiérarchique et vue tableau
- **Cartes utilisateur interactives** : Photo, nom, genre et badge "Vous" pour l'utilisateur actuel
- **Détection automatique des relations** : Parents, enfants, conjoints et frères/sœurs
- **Design moderne** : Lignes de connexion entre générations, cœur pour les mariages

#### Gestion dans le profil
- **Interface intuitive** : 3 boutons pour ajouter Parents, Enfants ou Conjoint
- **Affichage organisé par catégories** :
  - 👨‍👦 Parents
  - 👨‍👩‍👧‍👦 Frères et Sœurs (détection automatique via parents communs)
  - 💑 Conjoint(e)
  - 👶 Enfants
- **Cartes visuelles** : Photo circulaire, nom et icône de genre
- **Suppression facile** : Bouton de suppression sur chaque carte
- **Types de relations** : Père, Mère, Fils, Fille, Époux, Épouse

#### Détection intelligente
- **Frères et sœurs automatiques** : Les utilisateurs partageant les mêmes parents sont automatiquement identifiés comme frères et sœurs
- **Construction dynamique de l'arbre** : Parcours récursif des relations pour afficher plusieurs générations
- **Marquage des relations** : Badges colorés pour identifier rapidement le type de lien

### API Endpoints Relations

```bash
# Récupérer toutes les relations
GET /api/v1/relations

# Créer une nouvelle relation
POST /api/v1/relations
{
  "id_user1": 1,
  "id_user2": 2,
  "type_relation": "pere"  # pere, mere, fils, fille, epoux, epouse
}

# Supprimer une relation
DELETE /api/v1/relations/{id}
```

### Modèle de données

```python
class Relation(Base):
    __tablename__ = "relations"
    
    id = Column(Integer, primary_key=True, index=True)
    id_user1 = Column(Integer, ForeignKey("users.id"))
    id_user2 = Column(Integer, ForeignKey("users.id"))
    type_relation = Column(Enum(RelationTypeEnum))
    created_at = Column(DateTime, default=datetime.utcnow)
```

**Types de relations supportés** : `pere`, `mere`, `fils`, `fille`, `epoux`, `epouse`

---

## � Dictionnaire des Données

### 📋 Tables de la Base de Données

#### 1️⃣ **users** - Utilisateurs
Table centrale contenant tous les membres de la communauté.

| Champ | Type | Description | Contraintes |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identifiant unique | PRIMARY KEY, AUTO_INCREMENT |
| `id_role` | BIGINT | Rôle de l'utilisateur | FOREIGN KEY → roles.id, DEFAULT 3 |
| `id_tragnobe` | BIGINT | Clan familial | FOREIGN KEY → tragnobes.id, NULLABLE |
| `id_lohantragno` | BIGINT | Subdivision du clan | FOREIGN KEY → lohantragno.id, NULLABLE |
| `nom` | VARCHAR(100) | Nom de famille | NOT NULL |
| `prenom` | VARCHAR(100) | Prénom | NOT NULL |
| `genre` | ENUM | Genre (H/F) | NOT NULL, VALUES: 'H', 'F' |
| `telephone` | VARCHAR(20) | Numéro de téléphone | NOT NULL |
| `email` | VARCHAR(150) | Adresse email | UNIQUE, INDEXED |
| `ville` | VARCHAR(100) | Ville de résidence | NULLABLE |
| `annee_naissance` | INT | Année de naissance | NULLABLE |
| `photo` | VARCHAR(255) | Chemin de la photo de profil | NULLABLE |
| `statut` | ENUM | Statut du compte | NOT NULL, DEFAULT 'en_attente', VALUES: 'en_attente', 'valide', 'rejete' |
| `mot_de_passe` | VARCHAR(255) | Mot de passe haché | NOT NULL |
| `created_at` | TIMESTAMP | Date de création | AUTO |
| `updated_at` | TIMESTAMP | Date de modification | AUTO |

**Relations :**
- Appartient à un `role`
- Appartient à un `tragnobe` (optionnel)
- Appartient à un `lohantragno` (optionnel)
- Possède plusieurs `cotisations`
- Possède plusieurs `dons`
- Possède plusieurs `notifications`
- Possède plusieurs `relations` (via user1 et user2)

---

#### 2️⃣ **roles** - Rôles des Utilisateurs
Définit les permissions et niveaux d'accès.

| Champ | Type | Description | Contraintes |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identifiant unique | PRIMARY KEY, AUTO_INCREMENT |
| `nom` | VARCHAR(50) | Nom du rôle | UNIQUE, NOT NULL |
| `description` | VARCHAR(255) | Description du rôle | NULLABLE |
| `created_at` | TIMESTAMP | Date de création | AUTO |
| `updated_at` | TIMESTAMP | Date de modification | AUTO |

**Rôles standards :**
- `super_admin` - Administrateur principal
- `admin` - Administrateur
- `user` - Membre standard

---

#### 3️⃣ **tragnobes** - Clans Familiaux
Représente les grandes familles ou clans de la communauté avec leur Ampanjaka (chef) et Lefitra (adjoint).

| Champ | Type | Description | Contraintes |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identifiant unique | PRIMARY KEY, AUTO_INCREMENT |
| `nom` | VARCHAR(150) | Nom du tragnobe | UNIQUE, NOT NULL |
| `localisation` | VARCHAR(200) | Localisation géographique | NULLABLE |
| `ampanjaka` | VARCHAR(150) | Chef actuel du tragnobe | NULLABLE |
| `lefitra` | VARCHAR(150) | Adjoint du chef | NULLABLE |
| `date_debut` | DATE | Date de début du règne actuel | NULLABLE |
| `date_fin` | DATE | Date de fin du règne (NULL si en cours) | NULLABLE |
| `description` | TEXT | Description du tragnobe | NULLABLE |
| `created_at` | TIMESTAMP | Date de création | AUTO |
| `updated_at` | TIMESTAMP | Date de modification | AUTO |

**Relations :**
- Contient plusieurs `users`
- Contient plusieurs `lohantragno`
- Possède un historique dans `historique_ampanjaka`

---

#### 3️⃣ bis **historique_ampanjaka** - Historique des Chefs
Stocke l'historique complet des Ampanjaka (chefs) de chaque tragnobe.

| Champ | Type | Description | Contraintes |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identifiant unique | PRIMARY KEY, AUTO_INCREMENT |
| `id_tragnobe` | BIGINT | Tragnobe concerné | FOREIGN KEY → tragnobes.id, NOT NULL |
| `ampanjaka` | VARCHAR(150) | Nom du chef | NOT NULL |
| `lefitra` | VARCHAR(150) | Adjoint du chef | NULLABLE |
| `date_debut` | DATE | Date de début du règne | NOT NULL |
| `date_fin` | DATE | Date de fin du règne (NULL si en cours) | NULLABLE |
| `raison_fin` | VARCHAR(255) | Raison de fin de règne | NULLABLE |
| `created_at` | TIMESTAMP | Date de création | AUTO |

**Relations :**
- Appartient à un `tragnobe`

---

#### 4️⃣ **lohantragno** - Subdivisions des Tragnobes
Subdivisions ou branches des clans familiaux.

| Champ | Type | Description | Contraintes |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identifiant unique | PRIMARY KEY, AUTO_INCREMENT |
| `nom` | VARCHAR(255) | Nom de la subdivision | NOT NULL |
| `id_tragnobe` | BIGINT | Tragnobe parent | FOREIGN KEY → tragnobes.id, NOT NULL |
| `description` | TEXT | Description | NULLABLE |
| `created_at` | TIMESTAMP | Date de création | AUTO |
| `updated_at` | TIMESTAMP | Date de modification | AUTO |

**Relations :**
- Appartient à un `tragnobe`
- Contient plusieurs `users`

---

#### 5️⃣ **relations** - Relations Familiales
Gestion des liens de parenté entre membres.

| Champ | Type | Description | Contraintes |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identifiant unique | PRIMARY KEY, AUTO_INCREMENT |
| `id_user1` | BIGINT | Premier utilisateur | FOREIGN KEY → users.id, NOT NULL |
| `id_user2` | BIGINT | Deuxième utilisateur | FOREIGN KEY → users.id, NOT NULL |
| `type_relation` | ENUM | Type de relation | NOT NULL, VALUES: 'pere', 'mere', 'fils', 'fille', 'epoux', 'epouse' |
| `created_at` | TIMESTAMP | Date de création | AUTO |

**Types de relations :**
- `pere` - user1 est le père de user2
- `mere` - user1 est la mère de user2
- `fils` - user1 est le fils de user2
- `fille` - user1 est la fille de user2
- `epoux` - user1 est l'époux de user2
- `epouse` - user1 est l'épouse de user2

**Relations :**
- Relie deux `users`

---

#### 6️⃣ **cotisations** - Cotisations des Membres
Suivi des paiements des cotisations.

| Champ | Type | Description | Contraintes |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identifiant unique | PRIMARY KEY, AUTO_INCREMENT |
| `id_user` | BIGINT | Utilisateur concerné | FOREIGN KEY → users.id, NOT NULL |
| `montant` | DECIMAL(10,2) | Montant de la cotisation | NOT NULL |
| `moyen_paiement` | ENUM | Moyen de paiement | NOT NULL, VALUES: 'mobile_money', 'virement', 'especes', 'cheque' |
| `reference_transaction` | VARCHAR(100) | Référence de transaction | NULLABLE |
| `statut` | ENUM | Statut du paiement | NOT NULL, DEFAULT 'en_attente', VALUES: 'en_attente', 'reussie', 'echouee' |
| `date_cotisation` | DATE | Date de la cotisation | NOT NULL |
| `created_at` | TIMESTAMP | Date de création | AUTO |
| `updated_at` | TIMESTAMP | Date de modification | AUTO |

**Relations :**
- Appartient à un `user`

---

#### 7️⃣ **dons** - Dons à la Communauté
Gestion des dons effectués par les membres.

| Champ | Type | Description | Contraintes |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identifiant unique | PRIMARY KEY, AUTO_INCREMENT |
| `id_user` | BIGINT | Donateur | FOREIGN KEY → users.id, NULLABLE |
| `montant` | DECIMAL(10,2) | Montant du don | NOT NULL |
| `message` | TEXT | Message du donateur | NULLABLE |
| `anonyme` | BOOLEAN | Don anonyme ou non | NOT NULL, DEFAULT FALSE |
| `created_at` | TIMESTAMP | Date de création | AUTO |

**Relations :**
- Appartient à un `user` (optionnel si anonyme)

---

#### 8️⃣ **evenements** - Événements de la Communauté
Calendrier des événements organisés.

| Champ | Type | Description | Contraintes |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identifiant unique | PRIMARY KEY, AUTO_INCREMENT |
| `id_admin` | BIGINT | Administrateur créateur | FOREIGN KEY → users.id, NULLABLE |
| `titre` | VARCHAR(200) | Titre de l'événement | NOT NULL |
| `description` | TEXT | Description détaillée | NULLABLE |
| `type` | ENUM | Type d'événement | NOT NULL, VALUES: 'familial', 'culturel', 'reunion', 'autre' |
| `date_debut` | DATETIME | Date et heure de début | NOT NULL |
| `date_fin` | DATETIME | Date et heure de fin | NULLABLE |
| `lieu` | VARCHAR(200) | Lieu de l'événement | NULLABLE |
| `created_at` | TIMESTAMP | Date de création | AUTO |
| `updated_at` | TIMESTAMP | Date de modification | AUTO |

**Relations :**
- Créé par un `user` (admin)

---

#### 9️⃣ **coutumes** - Coutumes et Traditions
Documentation des coutumes traditionnelles.

| Champ | Type | Description | Contraintes |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identifiant unique | PRIMARY KEY, AUTO_INCREMENT |
| `id_super_admin` | BIGINT | Super admin créateur | FOREIGN KEY → users.id, NULLABLE |
| `titre` | VARCHAR(200) | Titre de la coutume | NOT NULL |
| `description` | TEXT | Description complète | NOT NULL |
| `created_by` | INT | ID de l'utilisateur créateur | NULLABLE |
| `categorie` | VARCHAR(100) | Catégorie de la coutume | NULLABLE |
| `periodicite` | VARCHAR(100) | Fréquence de célébration | NULLABLE |
| `date_celebration` | DATE | Date de célébration | NULLABLE |
| `niveau_importance` | VARCHAR(50) | Niveau d'importance | NULLABLE |
| `regles_pratiques` | TEXT | Règles et pratiques | NULLABLE |
| `created_at` | TIMESTAMP | Date de création | AUTO |
| `updated_at` | TIMESTAMP | Date de modification | AUTO |

**Relations :**
- Créé par un `user` (super_admin)

---

#### 🔟 **notifications** - Notifications Utilisateurs
Système de notifications pour les utilisateurs.

| Champ | Type | Description | Contraintes |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identifiant unique | PRIMARY KEY, AUTO_INCREMENT |
| `id_user` | BIGINT | Utilisateur destinataire | FOREIGN KEY → users.id, NOT NULL |
| `titre` | VARCHAR(200) | Titre de la notification | NOT NULL |
| `message` | TEXT | Message de la notification | NOT NULL |
| `type` | ENUM | Type de notification | NOT NULL, DEFAULT 'info', VALUES: 'info', 'succes', 'avertissement', 'erreur' |
| `lue` | BOOLEAN | Notification lue ou non | NOT NULL, DEFAULT FALSE |
| `created_at` | TIMESTAMP | Date de création | AUTO |

**Relations :**
- Appartient à un `user`

---

#### 1️⃣1️⃣ **logs_activites** - Journal des Activités
Traçabilité de toutes les actions dans le système.

| Champ | Type | Description | Contraintes |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identifiant unique | PRIMARY KEY, AUTO_INCREMENT |
| `acteur_type` | ENUM | Type d'acteur | NOT NULL, VALUES: 'super_admin', 'admin', 'user' |
| `acteur_id` | BIGINT | ID de l'acteur | NOT NULL |
| `action` | VARCHAR(100) | Action effectuée | NOT NULL |
| `description` | TEXT | Description de l'action | NULLABLE |
| `created_at` | TIMESTAMP | Date de création | AUTO |

**Actions courantes :**
- Création, modification, suppression d'entités
- Validation/rejet de membres
- Connexions/déconnexions
- Paiements de cotisations
- Création d'événements

---

### 🔗 Schéma Relationnel

```
users ←→ roles (many-to-one)
users ←→ tragnobes (many-to-one)
users ←→ lohantragno (many-to-one)
users ←→ cotisations (one-to-many)
users ←→ dons (one-to-many)
users ←→ notifications (one-to-many)
users ←→ relations (many-to-many via user1/user2)
tragnobes ←→ lohantragno (one-to-many)
```

---

### 📝 Types Énumérés (ENUM)

#### GenreEnum
- `H` - Homme
- `F` - Femme

#### UserStatusEnum
- `en_attente` - Compte en attente de validation
- `valide` - Compte validé
- `rejete` - Compte rejeté

#### PaymentMethodEnum
- `mobile_money` - Paiement mobile (Mvola, Orange Money, etc.)
- `virement` - Virement bancaire
- `especes` - Espèces
- `cheque` - Chèque

#### CotisationStatusEnum
- `en_attente` - En attente de validation
- `reussie` - Paiement réussi
- `echouee` - Paiement échoué

#### EventTypeEnum
- `familial` - Événement familial
- `culturel` - Événement culturel
- `reunion` - Réunion
- `autre` - Autre type

#### RelationTypeEnum
- `pere` - Relation père
- `mere` - Relation mère
- `fils` - Relation fils
- `fille` - Relation fille
- `epoux` - Relation époux
- `epouse` - Relation épouse

#### NotificationTypeEnum
- `info` - Information
- `succes` - Succès
- `avertissement` - Avertissement
- `erreur` - Erreur

#### ActorTypeEnum
- `super_admin` - Super administrateur
- `admin` - Administrateur
- `user` - Utilisateur standard

---

## �🛠️ Développement

### Backend
```bash
# Activer le mode debug
DEBUG=True dans .env

# Recharger automatiquement
uvicorn main:app --reload

# Tester l'API
# Ouvrir http://localhost:8000/api/docs
```

### Frontend
```bash
# Mode développement avec hot reload
npm run dev

# Linter
npm run lint
```

---

## 📄 License

MIT License

---

## 👨‍💻 Auteur

Migration Python/React du projet Laravel Mananjary-mi

**Date de création** : Janvier 2026
