from flask import Flask
from flask_cors import CORS
from routes.medecin import medecin
from routes.appointment import appointment

app = Flask(__name__)
CORS(app)

app.register_blueprint(medecin, url_prefix="/medecin")
app.register_blueprint(appointment, url_prefix="/appointment")

if __name__ == "__main__":
    app.run(debug=True)
