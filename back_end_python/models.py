from datetime import datetime
from config import mongo, bcrypt

class Medecin:
    @staticmethod
    def create_medecin(nom, prenom, email, password, specialite, zone_geographique, rating, availability,image):
        medecins = mongo.db.medecins  # Collection "medecins"
        
        # Vérifier si le médecin existe déjà
        if medecins.find_one({"email": email}):
            return {"message": "Médecin déjà inscrit"}, 400

        # Hachage du mot de passe
        hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

        # Insérer le médecin
        medecins.insert_one({
            "nom": nom,
            "prenom": prenom,
            "email": email,
            "password": hashed_pw,
            "specialite": specialite,
            "zone_geographique": zone_geographique,
            "rating": rating,
            "availability": availability,
            "image" : image
        })

        return {"message": "Médecin enregistré avec succès"}, 201

    @staticmethod
    def find_by_email(email):
        """Trouver un médecin par son email"""
        return mongo.db.medecins.find_one({"email": email}, {"password": 0})  # Exclure le mot de passe

    @staticmethod
    def find_by_criteria(criteria):
        """Rechercher des médecins selon des critères donnés (ex: spécialité, zone)"""
        # Find medecins based on the criteria
        medecins = mongo.db.medecins.find(criteria)
        
        # Convert ObjectId to string for all returned documents
        result = []
        for medecin in medecins:
            medecin["_id"] = str(medecin["_id"])  # Convert ObjectId to string
            result.append(medecin)
        
        return result
    

class Patient:
    @staticmethod
    def create_patient(nom, prenom, email, password, date_naissance, genre, 
                       adresse, telephone):
        patients = mongo.db.patients  # Collection "patients"
        
        # Vérifier si le patient existe déjà
        if patients.find_one({"email": email}):
            return {"message": "Patient déjà inscrit"}, 400

        # Hachage du mot de passe
        hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")
        
        # Préparer le document patient
        patient_data = {
            "nom": nom,
            "prenom": prenom,
            "email": email,
            "password": hashed_pw,
            "date_naissance": date_naissance,
            "genre": genre,
            "adresse": adresse,
            "telephone": telephone
        }

        # Insérer le patient
        result = patients.insert_one(patient_data)
        
        return {"message": "Patient enregistré avec succès", "id": str(result.inserted_id)}, 201

    @staticmethod
    def find_by_email(email):
        """Trouver un patient par son email"""
        patient = mongo.db.patients.find_one({"email": email}, {"password": 0})  # Exclure le mot de passe
        if patient:
            patient["_id"] = str(patient["_id"])  # Convert ObjectId to string
        return patient

    @staticmethod
    def update_profile(patient_id, update_data):
        """Mettre à jour le profil d'un patient"""
        # Ne pas permettre la mise à jour du mot de passe via cette méthode
        if "password" in update_data:
            del update_data["password"]
        
        result = mongo.db.patients.update_one(
            {"_id": mongo.ObjectId(patient_id)},
            {"$set": update_data}
        )
        
        if result.modified_count:
            return {"message": "Profil mis à jour avec succès"}, 200
        return {"message": "Aucune modification apportée"}, 304

    @staticmethod
    def update_password(patient_id, current_password, new_password):
        """Mettre à jour le mot de passe d'un patient"""
        # Récupérer le patient avec son mot de passe
        patient = mongo.db.patients.find_one({"_id": mongo.ObjectId(patient_id)})
        
        if not patient:
            return {"message": "Patient non trouvé"}, 404
            
        # Vérifier que l'ancien mot de passe est correct
        if not bcrypt.check_password_hash(patient["password"], current_password):
            return {"message": "Mot de passe actuel incorrect"}, 400
            
        # Hacher le nouveau mot de passe
        hashed_pw = bcrypt.generate_password_hash(new_password).decode("utf-8")
        
        # Mettre à jour le mot de passe
        mongo.db.patients.update_one(
            {"_id": mongo.ObjectId(patient_id)},
            {"$set": {"password": hashed_pw}}
        )
        
        return {"message": "Mot de passe mis à jour avec succès"}, 200
            
    

class Appointment:
    @staticmethod
    def create_appointment(patient_name, patient_email, doctor_email, date, start_time, end_time, complaint, document_paths):
        """Create a new appointment record"""
        appointment = {
            "patient_name": patient_name,
            "patient_email": patient_email,
            "doctor_email": doctor_email,
            "date": date,
            "start_time": start_time,
            "end_time": end_time,
            "complaint": complaint,
            "document_paths": document_paths,  # Store file paths instead of base64 data
            "created_at": datetime.now()
        }
        
        result = mongo.db.appointments.insert_one(appointment)
        # Convert _id to string for JSON serialization
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