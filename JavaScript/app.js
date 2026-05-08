const navToggle = document.getElementById("nav-toggle");
const mainNav = document.getElementById("main-nav");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authMessage = document.getElementById("auth-message");
const authModal = document.getElementById("auth-modal");
const closeModal = document.getElementById("close-modal");
const loginLink = document.getElementById("login-link");
const tabs = document.querySelectorAll(".tab-button");
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

const DOCTORS = [
  { name: "Dra. Laura Gómez", specialty: "Medicina General" },
  { name: "Dr. Carlos Ríos", specialty: "Medicina Familiar" },
  { name: "Dra. Ana Torres", specialty: "Psicología" },
  { name: "Dr. Javier Suárez", specialty: "Diagnóstico" },
];

const TIME_SLOTS = ["09:00", "10:30", "13:00", "15:30", "17:00"];

let users = [];
let appointments = [];
let currentUser = null;
let editAppointmentId = null;

const loadStorage = () => {
  users = JSON.parse(localStorage.getItem("saludvital_users") || "[]");
  appointments = JSON.parse(localStorage.getItem("saludvital_appointments") || "[]");
  const session = JSON.parse(localStorage.getItem("saludvital_session") || "null");
  currentUser = session ? users.find((user) => user.email === session.email) : null;
};

const saveStorage = () => {
  localStorage.setItem("saludvital_users", JSON.stringify(users));
  localStorage.setItem("saludvital_appointments", JSON.stringify(appointments));
  localStorage.setItem("saludvital_session", JSON.stringify(currentUser ? { email: currentUser.email } : null));
};

const setStatus = (message, type = "info") => {
  authMessage.textContent = message;
  authMessage.style.color = type === "error" ? "#b91c1c" : "#0f766e";
};

const renderDoctorOptions = () => {
  const doctorSelects = [
    document.getElementById("availability-doctor"),
    document.getElementById("appointment-doctor"),
  ];
  doctorSelects.forEach((select) => {
    select.innerHTML = DOCTORS.map(
      (doctor) => `<option value="${doctor.name}">${doctor.name} — ${doctor.specialty}</option>`
    ).join("");
  });
};

const updateHeader = () => {
  if (currentUser) {
    statusMessage.textContent = "Has iniciado sesión correctamente.";
    userEmailBadge.textContent = currentUser.email;
    userEmailBadge.classList.remove("hidden");
    userStatusBadge.classList.remove("hidden");
    logoutButton.classList.remove("hidden");
  } else {
    statusMessage.textContent = "Inicia sesión para agendar y ver tus citas médicas.";
    userEmailBadge.classList.add("hidden");
    userStatusBadge.classList.add("hidden");
    logoutButton.classList.add("hidden");
  }
  renderAppointments();
};

const showAppointments = () => {
  if (!currentUser) {
    appointmentsList.innerHTML = "<p>Necesitas iniciar sesión para ver tus citas.</p>";
    return;
  }

  const userAppointments = appointments
    .filter((appointment) => appointment.userEmail === currentUser.email)
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

  if (userAppointments.length === 0) {
    appointmentsList.innerHTML = "<p>No tienes citas agendadas aún.</p>";
    return;
  }

  appointmentsList.innerHTML = userAppointments
    .map((appointment) => {
      const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
      return `
        <article class="appointment-card">
          <div>
            <strong>${appointment.service}</strong>
            <p>${appointment.doctor}</p>
          </div>
          <div class="appointment-meta">
            <span class="appointment-pill">${appointment.date}</span>
            <span class="appointment-pill">${appointment.time}</span>
            <span class="appointment-pill">${appointment.status}</span>
          </div>
          <p>${appointmentDate.toLocaleString()}</p>
          <div class="appointment-actions">
            <button class="button outline-button" type="button" onclick="rescheduleAppointment('${appointment.id}')">Reprogramar</button>
            <button class="button outline-button" type="button" onclick="cancelAppointment('${appointment.id}')">Cancelar</button>
          </div>
        </article>
      `;
    })
    .join("");
};

