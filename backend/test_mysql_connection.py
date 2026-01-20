import pymysql

# Paramètres de connexion
host = 'localhost'
user = 'root'
password = ''  # Modifie si tu as défini un mot de passe
port = 3306

db_name = 'mananjary-mi'

try:
    connection = pymysql.connect(
        host=host,
        user=user,
        password=password,
        port=port
    )
    print('Connexion à MySQL réussie !')
    with connection.cursor() as cursor:
        cursor.execute('SHOW DATABASES;')
        databases = cursor.fetchall()
        print('Bases de données disponibles :')
        for db in databases:
            print('-', db[0])
        if db_name in [db[0] for db in databases]:
            print(f"La base '{db_name}' existe.")
        else:
            print(f"La base '{db_name}' n'existe pas.")
    connection.close()
except Exception as e:
    print('Erreur de connexion à MySQL :', e)
