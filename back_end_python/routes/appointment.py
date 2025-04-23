from flask import Blueprint, request, jsonify
from models import Appointment
from config import mongo
import os
from flask import request, jsonify
from werkzeug.utils import secure_filename


appointment = Blueprint("appointment", __name__)

# Define uploads folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'}

# Helper function to check if file extension is allowed
def allowed_file(filename):
    return '.' in filename and \
           filename.split('.')[-1].lower() in ALLOWED_EXTENSIONS

@appointment.route("/create_appointment", methods=["POST"])
def create_appointment():
    # Check if the request contains form data with files
    if 'documents' not in request.files:
        # Handle JSON data for appointment without files
        data = request.json
        documents_paths = []
    else:
        # Handle multipart form data with files
        data = request.form.to_dict()
        documents = request.files.getlist('documents')
        documents_paths = []
        
        # Create uploads directory if it doesn't exist
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        
        # Save each uploaded file
        for file in documents:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                # Create patient-specific folder using email as identifier
                patient_folder = os.path.join(UPLOAD_FOLDER, data.get('patient_email', 'unknown'))
                if not os.path.exists(patient_folder):
                    os.makedirs(patient_folder)
                
                # Create a unique filename with timestamp
                from datetime import datetime
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_")
                filepath = os.path.join(patient_folder, timestamp + filename)
                file.save(filepath)
                documents_paths.append(filepath)
    
    required_fields = ["patient_name", "patient_email", "doctor_email", "date", "start_time", "end_time", "complaint"]
    
    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing fields"}), 400
    
    try:
        # Check if an overlapping appointment exists
        overlapping_appointment = Appointment.find_overlapping_appointment(
            data["doctor_email"],
            data["date"],
            data["start_time"],
            data["end_time"]
        )
        
        if overlapping_appointment:
            return jsonify({"message": "Selected time slot is unavailable"}), 400
        
        # Create and save the new appointment
        new_appointment = Appointment.create_appointment(
            data["patient_name"],
            data["patient_email"],
            data["doctor_email"],
            data["date"],
            data["start_time"],
            data["end_time"],
            data["complaint"],
            documents_paths  # Pass the list of document paths
        )
        
        return jsonify({
            "message": "Appointment created successfully", 
            "appointment": new_appointment,
            "documents": documents_paths
        }), 201
        
    except Exception as e:
        return jsonify({"message": "Error creating appointment", "error": str(e)}), 500
    

@appointment.route("/retrieve_appointment", methods=["GET"])
def get_appointments_by_doctor_and_time():
    # Get parameters from request.args (query string)
    doctor_email = request.args.get("doctor_email")
    date = request.args.get("date")
    start_time = request.args.get("start_time")
    end_time = request.args.get("end_time")
    
    # Validate required parameters
    if not doctor_email or not date:
        return jsonify({"error": "doctor_email and date are required parameters"}), 400
    
    # Query the database
    appointments = mongo.db.appointments
    query = {
        "doctor_email": doctor_email,
        "date": date
    }
    
    # Add time range conditions if provided
    if start_time and end_time:
        query["$or"] = [
            {"start_time": {"$gte": start_time, "$lt": end_time}},
            {"end_time": {"$gt": start_time, "$lte": end_time}},
            {"start_time": {"$lte": start_time}, "end_time": {"$gte": end_time}}
        ]
    elif start_time:
        query["start_time"] = start_time
    elif end_time:
        query["end_time"] = end_time
    
    # Find and format results
    results = []
    for appointment in appointments.find(query):
        appointment["_id"] = str(appointment["_id"])
        results.append(appointment)
    
    return jsonify(results)


@appointment.route("/patient_appointments", methods=["GET"])
def get_patient_appointments():
    # Get patient email from request.args (query string)
    patient_email = request.args.get("patient_email")
    
    # Validate required parameter
    if not patient_email:
        return jsonify({"error": "patient_email is a required parameter"}), 400
    
    try:
        # Query the database
        appointments = mongo.db.appointments
        query = {"patient_email": patient_email}
        
        # Find and format results
        results = []
        for appointment in appointments.find(query).sort("date", 1):  # Sort by date ascending
            # Convert ObjectId to string for JSON serialization
            appointment["_id"] = str(appointment["_id"])
            
            # Add doctor details if needed
            try:
                doctor = mongo.db.doctors.find_one({"email": appointment["doctor_email"]})
                if doctor:
                    doctor["_id"] = str(doctor["_id"])
                    appointment["doctor_details"] = doctor
            except Exception as e:
                print(f"Error fetching doctor details: {str(e)}")
            
            results.append(appointment)
        
        return jsonify(results)
    
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve appointments: {str(e)}"}), 500