from flask import Blueprint, request, jsonify
from models import Appointment
from config import mongo
import base64
from flask import request, jsonify
from werkzeug.utils import secure_filename
from bson import ObjectId
from dateutil import parser
import pytz


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
    # Initialize variables
    data = {}
    documents_base64 = []
    
    # Check if request is multipart/form-data (with files) or JSON
    if request.content_type.startswith('multipart/form-data'):
        data = request.form.to_dict()
        files = request.files.getlist('documents')
        
        # Process each file
        for file in files:
            if file and allowed_file(file.filename):
                file_content = file.read()
                documents_base64.append({
                    "filename": secure_filename(file.filename),
                    "content": base64.b64encode(file_content).decode('utf-8'),
                    "mimetype": file.mimetype,
                    "size": len(file_content)
                })
    else:
        # Handle JSON request (could contain base64 files)
        data = request.get_json()
        if 'documents_base64' in data:
            for doc in data['documents_base64']:
                if isinstance(doc, dict) and 'content' in doc:
                    documents_base64.append({
                        "filename": doc.get('filename', 'document'),
                        "content": doc['content'],  # Assume already base64
                        "mimetype": doc.get('mimetype', 'application/octet-stream'),
                        "size": len(base64.b64decode(doc['content']))
                    })
    
    # Validate required fields
    required_fields = ["patient_name", "patient_email", "doctor_email", 
                      "date", "start_time", "end_time", "complaint"]
    
    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required fields"}), 400
    
    try:
        # Check for overlapping appointments
        overlapping_appointment = Appointment.find_overlapping_appointment(
            data["doctor_email"],
            data["date"],
            data["start_time"],
            data["end_time"]
        )
        
        if overlapping_appointment:
            return jsonify({"message": "Selected time slot is unavailable"}), 400
        
        # Create and save the new appointment with base64 files
        new_appointment = {
            "patient_name": data["patient_name"],
            "patient_email": data["patient_email"],
            "doctor_email": data["doctor_email"],
            "date": data["date"],
            "start_time": data["start_time"],
            "end_time": data["end_time"],
            "complaint": data["complaint"],
            "documents": documents_base64
        }
        
        # Insert into MongoDB
        result = mongo.db.appointments.insert_one(new_appointment)
        new_appointment['_id'] = str(result.inserted_id)
        
        # Remove file contents from response to reduce payload size
        response_docs = [{"filename": doc['filename'], "size": doc['size']} 
                        for doc in documents_base64]
        
        return jsonify({
            "message": "Appointment created successfully",
            "appointment": new_appointment,
            "documents": response_docs
        }), 201
        
    except Exception as e:
        return jsonify({"message": "Error creating appointment", "error": str(e)}), 500
    

@appointment.route("/get_document/<appointment_id>/<int:doc_index>", methods=["GET"])
def get_document(appointment_id, doc_index):
    try:
        appointment = mongo.db.appointments.find_one(
            {"_id": ObjectId(appointment_id)},
            {"documents": {"$slice": [doc_index, 1]}}
        )
        
        if not appointment or not appointment.get('documents'):
            return jsonify({"error": "Document not found"}), 404
            
        document = appointment['documents'][0]
        return jsonify({
            "filename": document['filename'],
            "mimetype": document['mimetype'],
            "content": document['content'],  # Base64 string
            "size": document['size']
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


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
    
@appointment.route("/appointment_stats", methods=["GET"])
def get_appointment_stats():
    try:
        # Get parameters from query string
        start_date = request.args.get("start_date")  # Format: YYYY-MM-DD
        end_date = request.args.get("end_date")      # Format: YYYY-MM-DD
        group_by = request.args.get("group_by")      # Options: day, week, month
        doctor_email = request.args.get("doctor_email")  # Optional filter
        
        # Validate required parameters
        if not start_date or not end_date:
            return jsonify({"error": "start_date and end_date are required parameters"}), 400
            
        # Parse dates
        try:
            start_dt = parser.parse(start_date).replace(tzinfo=pytz.UTC)
            end_dt = parser.parse(end_date).replace(tzinfo=pytz.UTC).replace(hour=23, minute=59, second=59)
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

        # Validate group_by
        if group_by not in ['day', 'week', 'month']:
            group_by = 'day'  # Default to day

        # Build MongoDB query
        query = {
            "date": {
                "$gte": start_dt.strftime("%Y-%m-%d"),
                "$lte": end_dt.strftime("%Y-%m-%d")
            }
        }
        if doctor_email:
            query["doctor_email"] = doctor_email

        # Aggregation pipeline
        pipeline = [
            {"$match": query},
            {"$group": {
                "_id": {
                    "$dateTrunc": {
                        "date": {"$dateFromString": {"dateString": "$date"}},
                        "unit": group_by
                    }
                },
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}},
            {"$project": {
                "period": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$_id"
                    }
                },
                "count": 1,
                "_id": 0
            }}
        ]

        # Execute aggregation
        results = list(mongo.db.appointments.aggregate(pipeline))
        total = sum(item['count'] for item in results)

        return jsonify({
            "stats": results,
            "total": total
        })

    except Exception as e:
        return jsonify({"error": f"Failed to retrieve stats: {str(e)}"}), 500