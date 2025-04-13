from flask import Flask, request, jsonify
from pymongo import MongoClient
from datetime import datetime , timezone
from flask_cors import CORS  


app = Flask(__name__)
CORS(app) 
client = MongoClient("mongodb://localhost:27017/")  # Update with your actual MongoDB URI
db = client["medicalDB"]
doctors_collection = db["doctors"]

@app.route("/doctor", methods=["POST"])
def create_doctor():
     try:
        data = request.json
        required_fields = ["name", "email", "password", "specialty"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        if "created_at" not in data:
            data["created_at"] = datetime.now(timezone.utc)
        print("Inserting into MongoDB:", data)  
        doctors_collection.insert_one(data)


        return jsonify({"message": "Doctor added successfully"}), 201
     except Exception as e:
         return jsonify({"error": str(e)}), 500

@app.route("/doctors", methods=["GET"])
def get_doctors():
    try:
        doctors = list(doctors_collection.find({}, {"_id": 1, "name": 1, "email": 1, "specialty": 1, "created_at": 1}))
        for doctor in doctors:
            doctor["_id"] = str(doctor["_id"])  # Convert ObjectId to string
        return jsonify(doctors), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/doctor/<id>", methods=["DELETE"])
def delete_doctor(id):
    try:
        doctors_collection.delete_one({"_id": ObjectId(id)})
        return jsonify({"message": "Doctor deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500         
if __name__ == "__main__":
    app.run(debug=True)
