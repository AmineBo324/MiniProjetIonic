from flask import Flask
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

app = Flask(__name__)

# MongoDB Configuration
app.config["MONGO_URI"] = "mongodb://localhost:27017/cabinet_medical"
mongo = PyMongo(app)

# Security Configs
app.config["JWT_SECRET_KEY"] = "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890"
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
