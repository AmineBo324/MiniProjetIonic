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
        # Assuming create_appointment returns an object or success flag
        appointment = Appointment.create_appointment(
            data["patient_name"],
            data["doctor_email"],
            data["date"],
            data["start_time"],
            data["end_time"],
            data["complaint"]
        )
        return jsonify({"message": "Appointment created successfully", "appointment": appointment}), 201
    except Exception as e:
        return jsonify({"message": "Error creating appointment", "error": str(e)}), 500
