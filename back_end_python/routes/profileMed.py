from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from config import mongo
from bson import ObjectId

profile = Blueprint("profile", __name__)

@profile.route("/appointments", methods=["GET"])
@jwt_required()
def get_appointments():
    user_id = get_jwt_identity()
    
    try:
        object_id = ObjectId(user_id)
    except:
        return jsonify({"error": "ID utilisateur invalide"}), 400
    
    # Find appointments where the user is the doctor or patient
    appointments = mongo.db.appointments.find({
        "$or": [
            {"doctor_id": object_id},
            {"patient_id": object_id}
        ]
    })
    
    appointment_list = []
    for appt in appointments:
        appt["_id"] = str(appt["_id"])
        appt["doctor_id"] = str(appt.get("doctor_id", ""))
        appt["patient_id"] = str(appt.get("patient_id", ""))
        appointment_list.append(appt)
    
    return jsonify({"appointments": appointment_list}), 200

@profile.route("/documents", methods=["GET"])
@jwt_required()
def get_documents():
    user_id = get_jwt_identity()
    
    try:
        object_id = ObjectId(user_id)
    except:
        return jsonify({"error": "ID utilisateur invalide"}), 400
    
    # Find documents associated with the user (doctor or patient)
    documents = mongo.db.documents.find({
        "$or": [
            {"doctor_id": object_id},
            {"patient_id": object_id}
        ]
    })
    
    document_list = []
    for doc in documents:
        doc["_id"] = str(doc["_id"])
        doc["doctor_id"] = str(doc.get("doctor_id", ""))
        doc["patient_id"] = str(doc.get("patient_id", ""))
        document_list.append(doc)
    
    return jsonify({"documents": document_list}), 200

@profile.route("/consultations", methods=["GET"])
@jwt_required()
def get_consultations():
    user_id = get_jwt_identity()
    
    try:
        object_id = ObjectId(user_id)
    except:
        return jsonify({"error": "ID utilisateur invalide"}), 400
    
    # Find consultations associated with the user (doctor or patient)
    consultations = mongo.db.consultations.find({
        "$or": [
            {"doctor_id": object_id},
            {"patient_id": object_id}
        ]
    })
    
    consultation_list = []
    for consult in consultations:
        consult["_id"] = str(consult["_id"])
        consult["appointment_id"] = str(consult.get("appointment_id", ""))
        consult["doctor_id"] = str(consult.get("doctor_id", ""))
        consult["patient_id"] = str(consult.get("patient_id", ""))
        consultation_list.append(consult)
    
    return jsonify({"consultations": consultation_list}), 200

@profile.route("/appointments/<appointment_id>/accept", methods=["PUT"])
@jwt_required()
def accept_appointment(appointment_id):
    user_id = get_jwt_identity()
    
    try:
        object_id = ObjectId(user_id)
        appt_id = ObjectId(appointment_id)
    except:
        return jsonify({"error": "ID invalide"}), 400
    
    appointment = mongo.db.appointments.find_one({"_id": appt_id, "doctor_id": object_id})
    if not appointment:
        return jsonify({"error": "Rendez-vous non trouvé ou non autorisé"}), 404
    
    mongo.db.appointments.update_one(
        {"_id": appt_id},
        {"$set": {"status": "accepted"}}
    )
    
    return jsonify({"message": "Rendez-vous accepté"}), 200

@profile.route("/appointments/<appointment_id>/reject", methods=["PUT"])
@jwt_required()
def reject_appointment(appointment_id):
    user_id = get_jwt_identity()
    
    try:
        object_id = ObjectId(user_id)
        appt_id = ObjectId(appointment_id)
    except:
        return jsonify({"error": "ID invalide"}), 400
    
    appointment = mongo.db.appointments.find_one({"_id": appt_id, "doctor_id": object_id})
    if not appointment:
        return jsonify({"error": "Rendez-vous non trouvé ou non autorisé"}), 404
    
    mongo.db.appointments.update_one(
        {"_id": appt_id},
        {"$set": {"status": "rejected"}}
    )
    
    return jsonify({"message": "Rendez-vous rejeté"}), 200

@profile.route("/appointments/<appointment_id>", methods=["DELETE"])
@jwt_required()
def cancel_appointment(appointment_id):
    user_id = get_jwt_identity()
    
    try:
        object_id = ObjectId(user_id)
        appt_id = ObjectId(appointment_id)
    except:
        return jsonify({"error": "ID invalide"}), 400
    
    appointment = mongo.db.appointments.find_one({"_id": appt_id, "doctor_id": object_id})
    if not appointment:
        return jsonify({"error": "Rendez-vous non trouvé ou non autorisé"}), 404
    
    mongo.db.appointments.delete_one({"_id": appt_id})
    
    return jsonify({"message": "Rendez-vous annulé"}), 200

@profile.route("/documents/<document_id>/annotate", methods=["PUT"])
@jwt_required()
def annotate_document(document_id):
    user_id = get_jwt_identity()
    data = request.json
    
    if "annotation" not in data:
        return jsonify({"error": "Annotation requise"}), 400
    
    try:
        object_id = ObjectId(user_id)
        doc_id = ObjectId(document_id)
    except:
        return jsonify({"error": "ID invalide"}), 400
    
    document = mongo.db.documents.find_one({"_id": doc_id, "doctor_id": object_id})
    if not document:
        return jsonify({"error": "Document non trouvé ou non autorisé"}), 404
    
    mongo.db.documents.update_one(
        {"_id": doc_id},
        {"$push": {"annotations": data["annotation"]}}
    )
    
    return jsonify({"message": "Annotation ajoutée"}), 200