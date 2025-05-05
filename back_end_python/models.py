from datetime import datetime
from flask import jsonify
from flask_bcrypt import generate_password_hash, check_password_hash
from config import mongo, bcrypt
from bson import ObjectId

class Medecin:
    @staticmethod
    def create_medecin(nom, prenom, email, password, specialite, zone_geographique, rating, availability, image):
        if mongo.db.medecins.find_one({"email": email}):
            return jsonify({"error": "Email déjà utilisé"}), 400

        hashed_password = generate_password_hash(password).decode('utf-8')
        doctor = {
            "nom": nom,
            "prenom": prenom,
            "email": email,
            "password": hashed_password,
            "specialite": specialite,
            "zone_geographique": zone_geographique,
            "rating": rating,
            "availability": availability,
            "image": image,
            "userType": "doctor"
        }
        result = mongo.db.medecins.insert_one(doctor)
        return jsonify({"message": "Médecin enregistré avec succès", "_id": str(result.inserted_id)}), 201

    @staticmethod
    def find_by_email(email):
        doctor = mongo.db.medecins.find_one({"email": email}, {"password": 0})
        if doctor:
            doctor["_id"] = str(doctor["_id"])
            doctor["userType"] = "doctor"
        return doctor

    @staticmethod
    def find_by_criteria(criteria):
        doctors = mongo.db.medecins.find(criteria, {"password": 0})
        return [{
            "_id": str(doctor["_id"]),
            "nom": doctor.get("nom"),
            "prenom": doctor.get("prenom"),
            "email": doctor.get("email"),
            "specialite": doctor.get("specialite"),
            "zone_geographique": doctor.get("zone_geographique"),
            "rating": doctor.get("rating"),
            "availability": doctor.get("availability", []),
            "image": doctor.get("image"),
            "userType": "doctor"
        } for doctor in doctors]

class Patient:
    @staticmethod
    def create_patient(nom, prenom, email, password, date_naissance, genre, adresse, telephone):
        patients = mongo.db.patients
        if patients.find_one({"email": email}):
            return {"message": "Patient déjà inscrit"}, 400

        hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")
        patient_data = {
            "nom": nom,
            "prenom": prenom,
            "email": email,
            "password": hashed_pw,
            "date_naissance": date_naissance,
            "genre": genre,
            "adresse": adresse,
            "telephone": telephone,
            "userType": "patient"
        }
        result = patients.insert_one(patient_data)
        return {"message": "Patient enregistré avec succès", "id": str(result.inserted_id)}, 201

    @staticmethod
    def find_by_email(email):
        patient = mongo.db.patients.find_one({"email": email}, {"password": 0})
        if patient:
            patient["_id"] = str(patient["_id"])
            patient["userType"] = "patient"
        return patient

    @staticmethod
    def update_profile(patient_id, update_data):
        if "password" in update_data:
            del update_data["password"]
        
        result = mongo.db.patients.update_one(
            {"_id": ObjectId(patient_id)},
            {"$set": update_data}
        )
        
        if result.modified_count:
            return {"message": "Profil mis à jour avec succès"}, 200
        return {"message": "Aucune modification apportée"}, 304

    @staticmethod
    def update_password(patient_id, current_password, new_password):
        patient = mongo.db.patients.find_one({"_id": ObjectId(patient_id)})
        if not patient:
            return {"message": "Patient non trouvé"}, 404
        if not bcrypt.check_password_hash(patient["password"], current_password):
            return {"message": "Mot de passe actuel incorrect"}, 400
        hashed_pw = bcrypt.generate_password_hash(new_password).decode("utf-8")
        mongo.db.patients.update_one(
            {"_id": ObjectId(patient_id)},
            {"$set": {"password": hashed_pw}}
        )
        return {"message": "Mot de passe mis à jour avec succès"}, 200

