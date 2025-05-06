from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, create_refresh_token
from config import mongo, bcrypt
from bson import ObjectId
from models import Medecin

medecin = Blueprint('medecin', __name__)

@medecin.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    medecin = mongo.db.medecins.find_one({"email": data['email']})
    if medecin and bcrypt.check_password_hash(medecin['password'], data['password']):
        access_token = create_access_token(identity=str(medecin['_id']))
        refresh_token = create_refresh_token(identity=str(medecin['_id']))
        medecin_data = {k: v for k, v in medecin.items() if k != 'password'}
        medecin_data['_id'] = str(medecin['_id'])
        medecin_data['userType'] = 'doctor'
        return jsonify({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "userType": "doctor",
            "medecin": medecin_data
        }), 200
    return jsonify({"error": "Invalid credentials"}), 401

@medecin.route("/doctor-details/<email>", methods=["GET"])
def get_doctor_details(email):
    doctor = Medecin.find_by_email(email)
    if not doctor:
        return jsonify({"message": "Médecin non trouvé"}), 404

    return jsonify({
        "nom": doctor.get("nom"),
        "prenom": doctor.get("prenom"),
        "email": doctor.get("email"),
        "specialite": doctor.get("specialite"),
        "zone_geographique": doctor.get("zone_geographique"),
        "rating": doctor.get("rating"),
        "availability": doctor.get("availability", []),
        "image" :doctor.get("image")
    }), 200

@medecin.route("/search", methods=["GET"])
def search():
    specialite = request.args.get("specialite")
    zone_geographique = request.args.get("zone_geographique")

    criteria = {}
    if specialite:
        criteria["specialite"] = specialite
    if zone_geographique:
        criteria["zone_geographique"] = zone_geographique

    medecins = Medecin.find_by_criteria(criteria)

    return jsonify(medecins), 200

@medecin.route("/all", methods=["GET"])
def get_all_doctors():
    doctors = mongo.db.medecins.find()  # Fetch all doctors from the database
    doctor_list = []

    for doctor in doctors:
        doctor["_id"] = str(doctor["_id"])  # Convert ObjectId to string
        doctor_list.append(doctor)

    return jsonify(doctor_list), 200


@medecin.route("/availability/<email>", methods=["GET"])
def get_availability(email):
    doctor = Medecin.find_by_email(email)
    if not doctor:
        return jsonify({"message": "Médecin non trouvé"}), 404

    return jsonify({
        "availability": doctor.get("availability", [])
    }), 200

@medecin.route("/recent", methods=["GET"])
def get_recent_doctors():
    doctors = mongo.db.medecins.find().limit(4)  # Fetch only 4 doctors
    doctor_list = []

    for doctor in doctors:
        doctor["_id"] = str(doctor["_id"])  # Convert ObjectId to string
        doctor_list.append(doctor)

    return jsonify(doctor_list), 200