window.renderAppointments = showAppointments;

const getAvailableTimes = (doctor, date) => {
  const selectedDate = new Date(date);
  if (isNaN(selectedDate)) return [];
  const day = selectedDate.getDay();
  if (day === 0 || day === 6) return [];

  const bookedTimes = appointments
    .filter((appointment) => appointment.doctor === doctor && appointment.date === date)
    .map((appointment) => appointment.time);

  return TIME_SLOTS.filter((slot) => !bookedTimes.includes(slot));
};

const renderAvailability = (doctor, date) => {
  const availableTimes = getAvailableTimes(doctor, date);
  if (!doctor || !date) {
    availabilityResult.textContent = "Selecciona doctor y fecha para ver disponibilidad.";
    return;
  }
  if (availableTimes.length === 0) {
    const selectedDate = new Date(date);
    const dayName = selectedDate.toLocaleDateString("es-CO", { weekday: "long" });
    availabilityResult.innerHTML = `No hay turnos disponibles el ${dayName}. Elige otra fecha.`;
    return;
  }
  availabilityResult.innerHTML = `Turnos disponibles:<br><strong>${availableTimes.join(" · ")}</strong>`;
};

const validateAppointment = (service, doctor, date, time) => {
  if (!currentUser) {
    setStatus("Debes iniciar sesión antes de agendar una cita.", "error");
    return false;
  }
  const selectedDate = new Date(`${date}T${time}`);
  if (selectedDate < new Date()) {
    setStatus("La fecha y hora deben ser futuras.", "error");
    return false;
  }
  const freeTimes = getAvailableTimes(doctor, date);
  if (!freeTimes.includes(time) && (!editAppointmentId || !appointments.some((appt) => appt.id === editAppointmentId && appt.time === time && appt.date === date))) {
    setStatus("Este turno ya está ocupado. Elige otro horario.", "error");
    return false;
  }
  return true;
};

const displayReminder = (message) => {
  const item = document.createElement("div");
  item.className = "reminder-item";
  item.textContent = message;
  reminderLog.prepend(item);
};

const checkReminders = () => {
  const now = Date.now();
  appointments.forEach((appointment) => {
    if (appointment.reminderSent) return;
    const target = new Date(`${appointment.date}T${appointment.time}:00`).getTime();
    const diff = target - now;
    if (diff <= 10 * 60 * 1000 && diff > 0) {
      appointment.reminderSent = true;
      saveStorage();
      displayReminder(`Recordatorio enviado a ${appointment.userEmail} para cita con ${appointment.doctor} el ${appointment.date} a las ${appointment.time}.`);
    }
  });
};

const scheduleAppointment = (event) => {
  event.preventDefault();
  const service = document.getElementById("appointment-service").value;
  const doctor = document.getElementById("appointment-doctor").value;
  const date = document.getElementById("appointment-date").value;
  const time = document.getElementById("appointment-time").value;

  if (!validateAppointment(service, doctor, date, time)) return;

  if (editAppointmentId) {
    const existing = appointments.find((appt) => appt.id === editAppointmentId);
    if (existing) {
      existing.service = service;
      existing.doctor = doctor;
      existing.date = date;
      existing.time = time;
      existing.status = "Reprogramada";
      existing.reminderSent = false;
      setStatus("Cita reprogramada correctamente.");
    }
    editAppointmentId = null;
  } else {
    appointments.push({
      id: `appt-${Date.now()}`,
      userEmail: currentUser.email,
      service,
      doctor,
      date,
      time,
      status: "Confirmada",
      reminderSent: false,
    });
    setStatus("Cita agendada con éxito. En breve recibirás recordatorio en tu correo.");
  }

  saveStorage();
  renderAvailability(doctor, date);
  showAppointments();
  appointmentForm.reset();
};

