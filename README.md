# 🏛️ Mananjary-mi - Python (FastAPI) + React

**Plateforme de gestion communautaire pour Mananjary**

Version modernisée du projet original Laravel/Vanilla JS migré vers Python FastAPI + React.

---

## 📋 Description

Application complète de gestion de communauté avec :
- 👥 **Gestion des membres** avec validation par admins
- 🏘️ **Organisation par tragnobes** (clans familiaux)
- 💰 **Suivi des cotisations et dons**
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
- `POST /api/v1/tragnobes` - Créer un tragnobe
- `PUT /api/v1/tragnobes/{id}` - Modifier un tragnobe

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

---

## 🛠️ Développement

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
