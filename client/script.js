<<<<<<< HEAD
const API_BASE_URL = "http://localhost:5000";
const TOKEN_STORAGE_KEY = "medicare_auth_token";

let currentUser = null;
let doctors = [];
let patientAppointments = [];
let doctorAppointments = [];

function getAuthToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function setAuthToken(token) {
    if (!token) return;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

function clearAuthToken() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatDate(value) {
    if (!value) return "-";
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString();
}

function getStatusClass(status) {
    if (status === "confirmed") return "status-confirmed";
    if (status === "rejected") return "status-rejected";
    return "status-pending";
}

async function apiRequest(path, options = {}) {
    const token = getAuthToken();
    const requestOptions = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {})
        }
    };

    const response = await fetch(`${API_BASE_URL}${path}`, requestOptions);
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
        ? await response.json()
        : { message: await response.text() };

    if (!response.ok) {
        if (response.status === 401 && token) {
            clearAuthToken();
            currentUser = null;
            resetNavForLoggedOut();
            showPage("loginPage");
        }
        throw new Error(payload.message || `Request failed (${response.status})`);
    }

    return payload;
}

function showPage(pageId) {
    document.querySelectorAll(".page").forEach((page) => {
        page.classList.remove("active");
    });

    const target = document.getElementById(pageId);
    if (!target) return;

    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateNavForLoggedIn() {
    const displayName = `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || currentUser.email;
    document.getElementById("userName").textContent = displayName;
=======
let currentUser = null;
let users = [];
let appointments = [];
let doctorSchedules = {};

/* ============================= */
/* REGISTER */
/* ============================= */

async function handleRegister(e) {
    e.preventDefault();

    const userData = {
        firstName: document.getElementById('regFirstName').value,
        lastName: document.getElementById('regLastName').value,
        email: document.getElementById('regEmail').value,
        phone: document.getElementById('regPhone')?.value || "",
        age: document.getElementById('regAge')?.value || null,
        gender: document.getElementById('regGender')?.value || "",
        role: document.getElementById('regRole').value,
        password: document.getElementById('regPassword').value,
        specialty: document.getElementById('regSpecialty')?.value || null
    };

    try {
        const response = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        userData.id = Date.now();
        users.push(userData);

        alert("Registration successful!");
        document.getElementById('registerForm').reset();
        showPage("loginPage");

    } catch (error) {
        alert("Server not running!");
    }
}

/* ============================= */
/* LOGIN */
/* ============================= */

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        const backendUser = data.user;

        if (!users.find(u => u.email === backendUser.email)) {
            users.push({
                ...backendUser,
                id: Date.now()
            });
        }

        currentUser = users.find(u => u.email === backendUser.email);

        updateNavForLoggedIn();
        redirectToDashboard();

    } catch (error) {
        alert("Server not running!");
    }
}

/* ============================= */
/* BASIC NAVIGATION FUNCTIONS */
/* ============================= */

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
        console.error(`Page not found: ${pageId}`);
    }
}

function updateNavForLoggedIn() {
    document.getElementById("userName").textContent =
        currentUser.firstName + " " + currentUser.lastName;
>>>>>>> 5ec7ce04015139f667da1aa11f24df21e004a1d6
    document.getElementById("loginBtn").classList.add("hidden");
    document.getElementById("registerBtn").classList.add("hidden");
    document.getElementById("userMenu").classList.remove("hidden");
}

<<<<<<< HEAD
function resetNavForLoggedOut() {
    document.getElementById("userMenu").classList.add("hidden");
    document.getElementById("loginBtn").classList.remove("hidden");
    document.getElementById("registerBtn").classList.remove("hidden");
}

function redirectToDashboard() {
    if (!currentUser) {
        showPage("homePage");
        return;
    }

    if (currentUser.role === "patient") {
        showPage("patientDashboard");
        switchTab("patient", "book");
        return;
    }

    showPage("doctorDashboard");
    switchTab("doctor", "manage");
}

async function restoreSessionIfPossible() {
    const token = getAuthToken();
    if (!token) return;

    try {
        const response = await apiRequest("/me");
        currentUser = response.user;
        updateNavForLoggedIn();
        redirectToDashboard();
        await loadDashboardData();
    } catch (_error) {
        clearAuthToken();
        currentUser = null;
        resetNavForLoggedOut();
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const role = document.getElementById("regRole").value;
    const specialty = document.getElementById("regSpecialty").value.trim();

    if (role === "doctor" && !specialty) {
        alert("Please enter specialty for doctor registration.");
        return;
    }

    const userData = {
        firstName: document.getElementById("regFirstName").value.trim(),
        lastName: document.getElementById("regLastName").value.trim(),
        email: document.getElementById("regEmail").value.trim(),
        phone: document.getElementById("regPhone").value.trim(),
        age: document.getElementById("regAge").value || null,
        gender: document.getElementById("regGender").value,
        role,
        password: document.getElementById("regPassword").value,
        specialty: role === "doctor" ? specialty : null
    };

    try {
        await apiRequest("/register", {
            method: "POST",
            body: JSON.stringify(userData)
        });

        alert("Registration successful. Please login.");
        document.getElementById("registerForm").reset();
        handleRoleChange();
        showPage("loginPage");
    } catch (error) {
        alert(error.message);
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await apiRequest("/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        currentUser = response.user;
        setAuthToken(response.token);
        updateNavForLoggedIn();
        redirectToDashboard();
        await loadDashboardData();
    } catch (error) {
        alert(error.message);
=======
function redirectToDashboard() {
    if (currentUser.role === "patient") {
        showPage("patientDashboard");
    } else {
        showPage("doctorDashboard");
>>>>>>> 5ec7ce04015139f667da1aa11f24df21e004a1d6
    }
}

function logout() {
    currentUser = null;
<<<<<<< HEAD
    doctors = [];
    patientAppointments = [];
    doctorAppointments = [];
    clearAuthToken();

    resetNavForLoggedOut();
=======
    document.getElementById("userMenu").classList.add("hidden");
    document.getElementById("loginBtn").classList.remove("hidden");
    document.getElementById("registerBtn").classList.remove("hidden");
>>>>>>> 5ec7ce04015139f667da1aa11f24df21e004a1d6
    showPage("homePage");
}

function switchTab(scope, tab) {
    if (scope === "patient") {
        const isBook = tab === "book";
        document.getElementById("patientBookTabBtn").classList.toggle("active", isBook);
        document.getElementById("patientMyTabBtn").classList.toggle("active", !isBook);
        document.getElementById("patientBookTab").classList.toggle("active", isBook);
        document.getElementById("patientMyTab").classList.toggle("active", !isBook);
<<<<<<< HEAD

        if (!isBook && currentUser?.role === "patient") {
            loadPatientAppointments();
        }
=======
>>>>>>> 5ec7ce04015139f667da1aa11f24df21e004a1d6
    }

    if (scope === "doctor") {
        const isManage = tab === "manage";
        document.getElementById("doctorManageTabBtn").classList.toggle("active", isManage);
        document.getElementById("doctorAvailabilityTabBtn").classList.toggle("active", !isManage);
        document.getElementById("doctorManageTab").classList.toggle("active", isManage);
        document.getElementById("doctorAvailabilityTab").classList.toggle("active", !isManage);
<<<<<<< HEAD

        if (isManage && currentUser?.role === "doctor") {
            loadDoctorAppointments();
        }
    }
}

async function loadDashboardData() {
    if (!currentUser) return;

    if (currentUser.role === "patient") {
        await Promise.all([loadDoctors(), loadPatientAppointments()]);
        return;
    }

    await loadDoctorAppointments();
    hydrateAvailabilityForm();
}

async function loadDoctors() {
    try {
        const response = await apiRequest("/doctors");
        doctors = response.doctors || [];
        renderSpecialtyOptions();
        renderDoctorDirectory();
    } catch (error) {
        alert(error.message);
    }
}

function renderSpecialtyOptions() {
    const specialtySelect = document.getElementById("bookSpecialty");
    if (!specialtySelect) return;

    const previousValue = specialtySelect.value;
    const specialties = [...new Set(doctors.map((doctor) => doctor.specialty).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b));

    specialtySelect.innerHTML = [
        '<option value="">Choose...</option>',
        ...specialties.map((specialty) => `<option value="${escapeHtml(specialty)}">${escapeHtml(specialty)}</option>`)
    ].join("");

    if (specialties.includes(previousValue)) {
        specialtySelect.value = previousValue;
    }

    renderDoctorOptions(specialtySelect.value);
}

function renderDoctorOptions(selectedSpecialty) {
    const doctorSelect = document.getElementById("bookDoctor");
    if (!doctorSelect) return;

    const filteredDoctors = selectedSpecialty
        ? doctors.filter((doctor) => doctor.specialty === selectedSpecialty)
        : doctors;

    doctorSelect.innerHTML = filteredDoctors.length
        ? ['<option value="">Choose doctor</option>', ...filteredDoctors.map((doctor) => {
            const name = `${doctor.firstName} ${doctor.lastName}`;
            return `<option value="${doctor.id}">${escapeHtml(name)} (${escapeHtml(doctor.specialty || "General")})</option>`;
        })].join("")
        : '<option value="">No doctors available</option>';
}

function renderDoctorDirectory() {
    const container = document.getElementById("doctorDirectory");
    if (!container) return;

    if (!doctors.length) {
        container.innerHTML = "<p>No doctors found yet. Ask a doctor to register first.</p>";
        return;
    }

    container.innerHTML = doctors.map((doctor) => {
        const fullName = `${doctor.firstName} ${doctor.lastName}`;
        const availabilityDays = Array.isArray(doctor.availability?.days) ? doctor.availability.days : [];

        return `
            <article class="doctor-profile-card">
                <h4>Dr. ${escapeHtml(fullName)}</h4>
                <span class="pill-tag">${escapeHtml((doctor.specialty || "General").toUpperCase())}</span>
                <p class="days-title">Available Days:</p>
                <div class="day-pills">
                    ${availabilityDays.length ? availabilityDays.map((day) => `<span>${escapeHtml(day)}</span>`).join("") : "<span>Not set</span>"}
                </div>
                <p><strong>Contact:</strong> ${escapeHtml(doctor.phone || "N/A")}</p>
            </article>
        `;
    }).join("");
}

async function handleBookAppointment(event) {
    event.preventDefault();

    if (!currentUser || currentUser.role !== "patient") {
        alert("Please login as patient to book appointments.");
        return;
    }

    const doctorId = document.getElementById("bookDoctor").value;
    const date = document.getElementById("bookDate").value;
    const time = document.getElementById("bookTime").value;
    const reason = document.getElementById("bookReason").value.trim();

    if (!doctorId || !date || !time || !reason) {
        alert("Please fill all booking fields.");
        return;
    }

    try {
        await apiRequest("/appointments", {
            method: "POST",
            body: JSON.stringify({
                doctorId,
                date,
                time,
                reason
            })
        });

        alert("Appointment booked successfully.");
        document.getElementById("bookAppointmentForm").reset();
        renderDoctorOptions(document.getElementById("bookSpecialty").value);

        await Promise.all([loadDoctors(), loadPatientAppointments()]);
        switchTab("patient", "my");
    } catch (error) {
        alert(error.message);
    }
}

async function loadPatientAppointments() {
    if (!currentUser || currentUser.role !== "patient") return;

    try {
        const response = await apiRequest(`/appointments/patient/${currentUser.id}`);
        patientAppointments = response.appointments || [];
        renderPatientAppointments();
    } catch (error) {
        alert(error.message);
    }
}

function renderPatientAppointments() {
    const container = document.getElementById("patientAppointmentsList");
    if (!container) return;

    if (!patientAppointments.length) {
        container.innerHTML = "<p>No appointments booked yet.</p>";
        return;
    }

    container.innerHTML = patientAppointments.map((appointment) => {
        const doctorName = appointment.doctor
            ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
            : "Doctor";
        const statusClass = getStatusClass(appointment.status);

        return `
            <article class="appointment-card">
                <h4>${escapeHtml(doctorName)}</h4>
                <p><strong>Specialty:</strong> ${escapeHtml(appointment.specialty || "General")}</p>
                <p><strong>Date:</strong> ${escapeHtml(formatDate(appointment.date))}</p>
                <p><strong>Time:</strong> ${escapeHtml(appointment.time)}</p>
                <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${escapeHtml((appointment.status || "pending").toUpperCase())}</span></p>
                <p><strong>Reason:</strong> ${escapeHtml(appointment.reason || "-")}</p>
            </article>
        `;
    }).join("");
}

async function loadDoctorAppointments() {
    if (!currentUser || currentUser.role !== "doctor") return;

    try {
        const response = await apiRequest(`/appointments/doctor/${currentUser.id}`);
        doctorAppointments = response.appointments || [];
        renderDoctorAppointments();
    } catch (error) {
        alert(error.message);
    }
}

function renderDoctorAppointments() {
    const container = document.getElementById("doctorAppointmentsList");
    if (!container) return;

    if (!doctorAppointments.length) {
        container.innerHTML = "<p>No appointments assigned yet.</p>";
        return;
    }

    container.innerHTML = doctorAppointments.map((appointment) => {
        const patientName = appointment.patient
            ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
            : "Patient";
        const status = appointment.status || "pending";
        const statusClass = getStatusClass(status);

        const actions = status === "pending"
            ? `
                <div class="action-row">
                    <button type="button" class="approve-btn" onclick="updateAppointmentStatus('${appointment.id}', 'confirmed')">Approve</button>
                    <button type="button" class="reject-btn" onclick="updateAppointmentStatus('${appointment.id}', 'rejected')">Reject</button>
                </div>
            `
            : "";

        return `
            <article class="appointment-card">
                <h4>${escapeHtml(patientName)}</h4>
                <p><strong>Date:</strong> ${escapeHtml(formatDate(appointment.date))}</p>
                <p><strong>Time:</strong> ${escapeHtml(appointment.time)}</p>
                <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${escapeHtml(status.toUpperCase())}</span></p>
                <p><strong>Reason:</strong> ${escapeHtml(appointment.reason || "-")}</p>
                ${actions}
            </article>
        `;
    }).join("");
}

async function updateAppointmentStatus(appointmentId, status) {
    if (!currentUser || currentUser.role !== "doctor") {
        alert("Please login as doctor first.");
        return;
    }

    try {
        await apiRequest(`/appointments/${appointmentId}/status`, {
            method: "PATCH",
            body: JSON.stringify({
                status
            })
        });

        await loadDoctorAppointments();
    } catch (error) {
        alert(error.message);
    }
}

function hydrateAvailabilityForm() {
    if (!currentUser || currentUser.role !== "doctor") return;

    const selectedDays = new Set(currentUser.availability?.days || []);
    document.querySelectorAll(".availability-day").forEach((checkbox) => {
        checkbox.checked = selectedDays.has(checkbox.value);
    });

    const slots = currentUser.availability?.slots || [];
    document.getElementById("availabilitySlots").value = slots.join(", ");
}

async function handleSaveAvailability(event) {
    event.preventDefault();

    if (!currentUser || currentUser.role !== "doctor") {
        alert("Please login as doctor to save availability.");
        return;
    }

    const days = Array.from(document.querySelectorAll(".availability-day:checked")).map((input) => input.value);
    const slots = document.getElementById("availabilitySlots").value
        .split(",")
        .map((slot) => slot.trim())
        .filter(Boolean);

    try {
        const response = await apiRequest(`/doctors/${currentUser.id}/availability`, {
            method: "PATCH",
            body: JSON.stringify({ days, slots })
        });

        currentUser = response.doctor;
        alert("Availability saved.");
    } catch (error) {
        alert(error.message);
    }
}

function handleRoleChange() {
    const role = document.getElementById("regRole").value;
    const specialtyInput = document.getElementById("regSpecialty");

    if (role === "doctor") {
        specialtyInput.required = true;
        specialtyInput.placeholder = "Specialty (required for doctor)";
        return;
    }

    specialtyInput.required = false;
    specialtyInput.value = "";
    specialtyInput.placeholder = "Specialty (for doctor only)";
}

function setBookingMinDate() {
    const dateInput = document.getElementById("bookDate");
    if (!dateInput) return;

    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    dateInput.min = `${today.getFullYear()}-${month}-${day}`;
=======
    }
}

function setDemoStatus(button, status) {
    const card = button.closest(".appointment-card");
    const badge = card?.querySelector(".status-badge");
    const actions = card?.querySelector(".action-row");
    if (!badge || !actions) return;

    if (status === "confirmed") {
        badge.textContent = "CONFIRMED";
        badge.className = "status-badge status-confirmed";
        actions.remove();
    } else if (status === "rejected") {
        badge.textContent = "REJECTED";
        badge.className = "status-badge status-rejected";
        actions.remove();
    }
>>>>>>> 5ec7ce04015139f667da1aa11f24df21e004a1d6
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("registerForm")?.addEventListener("submit", handleRegister);
    document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
<<<<<<< HEAD
    document.getElementById("bookAppointmentForm")?.addEventListener("submit", handleBookAppointment);
    document.getElementById("doctorAvailabilityForm")?.addEventListener("submit", handleSaveAvailability);

    document.getElementById("regRole")?.addEventListener("change", handleRoleChange);
    document.getElementById("bookSpecialty")?.addEventListener("change", (event) => {
        renderDoctorOptions(event.target.value);
    });

    resetNavForLoggedOut();
    handleRoleChange();
    setBookingMinDate();
    restoreSessionIfPossible();
});

window.updateAppointmentStatus = updateAppointmentStatus;
=======
    document.getElementById("userMenu").classList.add("hidden");
    document.getElementById("loginBtn").classList.remove("hidden");
    document.getElementById("registerBtn").classList.remove("hidden");
});
>>>>>>> 5ec7ce04015139f667da1aa11f24df21e004a1d6
