"""
Script pour migrer la table tragnobes
"""
import pymysql

# Connexion à la base de données
connection = pymysql.connect(
    host='localhost',
    user='root',
    password='',
    database='mananjary-mi'
)

try:
    with connection.cursor() as cursor:
        # Ajouter les nouveaux champs
        sql = """
        ALTER TABLE `tragnobes`
          ADD COLUMN `ampanjaka` VARCHAR(150) NULL COMMENT 'Chef actuel (Ampanjaka)' AFTER `localisation`,
          ADD COLUMN `lefitra` VARCHAR(150) NULL COMMENT 'Adjoint du chef' AFTER `ampanjaka`,
          ADD COLUMN `date_debut` DATE NULL COMMENT 'Date de début du règne actuel' AFTER `lefitra`,
          ADD COLUMN `date_fin` DATE NULL COMMENT 'Date de fin du règne (null si en cours)' AFTER `date_debut`,
          ADD COLUMN `description` TEXT NULL COMMENT 'Description du tragnobe' AFTER `date_fin`;
        """
        cursor.execute(sql)
        connection.commit()
        print("✓ Migration réussie : champs ajoutés à la table tragnobes")
        
except pymysql.err.OperationalError as e:
    if "Duplicate column name" in str(e):
        print("✓ Les colonnes existent déjà")
    else:
        print(f"✗ Erreur: {e}")
except Exception as e:
    print(f"✗ Erreur: {e}")
finally:
    connection.close()