const cancelAppointment = (id) => {
  const appointment = appointments.find((appt) => appt.id === id);
  if (!appointment) return;
  appointment.status = "Cancelada";
  saveStorage();
  showAppointments();
  displayReminder(`Cita cancelada: ${appointment.service} con ${appointment.doctor} el ${appointment.date} a las ${appointment.time}.`);
};

window.cancelAppointment = cancelAppointment;

const rescheduleAppointment = (id) => {
  const appointment = appointments.find((appt) => appt.id === id);
  if (!appointment) return;
  document.getElementById("appointment-service").value = appointment.service;
  document.getElementById("appointment-doctor").value = appointment.doctor;
  document.getElementById("appointment-date").value = appointment.date;
  document.getElementById("appointment-time").value = appointment.time;
  editAppointmentId = id;
  setStatus("Edita la fecha y hora en el formulario para reprogramar esta cita.");
};

window.rescheduleAppointment = rescheduleAppointment;

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");

    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.toggle("active", content.id === tab.dataset.tab);
    });
  });
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("login-email").value.trim().toLowerCase();
  const password = document.getElementById("login-password").value.trim();

  const user = users.find((item) => item.email === email && item.password === password);
  if (!user) {
    setStatus("Credenciales incorrectas. Revisa tu correo y contraseña.", "error");
    return;
  }
  currentUser = user;
  saveStorage();
  setStatus("Inicio de sesión exitoso.");
  // Redirigir al dashboard
  window.location.href = 'dashboard.html';
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim().toLowerCase();
  const password = document.getElementById("register-password").value.trim();

  if (password.length < 6) {
    setStatus("La contraseña debe tener al menos 6 caracteres.", "error");
    return;
  }
  if (users.some((user) => user.email === email)) {
    setStatus("El correo ya está registrado. Usa otro o inicia sesión.", "error");
    return;
  }

  users.push({ name, email, password });
  currentUser = { name, email, password };
  saveStorage();
  setStatus("Registro completo. Has iniciado sesión automáticamente.");
  // Redirigir al dashboard
  window.location.href = 'dashboard.html';
});

availabilityForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const doctor = document.getElementById("availability-doctor").value;
  const date = document.getElementById("availability-date").value;
  renderAvailability(doctor, date);
});

appointmentForm.addEventListener("submit", scheduleAppointment);

logoutButton.addEventListener("click", () => {
  currentUser = null;
  saveStorage();
  setStatus("Has cerrado sesión.");
  updateHeader();
  showAppointments();
});

// Modal handlers
if (loginLink) {
  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    authModal.classList.remove("hidden");
  });
}

if (closeModal) {
  closeModal.addEventListener("click", () => {
    authModal.classList.add("hidden");
  });
}

if (authModal) {
  authModal.addEventListener("click", (e) => {
    if (e.target === authModal) {
      authModal.classList.add("hidden");
    }
  });
}

// Tab switching
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetTab = tab.getAttribute("data-tab");
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });
    document.querySelectorAll(".tab-button").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.getElementById(targetTab).classList.add("active");
    tab.classList.add("active");
  });
});

navToggle.addEventListener("click", () => {
  const expanded = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!expanded));
  mainNav.classList.toggle("active");
});

window.addEventListener("scroll", () => {
  document.querySelector(".site-header").classList.toggle("scrolled", window.scrollY > 20);
});

const observeSections = () => {
  const sections = document.querySelectorAll(".fade-up");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.2 }
  );
  sections.forEach((section) => observer.observe(section));
};

const init = () => {
  loadStorage();
  renderDoctorOptions();
  updateHeader();
  observeSections();
  checkReminders();
  setInterval(checkReminders, 60 * 1000);
};

init();

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !email || !message) {
    formStatus.textContent = "Por favor completa todos los campos antes de enviar.";
    formStatus.style.color = "#b91c1c";
    return;
  }

  formStatus.textContent = "Muchas gracias, tu mensaje ha sido enviado. Pronto nos comunicaremos contigo.";
  formStatus.style.color = "#0f766e";
  contactForm.reset();
});
