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
    document.getElementById("loginBtn").classList.add("hidden");
    document.getElementById("registerBtn").classList.add("hidden");
    document.getElementById("userMenu").classList.remove("hidden");
}

function redirectToDashboard() {
    if (currentUser.role === "patient") {
        showPage("patientDashboard");
    } else {
        showPage("doctorDashboard");
    }
}

function logout() {
    currentUser = null;
    document.getElementById("userMenu").classList.add("hidden");
    document.getElementById("loginBtn").classList.remove("hidden");
    document.getElementById("registerBtn").classList.remove("hidden");
    showPage("homePage");
}

function switchTab(scope, tab) {
    if (scope === "patient") {
        const isBook = tab === "book";
        document.getElementById("patientBookTabBtn").classList.toggle("active", isBook);
        document.getElementById("patientMyTabBtn").classList.toggle("active", !isBook);
        document.getElementById("patientBookTab").classList.toggle("active", isBook);
        document.getElementById("patientMyTab").classList.toggle("active", !isBook);
    }

    if (scope === "doctor") {
        const isManage = tab === "manage";
        document.getElementById("doctorManageTabBtn").classList.toggle("active", isManage);
        document.getElementById("doctorAvailabilityTabBtn").classList.toggle("active", !isManage);
        document.getElementById("doctorManageTab").classList.toggle("active", isManage);
        document.getElementById("doctorAvailabilityTab").classList.toggle("active", !isManage);
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
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("registerForm")?.addEventListener("submit", handleRegister);
    document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
    document.getElementById("userMenu").classList.add("hidden");
    document.getElementById("loginBtn").classList.remove("hidden");
    document.getElementById("registerBtn").classList.remove("hidden");
});
