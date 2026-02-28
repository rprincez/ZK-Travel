from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import os

app = Flask(__name__)
CORS(app)  # Allow all origins for simplicity

DB_PATH = 'data/bookings.db'
VEHICLES_PATH = 'data/vehicles.json'

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
    conn.commit()
    conn.close()

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


@app.route('/api/bookings', methods=['GET', 'POST'])
def handle_bookings():
    if request.method == 'POST':
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO bookings (name, email, phone, vehicle_id, start_date, end_date, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (data['name'], data['email'], data['phone'], data['vehicle_id'], data['start_date'], data['end_date'], data['total_price'])
        )
        conn.commit()
        booking_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': booking_id, 'message': 'Booking successful'}), 201
    
    else:
        conn = get_db_connection()
        bookings = conn.execute('SELECT * FROM bookings ORDER BY id DESC').fetchall()
        conn.close()
        return jsonify([dict(row) for row in bookings])

if __name__ == '__main__':
    init_db()
    # Create dummy vehicles if it doesn't exist
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

    app.run(debug=True, port=5000)
