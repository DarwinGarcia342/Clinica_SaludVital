// dashboard.js - Funcionalidades del panel de usuario

// Variables globales
let currentUser = null;
let appointments = [];
let doctors = [
{ id: 1, name: 'Dr. Ana García', specialty: 'Medicina General' },
{ id: 2, name: 'Dr. Carlos López', specialty: 'Medicina Familiar' },
{ id: 3, name: 'Dra. María Rodríguez', specialty: 'Psicología' },
{ id: 4, name: 'Dr. Juan Pérez', specialty: 'Diagnóstico' }
];

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', function() {
loadCurrentUser();
loadAppointments();
populateDoctorSelects();
setupEventListeners();
checkReminders();
});

// Cargar usuario actual
function loadCurrentUser() {
const userData = localStorage.getItem('currentUser');
if (!userData) {
    window.location.href = 'Index.html';
    return;
}

currentUser = JSON.parse(userData);
document.getElementById('user-name').textContent = currentUser.name;
document.getElementById('user-email-badge').textContent = currentUser.email;
}

// Cargar citas
function loadAppointments() {
const stored = localStorage.getItem('appointments');
if (stored) {
    appointments = JSON.parse(stored);
}
renderAppointments();
}

// Poblar selects de doctores
function populateDoctorSelects() {
const selects = document.querySelectorAll('#appointment-doctor, #availability-doctor');
selects.forEach(select => {
    select.innerHTML = '<option value="">Selecciona un especialista</option>';
    doctors.forEach(doctor => {
    const option = document.createElement('option');
    option.value = doctor.id;
    option.textContent = `${doctor.name} - ${doctor.specialty}`;
    select.appendChild(option);
    });
});
}

// Configurar event listeners
function setupEventListeners() {
  // Formulario de disponibilidad
document.getElementById('availability-form').addEventListener('submit', checkAvailability);

  // Formulario de cita
document.getElementById('appointment-form').addEventListener('submit', bookAppointment);

  // Logout
document.getElementById('logout-button').addEventListener('click', logout);
}

// Verificar disponibilidad
function checkAvailability(e) {
e.preventDefault();

const doctorId = parseInt(document.getElementById('availability-doctor').value);
const date = document.getElementById('availability-date').value;

if (!doctorId || !date) {
    showAvailabilityResult('Por favor, selecciona un especialista y una fecha.', 'error');
    return;
}

const doctor = doctors.find(d => d.id === doctorId);
const existingAppointments = appointments.filter(apt =>
    apt.doctorId === doctorId && apt.date === date && apt.status !== 'cancelled'
);

const availableSlots = generateTimeSlots().filter(slot =>
    !existingAppointments.some(apt => apt.time === slot)
);

if (availableSlots.length === 0) {
    showAvailabilityResult(`No hay disponibilidad para ${doctor.name} el ${formatDate(date)}.`, 'error');
} else {
    showAvailabilityResult(`Horarios disponibles para ${doctor.name} el ${formatDate(date)}: ${availableSlots.join(', ')}`, 'success');
}
}

// Mostrar resultado de disponibilidad
function showAvailabilityResult(message, type) {
const resultDiv = document.getElementById('availability-result');
resultDiv.textContent = message;
resultDiv.className = `availability-result ${type}`;
}

// Agendar cita
function bookAppointment(e) {
e.preventDefault();

const service = document.getElementById('appointment-service').value;
const doctorId = parseInt(document.getElementById('appointment-doctor').value);
const date = document.getElementById('appointment-date').value;
const time = document.getElementById('appointment-time').value;

if (!service || !doctorId || !date || !time) {
    alert('Por favor, completa todos los campos.');
    return;
}

  // Verificar si ya existe una cita en esa fecha y hora
const conflict = appointments.find(apt =>
    apt.doctorId === doctorId && apt.date === date && apt.time === time && apt.status !== 'cancelled'
);

if (conflict) {
    alert('Ese horario ya está ocupado. Por favor, elige otro.');
    return;
}

const doctor = doctors.find(d => d.id === doctorId);
const newAppointment = {
    id: Date.now(),
    userId: currentUser.id,
    service,
    doctorId,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    date,
    time,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    reminderSent: false
};

appointments.push(newAppointment);
saveAppointments();
renderAppointments();

  // Limpiar formulario
e.target.reset();

alert('Cita agendada exitosamente. Recibirás un recordatorio por correo antes de la cita.');
}

