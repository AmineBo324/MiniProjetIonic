from config import mongo, bcrypt

class Medecin:
    @staticmethod
    def create_medecin(nom, prenom, email, password, specialite, zone_geographique, rating, availability):
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
            "availability": availability
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


class Appointment:
    @staticmethod
    def create_appointment(patient_name, doctor_email, date, start_time, end_time, complaint):
        appointments = mongo.db.appointments  # Collection "appointments"

        appointment = {
            "patient_name": patient_name,
            "doctor_email": doctor_email,
            "date": date,
            "start_time": start_time,
            "end_time": end_time,
            "complaint": complaint
        }

        appointments.insert_one(appointment)
        return {"message": "Appointment created successfully"}, 201
