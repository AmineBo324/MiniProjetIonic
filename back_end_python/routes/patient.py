from flask import Blueprint, request, jsonify
from flask_bcrypt import check_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from models import Patient
from config import mongo
from bson import ObjectId

patient = Blueprint("patient", __name__)

# Inscription Patient
@patient.route("/register", methods=["POST"])
def register():
    data = request.json
    required_fields = ("nom", "prenom", "email", "password", "date_naissance", "genre", "adresse", "telephone")
    
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Champs manquants"}), 400
    
    
    return Patient.create_patient(
        data["nom"], 
        data["prenom"], 
        data["email"], 
        data["password"],
        data["date_naissance"], 
        data["genre"], 
        data["adresse"], 
        data["telephone"], 
    )

# Connexion Patient
@patient.route("/login", methods=["POST"])
def login():
    data = request.json
    print(f"Received request to /patient/login with data: {data}")
    
    if "email" not in data or "password" not in data:
        return jsonify({"error": "Email et mot de passe requis"}), 400

    patient = mongo.db.patients.find_one({"email": data["email"]})

    if not patient:
        return jsonify({"error": "Patient non trouvé"}), 404
    
    if not check_password_hash(patient["password"], data["password"]):
        return jsonify({"error": "Mot de passe incorrect"}), 401
    
    access_token = create_access_token(identity=str(patient["_id"]))
    
    patient["_id"] = str(patient["_id"])
    patient.pop("password", None)
    patient["userType"] = "patient"

    return jsonify({
        "access_token": access_token,
        "patient": patient
    }), 200


# Récupérer les détails d'un patient
@patient.route("/patient-details", methods=["GET"])
@jwt_required()
def get_patient_details():
    patient_id = get_jwt_identity()
    
    try:
        object_id = ObjectId(patient_id)
    except:
        return jsonify({"error": "ID patient invalide"}), 400
    
    patient = mongo.db.patients.find_one({"_id": object_id})
    
    if not patient:
        return jsonify({"error": "Patient non trouvé"}), 404
    
    patient["_id"] = str(patient["_id"])
    patient.pop("password", None)
    patient["userType"] = "patient"
    
    return jsonify(patient), 200

# Mettre à jour les détails d'un patient
@patient.route("/update-details", methods=["PUT"])
@jwt_required()
def update_patient_details():
    # Récupérer l'ID du patient à partir du token JWT
    patient_id = get_jwt_identity()
    
    # Récupérer les données de mise à jour
    update_data = request.json
    
    if not update_data:
        return jsonify({"error": "Aucune donnée fournie pour la mise à jour"}), 400
    
    # Appeler la méthode de mise à jour du profil
    result, status_code = Patient.update_profile(patient_id, update_data)
    
    return jsonify(result), status_code

@patient.route("/patient-infos/<email>", methods=["GET"])
def get_details(email):
    patient = Patient.find_by_email(email)
    if not patient:
        return jsonify({"message": "patient non trouvé"}), 404

    return jsonify({"Patient": patient}), 200