// Renderizar citas
function renderAppointments() {
const list = document.getElementById('appointments-list');
const userAppointments = appointments.filter(apt => apt.userId === currentUser.id);

if (userAppointments.length === 0) {
    list.innerHTML = '<p>No tienes citas agendadas.</p>';
    return;
}

list.innerHTML = userAppointments.map(apt => `
    <div class="appointment-card ${apt.status}">
    <div class="appointment-info">
        <h4>${apt.service}</h4>
        <p><strong>Especialista:</strong> ${apt.doctorName} (${apt.specialty})</p>
        <p><strong>Fecha:</strong> ${formatDate(apt.date)} a las ${apt.time}</p>
        <p><strong>Estado:</strong> <span class="status-${apt.status}">${getStatusText(apt.status)}</span></p>
    </div>
    <div class="appointment-actions">
        ${apt.status === 'confirmed' ? `
        <button onclick="rescheduleAppointment(${apt.id})" class="button secondary-button">Reprogramar</button>
        <button onclick="cancelAppointment(${apt.id})" class="button danger-button">Cancelar</button>
        ` : ''}
    </div>
    </div>
`).join('');
}

// Cancelar cita
function cancelAppointment(id) {
if (confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
    const appointment = appointments.find(apt => apt.id === id);
    if (appointment) {
    appointment.status = 'cancelled';
    saveAppointments();
    renderAppointments();
    alert('Cita cancelada exitosamente.');
    }
}
}

// Reprogramar cita
function rescheduleAppointment(id) {
const appointment = appointments.find(apt => apt.id === id);
if (!appointment) return;

const newDate = prompt('Nueva fecha (YYYY-MM-DD):', appointment.date);
const newTime = prompt('Nueva hora (HH:MM):', appointment.time);

if (!newDate || !newTime) return;

  // Verificar conflicto
const conflict = appointments.find(apt =>
    apt.id !== id &&
    apt.doctorId === appointment.doctorId &&
    apt.date === newDate &&
    apt.time === newTime &&
    apt.status !== 'cancelled'
);

if (conflict) {
    alert('Ese horario ya está ocupado.');
    return;
}

appointment.date = newDate;
appointment.time = newTime;
saveAppointments();
renderAppointments();
alert('Cita reprogramada exitosamente.');
}

// Verificar recordatorios
function checkReminders() {
const now = new Date();
  const reminderThreshold = 24 * 60 * 60 * 1000; // 24 horas en ms

appointments.forEach(apt => {
    if (apt.userId === currentUser.id && apt.status === 'confirmed' && !apt.reminderSent) {
    const appointmentTime = new Date(`${apt.date}T${apt.time}`);
    const timeDiff = appointmentTime - now;

    if (timeDiff > 0 && timeDiff <= reminderThreshold) {
        sendReminder(apt);
        apt.reminderSent = true;
        saveAppointments();
    }
    }
});

renderReminders();
}

// Enviar recordatorio (simulado)
function sendReminder(appointment) {
const reminder = {
    id: Date.now(),
    appointmentId: appointment.id,
    message: `Recordatorio: Tienes una cita de ${appointment.service} con ${appointment.doctorName} el ${formatDate(appointment.date)} a las ${appointment.time}`,
    sentAt: new Date().toISOString()
};

let reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
reminders.push(reminder);
localStorage.setItem('reminders', JSON.stringify(reminders));
}

// Renderizar recordatorios
function renderReminders() {
const log = document.getElementById('reminder-log');
const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
const userReminders = reminders.filter(r => {
    const apt = appointments.find(a => a.id === r.appointmentId);
    return apt && apt.userId === currentUser.id;
});

if (userReminders.length === 0) {
    log.innerHTML = '<p>No hay recordatorios enviados.</p>';
    return;
}

log.innerHTML = userReminders.map(r => `
    <div class="reminder-item">
    <p>${r.message}</p>
    <small>Enviado el ${new Date(r.sentAt).toLocaleString()}</small>
    </div>
`).join('');
}

// Logout
function logout() {
localStorage.removeItem('currentUser');
window.location.href = 'Index.html';
}

// Funciones auxiliares
function generateTimeSlots() {
const slots = [];
for (let hour = 8; hour <= 17; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 17) slots.push(`${hour.toString().padStart(2, '0')}:30`);
}
return slots;
}

function formatDate(dateString) {
const date = new Date(dateString);
return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});
}

function getStatusText(status) {
const statusMap = {
    confirmed: 'Confirmada',
    cancelled: 'Cancelada'
};
return statusMap[status] || status;
}

function saveAppointments() {
localStorage.setItem('appointments', JSON.stringify(appointments));
}
