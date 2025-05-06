from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from config import mongo
import datetime

appointment = Blueprint('appointment', __name__)

@appointment.route("/patient_appointments", methods=["GET"])
@jwt_required()
def get_patient_appointments():
    patient_email = request.args.get("patient_email")
    if not patient_email:
        return jsonify({"error": "Patient email required"}), 400

    appointments = mongo.db.appointments.find({"patient_email": patient_email})
    appointments_list = [
        {
            "_id": str(appointment["_id"]),
            "doctor_email": appointment["doctor_email"],
            "patient_email": appointment["patient_email"],
            "patient_name": appointment.get("patient_name", ""),
            "date": appointment["date"],
            "start_time": appointment.get("start_time", ""),
            "end_time": appointment.get("end_time", ""),
            "complaint": appointment.get("complaint", ""),
            "documents": appointment.get("documents", []),
            "status": appointment.get("status", "pending"),
            "doctor_details": mongo.db.medecins.find_one(
                {"email": appointment["doctor_email"]},
                {"_id": 0, "nom": 1, "prenom": 1, "email": 1}
            ) or {"nom": "Unknown", "prenom": "", "email": appointment["doctor_email"]}
        }
        for appointment in appointments
    ]
    return jsonify(appointments_list), 200

@appointment.route('/create', methods=['POST'], endpoint='create_appointment')
@jwt_required()
def create_appointment():
    current_user_id = get_jwt_identity()
    patient = mongo.db.patients.find_one({"_id": ObjectId(current_user_id)})
    if not patient:
        return jsonify({"message": "Patient non trouvé"}), 404

    data = request.get_json()
    appointment_data = {
        "doctor_email": data['doctor_email'],
        "patient_email": patient['email'],
        "patient_name": f"{patient['prenom']} {patient['nom']}",
        "date": data['date'],
        "start_time": data['start_time'],
        "end_time": data['end_time'],
        "complaint": data['complaint'],
        "document_paths": data.get('document_paths', []),
        "status": "pending",
        "created_at": datetime.datetime.utcnow()
    }
    # Validate no overlapping appointments
    overlap = mongo.db.appointments.find_one({
        "doctor_email": data['doctor_email'],
        "date": data['date'],
        "$or": [
            {
                "start_time": {"$lt": data['end_time']},
                "end_time": {"$gt": data['start_time']}
            }
        ]
    })
    if overlap:
        return jsonify({"message": "Conflit avec un autre rendez-vous"}), 400

    mongo.db.appointments.insert_one(appointment_data)
    return jsonify({"message": "Rendez-vous créé"}), 201

@appointment.route('/doctor/appointments', methods=['GET'], endpoint='get_doctor_appointments')
@jwt_required()
def get_doctor_appointments():
    current_user_id = get_jwt_identity()
    doctor = mongo.db.medecins.find_one({"_id": ObjectId(current_user_id)})
    if not doctor:
        return jsonify({"message": "Médecin non trouvé"}), 404

    status = request.args.get('status', 'all')  # Filter by status (pending, accepted, all)
    query = {"doctor_email": doctor['email']}
    if status != 'all':
        query['status'] = status

    appointments = mongo.db.appointments.find(query)
    appointments_list = [
        {
            "_id": str(appointment['_id']),
            "doctor_email": appointment['doctor_email'],
            "patient_email": appointment['patient_email'],
            "patient_name": appointment['patient_name'],
            "date": appointment['date'],
            "start_time": appointment['start_time'],
            "end_time": appointment['end_time'],
            "complaint": appointment['complaint'],
            "document_paths": appointment.get('document_paths', []),
            "created_at": appointment['created_at'].isoformat(),
            "status": appointment['status']
        }
        for appointment in appointments
    ]
    return jsonify({"appointments": appointments_list}), 200