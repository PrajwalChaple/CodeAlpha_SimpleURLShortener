import sqlite3
import os

DATABASE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'db.sqlite3')

def get_db_connection():
    """
    Creates and returns a thread-safe connection to the SQLite database.
    Enables Row factory to allow accessing columns by name.
    """
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """
    Initializes the database schema if it doesn't already exist.
    Creates the 'urls' table with fields for short code, original URL, creation time, and click tracking.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create the urls table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS urls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            short_code TEXT UNIQUE NOT NULL,
            original_url TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            clicks INTEGER DEFAULT 0
        )
    ''')
    
    # Create an index on short_code for high-performance lookup
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_short_code ON urls (short_code)
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully.")

if __name__ == '__main__':
    # When run directly, initialize the database.
    init_db()
