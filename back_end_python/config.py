from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

# Initialize extensions
mongo = PyMongo()
bcrypt = Bcrypt()
jwt = JWTManager()

def init_app(app):
    # MongoDB Configuration
    app.config["MONGO_URI"] = "mongodb://localhost:27017/cabinet_medical"
    
    # JWT Configuration
    app.config["JWT_SECRET_KEY"] = "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890"
    
    # Initialize extensions with app
    mongo.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)