class Appointment:
    @staticmethod
    def create_appointment(patient_name, patient_email, doctor_email, date, start_time, end_time, complaint, document_paths):
        appointment = {
            "patient_name": patient_name,
            "patient_email": patient_email,
            "patient_email": patient_email,
            "doctor_email": doctor_email,
            "date": date,
            "start_time": start_time,
            "end_time": end_time,
            "complaint": complaint,
            "document_paths": document_paths,
            "created_at": datetime.now(),
            "status": "pending"
        }
        result = mongo.db.appointments.insert_one(appointment)
        appointment["_id"] = str(result.inserted_id)
        return appointment

    @staticmethod
    def find_overlapping_appointment(doctor_email, date, new_start_time, new_end_time):
        appointments = mongo.db.appointments
        return appointments.find_one({
            "doctor_email": doctor_email,
            "date": date,
            "$or": [
                {
                    "start_time": {"$lt": new_end_time},
                    "end_time": {"$gt": new_start_time}
                }
            ]
        })

class Profile:
    @staticmethod
    def get_doctor_profile(doctor_id):
        doctor = mongo.db.medecins.find_one({"_id": ObjectId(doctor_id)}, {"password": 0})
        if doctor:
            doctor["_id"] = str(doctor["_id"])
            doctor["userType"] = "doctor"
        return doctor

    @staticmethod
    def update_personal_info(doctor_id, data):
        update_fields = {k: v for k, v in data.items() if k in ["nom", "prenom", "specialite", "zone_geographique", "image"]}
        if not update_fields:
            return False
        result = mongo.db.medecins.update_one(
            {"_id": ObjectId(doctor_id)},
            {"$set": update_fields}
        )
        return result.modified_count > 0

    @staticmethod
    def update_availability(doctor_id, availability):
        result = mongo.db.medecins.update_one(
            {"_id": ObjectId(doctor_id)},
            {"$set": {"availability": availability}}
        )
        return result.modified_count > 0

    @staticmethod
    def change_password(doctor_id, current_password, new_password):
        doctor = mongo.db.medecins.find_one({"_id": ObjectId(doctor_id)})
        if not doctor or not check_password_hash(doctor["password"], current_password):
            return False
        hashed_password = generate_password_hash(new_password).decode('utf-8')
        result = mongo.db.medecins.update_one(
            {"_id": ObjectId(doctor_id)},
            {"$set": {"password": hashed_password}}
        )
        return result.modified_count > 0

class Document:
    @staticmethod
    def get_documents(doctor_email):
        documents = mongo.db.documents.find({"doctor_email": doctor_email})
        return [{
            "_id": str(doc["_id"]),
            "doctor_email": doc.get("doctor_email"),
            "annotations": doc.get("annotations", []),
            "name": doc.get("name", "Document sans nom"),
            "patient_name": doc.get("patient_name", "Inconnu")
        } for doc in documents]

    @staticmethod
    def annotate_document(document_id, annotation):
        result = mongo.db.documents.update_one(
            {"_id": ObjectId(document_id)},
            {"$push": {"annotations": annotation}}
        )
        return result.modified_count > 0

class Consultation:
    @staticmethod
    def get_consultations(doctor_email):
        consultations = mongo.db.consultations.find({"doctor_email": doctor_email})
        return [{
            "_id": str(consult["_id"]),
            "appointmentId": consult.get("appointmentId"),
            "diagnosis": consult.get("diagnosis"),
            "prescription": consult.get("prescription"),
            "documents": consult.get("documents", [])
        } for consult in consultations]

    @staticmethod
    def create_consultation(appointmentId, diagnosis, prescription, documents):
        consultation = {
            "appointmentId": appointmentId,
            "diagnosis": diagnosis,
            "prescription": prescription,
            "documents": documents,
            "created_at": datetime.now()
        }
        result = mongo.db.consultations.insert_one(consultation)
        consultation["_id"] = str(result.inserted_id)
        return consultation