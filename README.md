OVERVIEW
###Medical Cabinet Application

A cross-platform medical appointment management system with Python backend and Ionic frontend for doctors and patients to manage appointments, medical records, and prescriptions.

##Project Overview##
This project consists of two main components:

##Backend (Python Flask)
Written in Python using Flask framework
MongoDB database integration
RESTful API for appointment management
JWT authentication for secure access
Models for patients, doctors, appointments

##Frontend (Ionic/Angular)
Cross-platform mobile application
HTTP requests with HttpClient
User interfaces for doctors and patients

##Directory Structure
├── backend_python
│   ├── __pycache__
│   ├── routes
│   │   ├── appointment.py
│   │   ├── medecin.py
│   │   └── patient.py
│   ├── venv
│   ├── app.py
│   ├── config.py
│   └── models.py
│
├── node_modules
└── src
    ├── app
    │   ├── accueil
    │   ├── appointment
    │   ├── doctorlist
    │   ├── login
    │   ├── signup
    │   └── userprofile
    │       ├── userprofile-routing.module.ts
    │       ├── userprofile.module.ts
    │       ├── userprofile.page.html
    │       ├── userprofile.page.scss
    │       ├── userprofile.page.spec.ts
    │       └── userprofile.page.ts
    ├── app-routing.module.ts
    ├── app.component.html
    ├── app.component.scss
    ├── app.component.spec.ts
    └── app.component.ts

##Prerequisites
Backend Prerequisites
Python: 3.8 or later
MongoDB: Version 4.0 or later
Pip: Python package manager

Frontend Prerequisites
Node.js: 14.x or later
Ionic CLI: 6.x or later
Angular CLI: 12.x or later


##Installation
#Backend Setup
Navigate to backend directory:

cd backend_python
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate    # Windows

Install dependencies:
pip install -r requirements.txt

#######requirements.txt#########
Flask==2.0.1
Flask-PyMongo==2.3.0
Flask-JWT-Extended==4.3.1
Flask-Cors==3.0.10
python-dotenv==0.19.0
bcrypt==3.2.0
PyJWT==2.3.0
pymongo==3.12.0
#################################

Configure MongoDB connection in config.py:
MONGO_URI = "mongodb://localhost:27017/medical_cabinet"

Run the backend server:
flask run or py app.py

##Frontend Setup
Navigate to project root:
cd src

Install dependencies:
npm install

Run the Ionic app:
ionic serve

##Features
User authentication (Doctors & Patients)
Appointment scheduling
Doctor availability management
Patient medical records
Prescription management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request