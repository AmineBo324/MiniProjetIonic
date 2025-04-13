from flask import Blueprint, request, jsonify
from models import Appointment
from config import mongo


appointment = Blueprint("appointment", __name__)

@appointment.route("/create_appointment", methods=["POST"])
def create_appointment():
    data = request.json
    required_fields = ["patient_name", "doctor_email", "date", "start_time", "end_time", "complaint"]

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
            data["doctor_email"],
            data["date"],
            data["start_time"],
            data["end_time"],
            data["complaint"]
        )

        return jsonify({"message": "Appointment created successfully", "appointment": new_appointment}), 201
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