from flask import Blueprint, request, jsonify
from flask_bcrypt import check_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from models import Medecin
from config import mongo
from bson import ObjectId



medecin = Blueprint("medecin", __name__)

# Inscription Médecin
@medecin.route("/register", methods=["POST"])
def register():
    data = request.json
    required_fields = ("nom", "prenom", "email", "password", "specialite", "zone_geographique", "rating", "availability", "image")
    
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Champs manquants"}), 400

    return Medecin.create_medecin(data["nom"], data["prenom"], data["email"], data["password"], 
                                  data["specialite"], data["zone_geographique"], data["rating"], 
                                  data["availability"], data["image"])

# Connexion Médecin
@medecin.route("/login", methods=["POST"])
def login():
    data = request.json
    
    if "email" not in data:
        return jsonify({"error": "Email requis"}), 400

    doctor = mongo.db.medecins.find_one({"email": data["email"]})

    if not doctor:
        return jsonify({"error": "Médecin non trouvé"}), 404
    
    if not check_password_hash(doctor["password"], data["password"]):
        return jsonify({"error": "Mot de passe incorrect"}), 401
    
    # Création du token JWT
    access_token = create_access_token(identity=str(doctor["_id"]))
    
    # Convert ObjectId to string and prepare doctor data
    doctor["_id"] = str(doctor["_id"])
    doctor.pop("password", None)  # Remove password
    doctor["userType"] = "doctor"  # Add userType for frontend

    return jsonify({
        "access_token": access_token,
        "doctor": doctor
    }), 200

# Récupérer les détails d'un médecin par JWT
@medecin.route("/doctor-details", methods=["GET"])
@jwt_required()
def get_doctor_details():
    # Récupérer l'ID du médecin à partir du token JWT
    doctor_id = get_jwt_identity()
    
    try:
        # Convertir la chaîne en ObjectId
        object_id = ObjectId(doctor_id)
    except:
        return jsonify({"error": "ID médecin invalide"}), 400
    
    # Rechercher le médecin dans la base de données
    doctor = mongo.db.medecins.find_one({"_id": object_id})
    
    if not doctor:
        return jsonify({"error": "Médecin non trouvé"}), 404
    
    # Convertir ObjectId en string et supprimer les champs sensibles
    doctor["_id"] = str(doctor["_id"])
    doctor.pop("password", None)
    doctor["userType"] = "doctor"
    
    return jsonify(doctor), 200

# Récupérer les détails d'un médecin par email
@medecin.route("/doctor-details/<email>", methods=["GET"])
def get_doctor_details_by_email(email):
    doctor = Medecin.find_by_email(email)
    if not doctor:
        return jsonify({"message": "Médecin non trouvé"}), 404

    doctor["userType"] = "doctor"
    return jsonify(doctor), 200

# Rechercher des médecins par critères
@medecin.route("/search", methods=["GET"])
def search():
    specialite = request.args.get("specialite")
    zone_geographique = request.args.get("zone_geographique")

    criteria = {}
    if specialite:
        criteria["specialite"] = specialite
    if zone_geographique:
        criteria["zone_geographique"] = zone_geographique

    doctors = Medecin.find_by_criteria(criteria)

    for doctor in doctors:
        doctor["userType"] = "doctor"

    return jsonify(doctors), 200

# Récupérer la disponibilité d'un médecin
@medecin.route("/availability/<email>", methods=["GET"])
def get_availability(email):
    doctor = Medecin.find_by_email(email)
    if not doctor:
        return jsonify({"message": "Médecin non trouvé"}), 404

    return jsonify({
        "availability": doctor.get("availability", [])
    }), 200

# Récupérer tous les médecins
@medecin.route("/all", methods=["GET"])
def get_all_doctors():
    doctors = mongo.db.medecins.find()
    doctor_list = []

    for doctor in doctors:
        doctor["_id"] = str(doctor["_id"])
        doctor.pop("password", None)
        doctor["userType"] = "doctor"
        doctor_list.append(doctor)

    return jsonify(doctor_list), 200

# Récupérer les médecins récents (limité à 4)
@medecin.route("/recent", methods=["GET"])
def get_recent_doctors():
    doctors = mongo.db.medecins.find().limit(4)
    doctor_list = []

    for doctor in doctors:
        doctor["_id"] = str(doctor["_id"])
        doctor.pop("password", None)
        doctor["userType"] = "doctor"
        doctor_list.append(doctor)

    return jsonify(doctor_list), 200