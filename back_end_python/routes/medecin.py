from flask import Blueprint, request, jsonify
from flask_bcrypt import check_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from models import Medecin  
from config import mongo



medecin = Blueprint("medecin", __name__)

# Inscription Médecin
@medecin.route("/register", methods=["POST"])
def register():
    data = request.json
    required_fields = ("nom", "prenom", "email", "password", "specialite", "zone_geographique", "rating","availability","image")
    
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Champs manquants"}), 400

    return Medecin.create_medecin(data["nom"], data["prenom"], data["email"], data["password"], 
                                  data["specialite"], data["zone_geographique"], data["rating"],data["availability"], data["image"])



@medecin.route("/login", methods=["POST"])
def login():
    data = request.json
    
    if "email" not in data:
        return jsonify({"error": "Email requis"}), 400

    medecin = mongo.db.medecins.find_one({"email": data["email"]})

    if not medecin:
        return jsonify({"error": "Médecin non trouvé"}), 404
    
    if not check_password_hash(medecin["password"], data["password"]):
        return jsonify({"error": "Mot de passe incorrect"}), 401
    
    # Création du token JWT
    access_token = create_access_token(identity=str(medecin["_id"]))
    

    # Convert ObjectId to string and remove sensitive fields
    medecin["_id"] = str(medecin["_id"])
    medecin.pop("password", None)  # Remove password if it exists

    return jsonify({
        "access_token": access_token,
        "medecin" : medecin
    }), 200

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

@medecin.route("/availability/<email>", methods=["GET"])
def get_availability(email):
    doctor = Medecin.find_by_email(email)
    if not doctor:
        return jsonify({"message": "Médecin non trouvé"}), 404

    return jsonify({
        "availability": doctor.get("availability", [])
    }), 200

# Route to get all doctors
@medecin.route("/all", methods=["GET"])
def get_all_doctors():
    doctors = mongo.db.medecins.find()  # Fetch all doctors from the database
    doctor_list = []

    for doctor in doctors:
        doctor["_id"] = str(doctor["_id"])  # Convert ObjectId to string
        doctor_list.append(doctor)

    return jsonify(doctor_list), 200

# Route to get 4 doctors
@medecin.route("/recent", methods=["GET"])
def get_recent_doctors():
    doctors = mongo.db.medecins.find().limit(4)  # Fetch only 4 doctors
    doctor_list = []

    for doctor in doctors:
        doctor["_id"] = str(doctor["_id"])  # Convert ObjectId to string
        doctor_list.append(doctor)

    return jsonify(doctor_list), 200