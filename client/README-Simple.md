# Hospital Appointment Booking System
## Full-Stack (Frontend + Backend + MongoDB)

## Quick Start

1. Open terminal in:
`hospital-system-fullstack/server`

2. Set environment variables (PowerShell):
```powershell
$env:MONGO_URI="your_mongodb_connection_string"
$env:JWT_SECRET="your_strong_secret"
```

3. Install dependencies (if not already):
```powershell
npm.cmd install
```

4. Start backend server:
```powershell
npm.cmd start
```

5. Open in browser:
`http://localhost:5000`

If MongoDB Atlas does not connect:
- Whitelist your current IP in Atlas Network Access.
- Confirm username/password in `MONGO_URI`.
- Ensure internet is available when starting backend.

## What Works
- User registration/login (patient and doctor)
- JWT-based authentication
- Patient: book appointment, view own appointments
- Doctor: view own appointments, approve/reject
- Doctor: update availability
- Doctor directory
- Data persisted in MongoDB via Mongoose

## Important Endpoints
- `GET /health`
- `POST /register`
- `POST /login`
- `GET /me` (Bearer token)
- `GET /doctors` (Bearer token)
- `POST /appointments` (patient token)
- `GET /appointments/patient/:patientId` (patient token, own id)
- `GET /appointments/doctor/:doctorId` (doctor token, own id)
- `PATCH /appointments/:appointmentId/status` (doctor token)
- `PATCH /doctors/:doctorId/availability` (doctor token)

## Postman
Import from project root `postman/` folder:
- `MediCare-Hospital-API.postman_collection.json`
- `MediCare-Local.postman_environment.json`
