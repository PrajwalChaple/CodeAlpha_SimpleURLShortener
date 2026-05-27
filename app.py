import re
import random
import string
from flask import Flask, request, jsonify, render_template, redirect, url_for
from db import init_db, get_db_connection

app = Flask(__name__)

# Initialize the database on application startup
init_db()

# Base62 character set for short code generation
BASE62_CHARACTERS = string.ascii_letters + string.digits

def is_valid_url(url):
    """
    Validates the structure of a URL.
    Checks if it starts with http:// or https:// and has a basic domain structure.
    """
    if not url:
        return False
    # Standard URL regex pattern
    url_pattern = re.compile(
        r'^(?:http|ftp)s?://'  # http:// or https:// or ftp://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    return bool(url_pattern.match(url))

def generate_short_code(length=6):
    """
    Generates a random alphanumeric short code of specified length.
    """
    return ''.join(random.choices(BASE62_CHARACTERS, k=length))

def get_unique_short_code(conn, length=6):
    """
    Generates a unique short code that does not already exist in the database.
    Retries up to 10 times to prevent infinite loops.
    """
    for _ in range(10):
        code = generate_short_code(length)
        # Check database for collision
        cursor = conn.cursor()
        cursor.execute('SELECT 1 FROM urls WHERE short_code = ?', (code,))
        if cursor.fetchone() is None:
            return code
    raise RuntimeError("Failed to generate a unique short code. Collision limit reached.")

@app.route('/')
def index():
    """
    Serves the main frontend page.
    """
    return render_template('index.html')

@app.route('/api/shorten', methods=['POST'])
def api_shorten():
    """
    API endpoint to shorten a long URL.
    Expects a JSON body with a 'url' parameter.
    """
    # Accept JSON or form-data for maximal compatibility
    data = request.get_json(silent=True) or request.form
    
    if not data or 'url' not in data:
        return jsonify({
            'success': False,
            'error': 'Missing URL parameter. Please provide a "url" key.'
        }), 400
        
    original_url = data['url'].strip()
    
    # Auto-prepend protocol if user omitted it (e.g. 'google.com' -> 'https://google.com')
    if not original_url.startswith(('http://', 'https://', 'ftp://')):
        original_url = 'https://' + original_url

    if not is_valid_url(original_url):
        return jsonify({
            'success': False,
            'error': 'Invalid URL format. Please include a valid domain (e.g., https://example.com).'
        }), 400

    conn = get_db_connection()
    try:
        # Check if the URL is already shortened in the system to conserve codes
        cursor = conn.cursor()
        cursor.execute('SELECT short_code FROM urls WHERE original_url = ? ORDER BY id DESC LIMIT 1', (original_url,))
        existing = cursor.fetchone()
        
        if existing:
            short_code = existing['short_code']
        else:
            # Generate a new unique short code
            short_code = get_unique_short_code(conn)
            cursor.execute(
                'INSERT INTO urls (short_code, original_url) VALUES (?, ?)',
                (short_code, original_url)
            )
            conn.commit()

        # Build fully qualified short URL
        # Uses request.host_url which handles local and production hosting automatically
        short_url = f"{request.host_url}{short_code}"
        
        return jsonify({
            'success': True,
            'short_code': short_code,
            'short_url': short_url,
            'original_url': original_url
        })
        
    except Exception as e:
        conn.rollback()
        return jsonify({
            'success': False,
            'error': f'An internal server error occurred: {str(e)}'
        }), 500
    finally:
        conn.close()

@app.route('/api/analytics/<short_code>', methods=['GET'])
def api_analytics(short_code):
    """
    API endpoint to retrieve click statistics and metadata for a given short code.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT original_url, created_at, clicks FROM urls WHERE short_code = ?',
        (short_code,)
    )
    row = cursor.fetchone()
    conn.close()
    
    if row is None:
        return jsonify({
            'success': False,
            'error': f'Short code "{short_code}" not found.'
        }), 404
        
    return jsonify({
        'success': True,
        'short_code': short_code,
        'original_url': row['original_url'],
        'created_at': row['created_at'],
        'clicks': row['clicks']
    })

@app.route('/<short_code>', methods=['GET'])
def redirect_to_url(short_code):
    """
    Redirects the short URL back to the original long URL.
    Increments the click analytics tracker.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT original_url FROM urls WHERE short_code = ?',
        (short_code,)
    )
    row = cursor.fetchone()
    
    if row is None:
        conn.close()
        # Serve a dedicated custom 404 template for beautiful error handling
        return render_template('404.html', code=short_code), 404
        
    # Increment the click count
    cursor.execute(
        'UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?',
        (short_code,)
    )
    conn.commit()
    conn.close()
    
    return redirect(row['original_url'], code=302)

if __name__ == '__main__':
    # Run server locally on port 5000 in debug mode for development ease
    app.run(host='127.0.0.1', port=5000, debug=True)
