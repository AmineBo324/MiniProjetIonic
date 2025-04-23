from flask import Flask
from flask_cors import CORS
from routes.medecin import medecin
from routes.appointment import appointment
from routes.patient import patient
from config import init_app, mongo, bcrypt, jwt

app = Flask(__name__)
CORS(app)

# Initialize configuration
init_app(app)

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Set max upload size to 16MB

# Register blueprints
app.register_blueprint(medecin, url_prefix="/medecin")
app.register_blueprint(appointment, url_prefix="/appointment")
app.register_blueprint(patient, url_prefix="/patient")

if __name__ == "__main__":
    app.run(debug=True)