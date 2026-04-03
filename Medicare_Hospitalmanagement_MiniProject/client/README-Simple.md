# 🏥 Hospital Appointment Booking System
## Simplified 3-Module Implementation

---

## 📁 Project Files

```
hospital-system/
│
├── index.html       (HTML Structure)
├── style.css        (Styling)
├── script.js        (JavaScript Logic)
└── README.md        (Documentation)
```

---

## ✨ Features Implemented

### Module 1: User Management (M. Takur)
- ✅ Patient & Doctor Registration
- ✅ Login/Logout System
- ✅ Session Management

### Module 2: Doctor Scheduling (Sk. Hasan)
- ✅ Doctor Availability Setup
- ✅ Appointment Approval/Rejection
- ✅ Weekly Schedule Management

### Module 3: Database Management (M. Harsha)
- ✅ LocalStorage Database
- ✅ CRUD Operations
- ✅ Data Validation
- ✅ Appointment Storage

---

## 🚀 How to Run

1. **Download all 3 files** (index.html, style.css, script.js)
2. **Keep them in the same folder**
3. **Open index.html** in your browser
4. **Done!** No server needed

---

## 🔑 Default Login

**Doctor Account:**
- Email: `dr.rajesh@hospital.com`
- Password: `doctor123`
- Role: Doctor

**Patient:** Register your own account

---

## 📖 User Guide

### For Patients

1. **Register**
   - Click "Register"
   - Fill details and select "Patient"
   - Create password

2. **Book Appointment**
   - Login
   - Select specialty and doctor
   - Choose date and time
   - Submit

3. **View Appointments**
   - Check "My Appointments" tab
   - Cancel if needed

### For Doctors

1. **Login**
   - Use doctor credentials
   - Select "Doctor" role

2. **Manage Appointments**
   - View all requests
   - Approve or reject

3. **Set Schedule**
   - Go to "Set Availability"
   - Select working days
   - Save

---

## 💾 Database Structure

### Users Table
```javascript
{
  id: number,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  age: number,
  gender: string,
  role: 'patient' | 'doctor',
  specialty: string (for doctors),
  password: string
}
```

### Appointments Table
```javascript
{
  id: number,
  patientId: number,
  patientName: string,
  doctorId: number,
  doctorName: string,
  specialty: string,
  date: string,
  time: string,
  reason: string,
  status: 'pending' | 'confirmed' | 'cancelled',
  createdAt: string
}
```

### Doctor Schedules
```javascript
{
  [doctorId]: {
    monday: boolean,
    tuesday: boolean,
    wednesday: boolean,
    thursday: boolean,
    friday: boolean,
    saturday: boolean,
    sunday: boolean
  }
}
```

---

## 🎯 Key Functions

### JavaScript (script.js)

**User Management:**
- `handleRegister()` - Register new users
- `handleLogin()` - Authenticate users
- `logout()` - End session

**Appointments:**
- `handleBooking()` - Book appointment
- `loadPatientAppointments()` - Show patient's appointments
- `cancelAppointment()` - Cancel booking

**Doctor Functions:**
- `loadDoctorAppointments()` - Show doctor's appointments
- `approveAppointment()` - Approve request
- `rejectAppointment()` - Reject request
- `handleAvailability()` - Save schedule

**UI Functions:**
- `showPage()` - Switch between pages
- `showTab()` - Switch dashboard tabs
- `updateDoctorList()` - Filter doctors by specialty

---

## 🎨 Design Features

- Clean purple gradient theme
- Responsive design (mobile-friendly)
- Smooth animations
- Card-based layout
- Simple navigation

---

## 📊 Code Complexity

**Reduced to ~50% of original:**

| File | Lines | Purpose |
|------|-------|---------|
| index.html | ~200 | Structure |
| style.css | ~350 | Styling |
| script.js | ~400 | Logic |
| **Total** | **~950 lines** | Complete System |

**No Classes Used!** Simple functions only.

---

## 🔧 Technical Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Storage:** Browser LocalStorage
- **Architecture:** Functional Programming (no OOP)
- **Dependencies:** None (pure code)

---

## ✅ What Works

✅ User registration and login  
✅ Appointment booking  
✅ Doctor appointment management  
✅ Approve/reject appointments  
✅ Doctor schedule setup  
✅ Data persistence  
✅ Form validation  
✅ Duplicate booking prevention  

---

## 💡 Tips

1. **Data Storage:** All data in browser localStorage
2. **Testing:** Use default doctor account
3. **Clear Data:** Clear browser cache to reset
4. **Browser:** Works in Chrome, Firefox, Safari, Edge

---

## 👥 Team Members

- **M. Takur** - Module 1 (User Management)
- **Sk. Hasan** - Module 2 (Doctor Scheduling)
- **M. Harsha** - Module 3 (Database Management)

---

## 📝 Version

**Version:** Simplified 3-Module  
**Date:** February 2026  
**Code Complexity:** ~50% (Moderate Level)

---

## 🎓 Academic Project

This is a simplified academic project implementing core hospital appointment booking functionality with clean, understandable code suitable for learning purposes.

**No complex OOP classes - Just simple functions!**