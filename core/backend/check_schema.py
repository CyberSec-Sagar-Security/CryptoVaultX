from database import db_manager

with db_manager.get_connection() as conn:
    cursor = conn.cursor()
    cursor.execute("""
        SELECT column_name, is_nullable, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'files' 
        AND column_name IN ('storage_blob', 'storage_path')
        ORDER BY column_name
    """)
    results = cursor.fetchall()
    print("Files table columns:")
    for row in results:
        print(f"  {row[0]}: nullable={row[1]}, type={row[2]}")
