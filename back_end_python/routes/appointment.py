from flask import Blueprint, request, jsonify
from models import Appointment

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