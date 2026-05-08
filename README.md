# SaludVital

Sitio web para una clínica de salud llamada **SaludVital**. El proyecto usa HTML, CSS y JavaScript en archivos separados, además de imágenes SVG ubicadas en la carpeta `images`.

## Estructura

- `Html/Index.html` — página principal de la clínica con información general.
- `Html/dashboard.html` — panel de usuario para gestión de citas.
- `Css/styles.css` — estilos visuales y diseño responsivo.
- `JavaScript/app.js` — comportamiento interactivo de la página principal.
- `JavaScript/dashboard.js` — funcionalidades del panel de usuario.
- `images/` — recursos gráficos usados por las páginas.

## Cómo usar

1. Abre `Html/Index.html` en el navegador.
2. Haz clic en "Iniciar sesión / Registrarse" para acceder al sistema.
3. Regístrate con tu nombre, email y contraseña, o inicia sesión si ya tienes cuenta.
4. Serás redirigido automáticamente al panel de usuario (`dashboard.html`).
5. Una vez logueado, verás el enlace "Mi Panel" en la navegación de cualquier página para volver rápidamente al dashboard.
6. En el panel puedes:
   - Consultar disponibilidad médica por especialista y fecha.
   - Agendar nuevas citas seleccionando servicio, especialista, fecha y hora.
   - Ver todas tus citas agendadas.
   - Cancelar o reprogramar citas existentes.
   - Revisar el historial de recordatorios enviados.

## Características

- **Página Principal**: Información general de la clínica, servicios, equipo médico y contacto.
- **Sistema de Autenticación**: Registro e inicio de sesión con validación.
- **Panel de Usuario**: Interfaz dedicada para gestión completa de citas.
- **Agenda de Citas**: Sistema completo de agendamiento médico en línea.
- **Consulta de Disponibilidad**: Ver horarios disponibles por especialista y fecha.
- **Gestión de Citas**: Cancelación y reprogramación con validaciones de conflicto.
- **Recordatorios Automáticos**: Simulación de envío de recordatorios por correo 24 horas antes.
- **Navegación Inteligente**: Enlace "Mi Panel" visible cuando estás logueado.
- **Persistencia de Datos**: Almacenamiento persistente de usuarios, citas y recordatorios.
- **Diseño Responsivo**: Adaptable a móviles y tablets.
- **Animaciones**: Transiciones suaves y efectos visuales profesionales.

## Tecnologías

- **HTML5**: Estructura semántica de las páginas.
- **CSS3**: Diseño moderno con Flexbox, Grid y animaciones.
- **JavaScript ES6+**: Lógica de negocio, manipulación del DOM y localStorage.
- **localStorage**: Almacenamiento persistente de usuarios, citas y recordatorios.

## Navegación

- La página principal (`Index.html`) contiene toda la información de la clínica.
- El acceso al sistema de citas se hace mediante un modal de autenticación.
- Después del login/registro, se redirige al panel de usuario (`dashboard.html`).
- Desde cualquier página, los usuarios logueados ven un enlace "Mi Panel" para acceder rápidamente.
- Desde el panel se puede cerrar sesión y volver a la página principal.
