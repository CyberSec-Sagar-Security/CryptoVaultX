from backend.database import db_manager

try:
    # Check if users table exists and list all users
    result = db_manager.execute_query('SELECT * FROM users ORDER BY id', fetch=True)
    print('Users table contents:')
    for user in result:
        print(f'ID: {user["id"]}, Email: {user["email"]}, Username: {user["username"]}, Created: {user["created_at"]}')
    print(f'Total users: {len(result)}')
except Exception as e:
    print(f'Error: {e}')
    # Try to see what tables exist
    try:
        tables = db_manager.execute_query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'', fetch=True)
        print('Available tables:')
        for table in tables:
            print(f'- {table["table_name"]}')
    except Exception as e2:
        print(f'Could not list tables: {e2}')