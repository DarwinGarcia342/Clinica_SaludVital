// app.js - Funcionalidades de la página principal

// Variables globales
let users = [];
let currentUser = null;

// Elementos del DOM
const navToggle = document.getElementById("nav-toggle");
const mainNav = document.getElementById("main-nav");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authMessage = document.getElementById("auth-message");
const authModal = document.getElementById("auth-modal");
const closeModal = document.getElementById("close-modal");
const loginLink = document.getElementById("login-link");
const dashboardLink = document.getElementById("dashboard-link");
const tabs = document.querySelectorAll(".tab-button");
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

// Cargar datos del almacenamiento local
const loadStorage = () => {
  users = JSON.parse(localStorage.getItem("saludvital_users") || "[]");
  const session = JSON.parse(localStorage.getItem("saludvital_session") || "null");
  currentUser = session ? users.find((user) => user.email === session.email) : null;
};

// Guardar datos en el almacenamiento local
const saveStorage = () => {
  localStorage.setItem("saludvital_users", JSON.stringify(users));
  localStorage.setItem("saludvital_session", JSON.stringify(currentUser ? { email: currentUser.email } : null));
};

// Mostrar mensajes de estado
const setStatus = (message, type = "info") => {
  authMessage.textContent = message;
  authMessage.style.color = type === "error" ? "#b91c1c" : "#0f766e";
};

// Actualizar visibilidad del enlace del dashboard
const updateDashboardLink = () => {
  if (dashboardLink) {
    if (currentUser) {
      dashboardLink.classList.remove("hidden");
    } else {
      dashboardLink.classList.add("hidden");
    }
  }
};

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  loadStorage();
  updateDashboardLink();
  setupEventListeners();
  observeSections();
});

// Configurar event listeners
function setupEventListeners() {
  // Navegación móvil
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      mainNav.classList.toggle("active");
    });
  }

  // Formulario de login
  if (loginForm) {
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
      updateDashboardLink();
      // Redirigir al dashboard
      window.location.href = 'dashboard.html';
    });
  }

  // Formulario de registro
  if (registerForm) {
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
      updateDashboardLink();
      // Redirigir al dashboard
      window.location.href = 'dashboard.html';
    });
  }

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

  // Formulario de contacto
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);

      // Simular envío
      formStatus.textContent = "Mensaje enviado exitosamente. Te contactaremos pronto.";
      formStatus.style.color = "#0f766e";
      contactForm.reset();

      setTimeout(() => {
        formStatus.textContent = "";
      }, 5000);
    });
  }

  // Scroll effects
  window.addEventListener("scroll", () => {
    document.querySelector(".site-header").classList.toggle("scrolled", window.scrollY > 20);
  });
}

// Observar secciones para animaciones
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