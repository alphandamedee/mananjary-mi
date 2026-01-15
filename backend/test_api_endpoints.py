"""
Script de test des endpoints API
Teste les principaux endpoints sans démarrer le serveur
"""
import sys
from pathlib import Path

# Ajouter le répertoire parent au path pour les imports
sys.path.insert(0, str(Path(__file__).parent))

from fastapi.testclient import TestClient
from main import app

def test_api_endpoints():
    """Test les endpoints de l'API"""
    print("=" * 70)
    print("🧪 TEST DES ENDPOINTS API")
    print("=" * 70)
    print()
    
    client = TestClient(app)
    
    tests = []
    
    # Test 1: Root endpoint
    print("1️⃣  Test de l'endpoint racine (GET /)")
    try:
        response = client.get("/")
        if response.status_code == 200:
            print(f"   ✅ Statut: {response.status_code}")
            print(f"   📄 Réponse: {response.json()}")
            tests.append(("Root endpoint", True))
        else:
            print(f"   ❌ Statut: {response.status_code}")
            tests.append(("Root endpoint", False))
    except Exception as e:
        print(f"   ❌ Erreur: {str(e)}")
        tests.append(("Root endpoint", False))
    print()
    
    # Test 2: Health check
    print("2️⃣  Test du health check (GET /health)")
    try:
        response = client.get("/health")
        if response.status_code == 200:
            print(f"   ✅ Statut: {response.status_code}")
            print(f"   📄 Réponse: {response.json()}")
            tests.append(("Health check", True))
        else:
            print(f"   ❌ Statut: {response.status_code}")
            tests.append(("Health check", False))
    except Exception as e:
        print(f"   ❌ Erreur: {str(e)}")
        tests.append(("Health check", False))
    print()
    
    # Test 3: Get roles
    print("3️⃣  Test des rôles (GET /api/v1/roles)")
    try:
        response = client.get("/api/v1/roles")
        if response.status_code == 200:
            roles = response.json()
            print(f"   ✅ Statut: {response.status_code}")
            print(f"   📊 Nombre de rôles: {len(roles)}")
            for role in roles:
                print(f"      • {role['nom']}")
            tests.append(("Get roles", True))
        else:
            print(f"   ❌ Statut: {response.status_code}")
            tests.append(("Get roles", False))
    except Exception as e:
        print(f"   ❌ Erreur: {str(e)}")
        tests.append(("Get roles", False))
    print()
    
    # Test 4: Get tragnobes
    print("4️⃣  Test des tragnobes (GET /api/v1/tragnobes)")
    try:
        response = client.get("/api/v1/tragnobes")
        if response.status_code == 200:
            tragnobes = response.json()
            print(f"   ✅ Statut: {response.status_code}")
            print(f"   📊 Nombre de tragnobes: {len(tragnobes)}")
            for tragnobe in tragnobes:
                print(f"      • {tragnobe['nom']} ({tragnobe.get('localisation', 'N/A')})")
            tests.append(("Get tragnobes", True))
        else:
            print(f"   ❌ Statut: {response.status_code}")
            tests.append(("Get tragnobes", False))
    except Exception as e:
        print(f"   ❌ Erreur: {str(e)}")
        tests.append(("Get tragnobes", False))
    print()
    
    # Test 5: Get users
    print("5️⃣  Test des utilisateurs (GET /api/v1/users)")
    try:
        response = client.get("/api/v1/users")
        if response.status_code == 200:
            users = response.json()
            print(f"   ✅ Statut: {response.status_code}")
            print(f"   📊 Nombre d'utilisateurs: {len(users)}")
            tests.append(("Get users", True))
        else:
            print(f"   ❌ Statut: {response.status_code}")
            tests.append(("Get users", False))
    except Exception as e:
        print(f"   ❌ Erreur: {str(e)}")
        tests.append(("Get users", False))
    print()
    
    # Test 6: Get evenements
    print("6️⃣  Test des événements (GET /api/v1/evenements)")
    try:
        response = client.get("/api/v1/evenements")
        if response.status_code == 200:
            evenements = response.json()
            print(f"   ✅ Statut: {response.status_code}")
            print(f"   📊 Nombre d'événements: {len(evenements)}")
            for evt in evenements[:3]:  # Afficher les 3 premiers
                print(f"      • {evt['titre']} ({evt['type']})")
            tests.append(("Get evenements", True))
        else:
            print(f"   ❌ Statut: {response.status_code}")
            tests.append(("Get evenements", False))
    except Exception as e:
        print(f"   ❌ Erreur: {str(e)}")
        tests.append(("Get evenements", False))
    print()
    
    # Test 7: Get logs
    print("7️⃣  Test des logs (GET /api/v1/logs/recent)")
    try:
        response = client.get("/api/v1/logs/recent?limit=5")
        if response.status_code == 200:
            logs = response.json()
            print(f"   ✅ Statut: {response.status_code}")
            print(f"   📊 Nombre de logs: {len(logs)}")
            tests.append(("Get logs", True))
        else:
            print(f"   ❌ Statut: {response.status_code}")
            tests.append(("Get logs", False))
    except Exception as e:
        print(f"   ❌ Erreur: {str(e)}")
        tests.append(("Get logs", False))
    print()
    
    # Résumé
    print("=" * 70)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 70)
    print()
    
    passed = sum(1 for _, result in tests if result)
    total = len(tests)
    
    for test_name, result in tests:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status}  {test_name}")
    
    print()
    print(f"  Total: {passed}/{total} tests réussis")
    print()
    
    if passed == total:
        print("🎉 Tous les tests ont réussi!")
    else:
        print("⚠️  Certains tests ont échoué. Vérifiez la configuration.")
    
    print("=" * 70)


if __name__ == "__main__":
    test_api_endpoints()
