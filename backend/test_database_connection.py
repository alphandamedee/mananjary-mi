"""
Script de test de connexion à la base de données
Vérifie que la connexion fonctionne et affiche les statistiques
"""
import sys
from pathlib import Path

# Ajouter le répertoire parent au path pour les imports
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.models import (
    Base, User, Role, Tragnobe, Lohantragno, 
    Cotisation, Don, Evenement, Coutume, 
    Relation, Notification, LogActivite
)

def test_database_connection():
    """Test la connexion à la base de données"""
    print("=" * 70)
    print("🔍 TEST DE CONNEXION À LA BASE DE DONNÉES")
    print("=" * 70)
    print()
    
    # Créer l'engine
    print(f"📡 URL de connexion: {settings.DATABASE_URL}")
    print()
    
    try:
        engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            echo=False
        )
        
        # Tester la connexion
        with engine.connect() as connection:
            result = connection.execute(text("SELECT VERSION()"))
            version = result.fetchone()[0]
            print(f"✅ Connexion réussie!")
            print(f"📊 Version MySQL: {version}")
            print()
        
        # Créer une session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        print("=" * 70)
        print("📈 STATISTIQUES DE LA BASE DE DONNÉES")
        print("=" * 70)
        print()
        
        # Compter les enregistrements dans chaque table
        tables_stats = [
            ("Rôles", Role),
            ("Tragnobes", Tragnobe),
            ("Lohantragno", Lohantragno),
            ("Utilisateurs", User),
            ("Cotisations", Cotisation),
            ("Dons", Don),
            ("Événements", Evenement),
            ("Coutumes", Coutume),
            ("Relations", Relation),
            ("Notifications", Notification),
            ("Logs d'activité", LogActivite)
        ]
        
        for table_name, model in tables_stats:
            count = db.query(model).count()
            print(f"  • {table_name:<20}: {count:>5} enregistrement(s)")
        
        print()
        
        # Afficher les rôles
        print("=" * 70)
        print("👥 RÔLES DISPONIBLES")
        print("=" * 70)
        print()
        
        roles = db.query(Role).all()
        for role in roles:
            print(f"  {role.id}. {role.nom}")
            if role.description:
                print(f"     → {role.description}")
        
        print()
        
        # Afficher les tragnobes
        print("=" * 70)
        print("🏘️  TRAGNOBES")
        print("=" * 70)
        print()
        
        tragnobes = db.query(Tragnobe).all()
        for tragnobe in tragnobes:
            lohantragno_count = db.query(Lohantragno).filter(
                Lohantragno.id_tragnobe == tragnobe.id
            ).count()
            users_count = db.query(User).filter(
                User.id_tragnobe == tragnobe.id
            ).count()
            
            print(f"  • {tragnobe.nom}")
            print(f"    Localisation: {tragnobe.localisation or 'Non spécifiée'}")
            print(f"    Lohantragno: {lohantragno_count}")
            print(f"    Membres: {users_count}")
            print()
        
        # Afficher les statistiques des utilisateurs par statut
        print("=" * 70)
        print("📊 STATISTIQUES UTILISATEURS")
        print("=" * 70)
        print()
        
        total_users = db.query(User).count()
        valides = db.query(User).filter(User.statut == "valide").count()
        en_attente = db.query(User).filter(User.statut == "en_attente").count()
        rejetes = db.query(User).filter(User.statut == "rejete").count()
        
        print(f"  Total: {total_users}")
        print(f"  ✅ Validés: {valides}")
        print(f"  ⏳ En attente: {en_attente}")
        print(f"  ❌ Rejetés: {rejetes}")
        print()
        
        # Afficher les utilisateurs par rôle
        for role in roles:
            count = db.query(User).filter(User.id_role == role.id).count()
            print(f"  {role.nom}: {count}")
        
        print()
        
        # Vérifier les derniers logs
        print("=" * 70)
        print("📝 DERNIERS LOGS D'ACTIVITÉ (5 derniers)")
        print("=" * 70)
        print()
        
        logs = db.query(LogActivite).order_by(LogActivite.created_at.desc()).limit(5).all()
        for log in logs:
            print(f"  [{log.created_at.strftime('%Y-%m-%d %H:%M:%S')}] {log.acteur_type.value}")
            print(f"  → {log.action}")
            if log.description:
                print(f"    {log.description}")
            print()
        
        print("=" * 70)
        print("✅ TEST TERMINÉ AVEC SUCCÈS!")
        print("=" * 70)
        
        db.close()
        return True
        
    except Exception as e:
        print()
        print("=" * 70)
        print("❌ ERREUR DE CONNEXION")
        print("=" * 70)
        print()
        print(f"Type d'erreur: {type(e).__name__}")
        print(f"Message: {str(e)}")
        print()
        print("🔧 Vérifications à faire:")
        print("  1. WampServer est-il démarré?")
        print("  2. Le service MySQL est-il actif?")
        print("  3. La base de données 'mananjary-mi' existe-t-elle?")
        print("  4. Les identifiants de connexion sont-ils corrects?")
        print()
        return False


if __name__ == "__main__":
    test_database_connection()
