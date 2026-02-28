from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import json
import os
import base64
import uuid
import random
import requests as http_requests
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import functools

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('JWT_SECRET', 'zktravels-super-secret-key-change-in-prod')
CORS(app, origins='*')

DB_PATH = 'data/bookings.db'
VEHICLES_PATH = 'data/vehicles.json'
UPLOAD_FOLDER = 'data/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def init_db():
    os.makedirs('data', exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            vehicle_id TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            total_price REAL NOT NULL
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS otps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT NOT NULL,
            otp_code TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            verified INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

def init_vehicles():
    if not os.path.exists(VEHICLES_PATH):
        dummy_vehicles = [
            {
                "id": "1",
                "name": "Toyota Innova Crysta",
                "type": "SUV",
                "price": 2500,
                "image": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800",
                "seats": 7
            },
            {
                "id": "2",
                "name": "Hyundai Verna",
                "type": "Sedan",
                "price": 1800,
                "image": "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=800",
                "seats": 5
            },
            {
                "id": "3",
                "name": "Mahindra Thar",
                "type": "Off-Road",
                "price": 3000,
                "image": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
                "seats": 4
            }
        ]
        os.makedirs('data', exist_ok=True)
        with open(VEHICLES_PATH, 'w') as f:
            json.dump(dummy_vehicles, f, indent=4)

# Run initialization
init_db()
init_vehicles()
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ─── Admin credential storage ─────────────────────────────────────────────────
ADMIN_CREDS_PATH = 'data/admin_creds.json'

def init_admin_creds():
    """Create default admin credentials if they don't exist yet."""
    if not os.path.exists(ADMIN_CREDS_PATH):
        creds = {
            'username': 'admin',
            # default password: admin123  (hashed)
            'password_hash': generate_password_hash('admin123')
        }
        with open(ADMIN_CREDS_PATH, 'w') as f:
            json.dump(creds, f)

def get_admin_creds():
    with open(ADMIN_CREDS_PATH, 'r') as f:
        return json.load(f)

init_admin_creds()

# ─── JWT helper ───────────────────────────────────────────────────────────────
def token_required(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid token'}), 401
        token = auth_header.split(' ', 1)[1]
        try:
            jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired, please log in again'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated

# ─── Auth endpoints ───────────────────────────────────────────────────────────
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')

    creds = get_admin_creds()
    if username != creds['username'] or not check_password_hash(creds['password_hash'], password):
        return jsonify({'error': 'Invalid username or password'}), 401

    token = jwt.encode(
        {
            'sub': username,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=8)
        },
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    return jsonify({'token': token, 'username': username})

@app.route('/api/auth/verify', methods=['GET'])
def verify_token():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({'valid': False}), 401
    token = auth_header.split(' ', 1)[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return jsonify({'valid': True, 'username': payload.get('sub')})
    except jwt.PyJWTError:
        return jsonify({'valid': False}), 401

@app.route('/api/auth/change-password', methods=['POST'])
@token_required
def change_password():
    data = request.json or {}
    new_password = data.get('new_password', '')
    new_username = data.get('new_username', '')

    if len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    creds = get_admin_creds()
    if new_username:
        creds['username'] = new_username.strip()
    creds['password_hash'] = generate_password_hash(new_password)

    with open(ADMIN_CREDS_PATH, 'w') as f:
        json.dump(creds, f)
    return jsonify({'message': 'Credentials updated successfully'})


@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Use PNG, JPG, WEBP, or GIF.'}), 400
    
    # Read and encode to base64 data URI so it works without persistent storage
    ext = file.filename.rsplit('.', 1)[1].lower()
    image_data = file.read()
    b64 = base64.b64encode(image_data).decode('utf-8')
    data_uri = f'data:image/{ext};base64,{b64}'
    
    return jsonify({'url': data_uri}), 201


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/vehicles', methods=['GET'])
def get_vehicles():
    try:
        with open(VEHICLES_PATH, 'r') as f:
            vehicles = json.load(f)
        return jsonify(vehicles)
    except FileNotFoundError:
        return jsonify([])

@app.route('/api/vehicles', methods=['POST'])
def add_vehicle():
    new_vehicle = request.json
    try:
        with open(VEHICLES_PATH, 'r') as f:
            vehicles = json.load(f)
    except FileNotFoundError:
        vehicles = []
    
    # Generate a simple ID
    new_vehicle['id'] = str(len(vehicles) + 1)
    vehicles.append(new_vehicle)
    
    with open(VEHICLES_PATH, 'w') as f:
        json.dump(vehicles, f, indent=4)
        
    return jsonify(new_vehicle), 201

@app.route('/api/vehicles/<vehicle_id>', methods=['PUT', 'DELETE'])
def manage_vehicle(vehicle_id):
    try:
        with open(VEHICLES_PATH, 'r') as f:
            vehicles = json.load(f)
    except FileNotFoundError:
        return jsonify({'error': 'No vehicles found'}), 404

    if request.method == 'DELETE':
        vehicles = [v for v in vehicles if str(v['id']) != str(vehicle_id)]
        with open(VEHICLES_PATH, 'w') as f:
            json.dump(vehicles, f, indent=4)
        return jsonify({'message': 'Vehicle deleted'})
    
    elif request.method == 'PUT':
        updated_data = request.json
        for i, v in enumerate(vehicles):
            if str(v['id']) == str(vehicle_id):
                vehicles[i].update(updated_data)
                with open(VEHICLES_PATH, 'w') as f:
                    json.dump(vehicles, f, indent=4)
                return jsonify(vehicles[i])
        return jsonify({'error': 'Vehicle not found'}), 404


# ─── OTP helpers ──────────────────────────────────────────────────────────────
def send_sms_fast2sms(phone, message):
    """Send SMS via Fast2SMS. Falls back to console log if no API key."""
    api_key = os.environ.get('FAST2SMS_API_KEY', '')
    if not api_key:
        print(f"[OTP LOG] Phone: {phone} | Message: {message}")
        return True
    try:
        resp = http_requests.post(
            'https://www.fast2sms.com/dev/bulkV2',
            headers={'authorization': api_key},
            json={
                'route': 'q',          # quick transactional
                'message': message,
                'language': 'english',
                'flash': 0,
                'numbers': phone
            },
            timeout=10
        )
        result = resp.json()
        if not result.get('return'):
            print(f"[Fast2SMS Error] {result}")
        return result.get('return', False)
    except Exception as e:
        print(f"[SMS Exception] {e}")
        return False

# ─── OTP endpoints ─────────────────────────────────────────────────────────────
@app.route('/api/otp/send', methods=['POST'])
def send_otp():
    data = request.json or {}
    phone = str(data.get('phone', '')).strip()

    if not phone or len(phone) < 10:
        return jsonify({'error': 'Please provide a valid phone number'}), 400

    otp = str(random.randint(100000, 999999))
    expires_at = (datetime.datetime.utcnow() + datetime.timedelta(minutes=10)).isoformat()

    conn = get_db_connection()
    # Invalidate any previous OTPs for this number
    conn.execute('DELETE FROM otps WHERE phone = ?', (phone,))
    conn.execute(
        'INSERT INTO otps (phone, otp_code, expires_at, verified) VALUES (?, ?, ?, 0)',
        (phone, otp, expires_at)
    )
    conn.commit()
    conn.close()

    message = f"Your ZK Travels verification code is {otp}. Valid for 10 minutes. Do not share this with anyone."
    send_sms_fast2sms(phone, message)

    return jsonify({'message': f'OTP sent to {phone}'}), 200


@app.route('/api/otp/verify', methods=['POST'])
def verify_otp():
    data = request.json or {}
    phone = str(data.get('phone', '')).strip()
    otp_input = str(data.get('otp', '')).strip()

    conn = get_db_connection()
    row = conn.execute(
        'SELECT * FROM otps WHERE phone = ? ORDER BY id DESC LIMIT 1', (phone,)
    ).fetchone()

    if not row:
        conn.close()
        return jsonify({'error': 'No OTP found. Please request a new one.'}), 404

    now = datetime.datetime.utcnow()
    expires_at = datetime.datetime.fromisoformat(row['expires_at'])

    if now > expires_at:
        conn.execute('DELETE FROM otps WHERE phone = ?', (phone,))
        conn.commit()
        conn.close()
        return jsonify({'error': 'OTP has expired. Please request a new one.'}), 410

    if row['otp_code'] != otp_input:
        conn.close()
        return jsonify({'error': 'Incorrect OTP. Please try again.'}), 401

    # Mark as verified
    conn.execute('UPDATE otps SET verified = 1 WHERE phone = ?', (phone,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Phone verified successfully', 'verified': True})


# ─── Bookings ──────────────────────────────────────────────────────────────────
@app.route('/api/bookings', methods=['GET', 'POST'])
def handle_bookings():
    if request.method == 'POST':
        data = request.json
        phone = str(data.get('phone', '')).strip()

        # Require phone to be OTP-verified
        conn = get_db_connection()
        otp_row = conn.execute(
            'SELECT * FROM otps WHERE phone = ? AND verified = 1 ORDER BY id DESC LIMIT 1',
            (phone,)
        ).fetchone()

        if not otp_row:
            conn.close()
            return jsonify({'error': 'Phone number not verified. Please verify via OTP first.'}), 403

        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO bookings (name, email, phone, vehicle_id, start_date, end_date, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (data['name'], data['email'], phone, data['vehicle_id'], data['start_date'], data['end_date'], data['total_price'])
        )
        # Clean up: remove the used OTP
        conn.execute('DELETE FROM otps WHERE phone = ?', (phone,))
        conn.commit()
        booking_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': booking_id, 'message': 'Booking confirmed!'}), 201

    else:
        conn = get_db_connection()
        bookings = conn.execute('SELECT * FROM bookings ORDER BY id DESC').fetchall()
        conn.close()
        return jsonify([dict(row) for row in bookings])

if __name__ == '__main__':
    app.run(debug=True, port=5000)
