from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from config import mongo
import datetime
from werkzeug.utils import secure_filename
import os

profile = Blueprint('profile', __name__)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'}

@profile.route('/', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    doctor = mongo.db.medecins.find_one({"_id": ObjectId(current_user_id)})
    if not doctor:
        return jsonify({"message": "Médecin non trouvé"}), 404

    doctor_data = {
        "_id": str(doctor['_id']),
        "nom": doctor.get('nom', ''),
        "prenom": doctor.get('prenom', ''),
        "specialite": doctor.get('specialite', ''),
        "zone_geographique": doctor.get('zone_geographique', ''),
        "email": doctor.get('email', '')
    }
    return jsonify({"doctor": doctor_data}), 200

@profile.route('/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    current_user_id = get_jwt_identity()
    doctor = mongo.db.medecins.find_one({"_id": ObjectId(current_user_id)})
    if not doctor:
        return jsonify({"message": "Médecin non trouvé"}), 404

    status = request.args.get('status', 'all')
    date = request.args.get('date')
    query = {"doctor_email": doctor['email']}
    if status != 'all':
        query['status'] = status
    if date:
        query['date'] = date

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

@profile.route('/documents', methods=['GET'])
@jwt_required()
def get_documents():
    current_user_id = get_jwt_identity()
    doctor = mongo.db.medecins.find_one({"_id": ObjectId(current_user_id)})
    if not doctor:
        return jsonify({"message": "Médecin non trouvé"}), 404

    documents = mongo.db.documents.find({"doctor_email": doctor['email']})
    documents_list = [
        {
            "_id": str(doc['_id']),
            "doctor_email": doc['doctor_email'],
            "annotations": doc.get('annotations', []),
            "name": doc['name'],
            "patient_name": doc['patient_name']
        }
        for doc in documents
    ]
    return jsonify({"documents": documents_list}), 200

@profile.route('/consultations', methods=['GET'])
@jwt_required()
def get_consultations():
    current_user_id = get_jwt_identity()
    doctor = mongo.db.medecins.find_one({"_id": ObjectId(current_user_id)})
    if not doctor:
        return jsonify({"message": "Médecin non trouvé"}), 404

    consultations = mongo.db.consultations.find({"doctor_email": doctor['email']})
    consultations_list = [
        {
            "_id": str(consultation['_id']),
            "appointmentId": consultation['appointmentId'],
            "diagnosis": consultation['diagnosis'],
            "prescription": consultation['prescription'],
            "documents": consultation.get('documents', [])
        }
        for consultation in consultations
    ]
    return jsonify({"consultations": consultations_list}), 200

@profile.route('/update', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    update_data = {k: v for k, v in data.items() if k in ['nom', 'prenom', 'specialite', 'zone_geographique', 'image']}
    mongo.db.medecins.update_one(
        {"_id": ObjectId(current_user_id)},
        {"$set": update_data}
    )
    return jsonify({"message": "Profil mis à jour"}), 200

@profile.route('/availability', methods=['PUT'])
@jwt_required()
def update_availability():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    mongo.db.medecins.update_one(
        {"_id": ObjectId(current_user_id)},
        {"$set": {"availability": data['availability']}}
    )
    return jsonify({"message": "Disponibilités mises à jour"}), 200

@profile.route('/appointments/<appointmentId>/accept', methods=['PUT'])
@jwt_required()
def accept_appointment(appointmentId):
    current_user_id = get_jwt_identity()
    doctor = mongo.db.medecins.find_one({"_id": ObjectId(current_user_id)})
    if not doctor:
        return jsonify({"message": "Médecin non trouvé"}), 404

    mongo.db.appointments.update_one(
        {"_id": ObjectId(appointmentId), "doctor_email": doctor['email']},
        {"$set": {"status": "accepted"}}
    )
    return jsonify({"message": "Rendez-vous accepté"}), 200

@profile.route('/appointments/<appointmentId>/reject', methods=['PUT'])
@jwt_required()
def reject_appointment(appointmentId):
    current_user_id = get_jwt_identity()
    doctor = mongo.db.medecins.find_one({"_id": ObjectId(current_user_id)})
    if not doctor:
        return jsonify({"message": "Médecin non trouvé"}), 404

    result = mongo.db.appointments.delete_one(
        {"_id": ObjectId(appointmentId), "doctor_email": doctor['email']}
    )
    if result.deleted_count == 1:
        return jsonify({"message": "Rendez-vous rejeté et supprimé"}), 200
    else:
        return jsonify({"message": "Rendez-vous non trouvé"}), 404

@profile.route('/appointments/<appointmentId>', methods=['DELETE'])
@jwt_required()
def cancel_appointment(appointmentId):
    current_user_id = get_jwt_identity()
    doctor = mongo.db.medecins.find_one({"_id": ObjectId(current_user_id)})
    if not doctor:
        return jsonify({"message": "Médecin non trouvé"}), 404

    mongo.db.appointments.delete_one(
        {"_id": ObjectId(appointmentId), "doctor_email": doctor['email']}
    )
    return jsonify({"message": "Rendez-vous annulé"}), 200

@profile.route('/documents/<documentId>/annotate', methods=['PUT'])
@jwt_required()
def annotate_document(documentId):
    current_user_id = get_jwt_identity()
    doctor = mongo.db.medecins.find_one({"_id": ObjectId(current_user_id)})
    if not doctor:
        return jsonify({"message": "Médecin non trouvé"}), 404

    data = request.get_json()
    mongo.db.documents.update_one(
        {"_id": ObjectId(documentId), "doctor_email": doctor['email']},
        {"$push": {"annotations": data['annotation']}}
    )
    return jsonify({"message": "Annotation ajoutée"}), 200

@profile.route('/consultations', methods=['POST'])
@jwt_required()
def save_consultation():
    current_user_id = get_jwt_identity()
    doctor = mongo.db.medecins.find_one({"_id": ObjectId(current_user_id)})
    if not doctor:
        return jsonify({"message": "Médecin non trouvé"}), 404

    data = request.get_json()
    consultation_data = {
        "appointmentId": data['appointmentId'],
        "diagnosis": data['diagnosis'],
        "prescription": data['prescription'],
        "documents": data['documents'],
        "doctor_email": doctor['email'],
        "created_at": datetime.datetime.utcnow()
    }
    mongo.db.consultations.insert_one(consultation_data)
    return jsonify({"message": "Consultation enregistrée"}), 201

@profile.route('/consultations/<consultationId>/add-document', methods=['POST'])
@jwt_required()
def add_document_to_consultation(consultationId):
    current_user_id = get_jwt_identity()
    doctor = mongo.db.medecins.find_one({"_id": ObjectId(current_user_id)})
    if not doctor:
        return jsonify({"message": "Médecin non trouvé"}), 404

    if 'file' not in request.files:
        return jsonify({"error": "Aucun fichier fourni"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Aucun fichier sélectionné"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        consultation = mongo.db.consultations.find_one({"_id": ObjectId(consultationId)})
        if not consultation:
            return jsonify({"message": "Consultation non trouvée"}), 404

        document = {
            "path": f"/Uploads/{filename}",
            "name": file.filename,
            "patient_name": consultation['patient_name'],
            "doctor_email": doctor['email'],
            "appointmentId": ObjectId(consultation['appointmentId']),
            "consultationId": ObjectId(consultationId),
            "annotations": []
        }
        result = mongo.db.documents.insert_one(document)
        doc_id = str(result.inserted_id)

        mongo.db.consultations.update_one(
            {"_id": ObjectId(consultationId), "doctor_email": doctor['email']},
            {"$push": {"document_ids": doc_id}}
        )
        return jsonify({"message": "Document ajouté à la consultation", "documentId": doc_id}), 200
    return jsonify({"error": "Type de fichier non autorisé"}), 400