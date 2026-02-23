// -------------------- SEGURIDAD: CONSTANTES Y VARIABLES --------------------
const PIN_CORRECTO = "5703";
const STORAGE_KEY_AUTH = "pinAccesoAutorizado";

// Referencias al nuevo modal de PIN
let pinModal, pinInput, pinSubmitBtn;

// Verifica si el usuario ya tiene permiso guardado
function accesoPermitido() {
  return localStorage.getItem(STORAGE_KEY_AUTH) === "true";
}

// Función para quitar la capa de bloqueo visualmente
function desbloquearVisualmente() {
    const lockOverlay = document.getElementById("lock-overlay");
    if (lockOverlay) lockOverlay.classList.add("unlocked");
    // Aseguramos que el modal se cierre si estaba abierto
    if (pinModal) pinModal.classList.remove("active");
    console.log("Sesión desbloqueada.");
}

// Muestra el modal personalizado en lugar de prompt()
function solicitarPin() {
    if (pinModal && pinInput) {
        pinInput.value = ""; // Limpiar input anterior
        pinModal.classList.add("active"); // Mostrar modal
        setTimeout(() => pinInput.focus(), 100); // Poner el foco en el input
    }
}

// Verifica el PIN introducido en el input
function verificarPin() {
    const pinIngresado = pinInput.value;
    if (pinIngresado === PIN_CORRECTO) {
        // PIN Correcto
        localStorage.setItem(STORAGE_KEY_AUTH, "true");
        desbloquearVisualmente();
    } else {
        // PIN Incorrecto
        alert("⛔ PIN incorrecto. Intenta de nuevo.");
        pinInput.value = ""; // Limpiar input
        pinInput.focus();
    }
}

// -------------------- SEGURIDAD BÁSICA --------------------
document.addEventListener("contextmenu", (e) => e.preventDefault());
document.onkeydown = (e) => {
  if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || (e.ctrlKey && e.keyCode === 85)) return false;
};

// -------------------- CHAT D-ID (AVATAR) --------------------
class DIDChat {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.chatUrl = "https://studio.d-id.com/agents/share?id=v2_agt_Iv25Rfvb&utm_source=copy&key=WjI5dloyeGxMVzloZFhSb01ud3hNVEkzT1RreU9EVXdOVGMwTnpNMk9EZzBORE02YjNWQmRsVkJaMFJsWTI5dmRuSTBiV2RxTjAxcg==";
    this.iframe = null;
    this.init();
  }
  init() { if (this.container) this.createIframe(); }
  // ... dentro de la clase DIDChat ...
createIframe() {
    const wrapper = document.createElement("div"); wrapper.className = "iframe-wrapper";
    this.iframe = document.createElement("iframe");
    this.iframe.className = "did-chat-iframe fade-in";
    this.iframe.src = this.chatUrl;

    // ✅ SOLUCIÓN MICROFONO: Se añade 'microphone *;' a los permisos del iframe
    this.iframe.allow = "microphone *; autoplay *; encrypted-media *; fullscreen *; display-capture *;";

    this.iframe.title = "Avatar Interface";
    wrapper.appendChild(this.iframe);
    this.container.appendChild(wrapper);
}
}

// ==================================================================
// 🔥 INICIALIZACIÓN Y LÓGICA PRINCIPAL 🔥
// ==================================================================
document.addEventListener("DOMContentLoaded", () => {

  // 1. Obtener referencias
  const lockOverlay = document.getElementById("lock-overlay");
  const lockBtn = document.getElementById("lock-btn");
  const refreshBtn = document.getElementById("refresh-btn");
  // Referencias del modal de PIN
  pinModal = document.getElementById("pin-modal");
  pinInput = document.getElementById("pin-input");
  pinSubmitBtn = document.getElementById("pin-submit-btn");

  // 2. Lógica de Seguridad Inicial
  if (accesoPermitido()) {
      desbloquearVisualmente();
  } else {
      if (lockOverlay) lockOverlay.addEventListener("click", solicitarPin);
  }

  // Listeners para el modal de PIN
  if (pinSubmitBtn && pinInput) {
      pinSubmitBtn.addEventListener("click", verificarPin);
      pinInput.addEventListener("keypress", (e) => {
          if (e.key === "Enter") verificarPin();
      });
  }

  // ✅ 3. Botones de Control (Bloquear y Refrescar) ACTUALIZADOS ✅

  // Botón del Candado: Bloquea la sesión
  if (lockBtn) {
      lockBtn.addEventListener("click", () => {
          if (confirm("¿Deseas bloquear la sesión actual?")) {
              localStorage.removeItem(STORAGE_KEY_AUTH); // BORRA el permiso
              location.reload(); // Recarga y bloquea
          }
      });
  }

  // Botón de Refrescar: Limpia caché PERO MANTIENE la sesión
  if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
          // ✅ CAMBIO AQUÍ: Ya no borramos el STORAGE_KEY_AUTH
          // localStorage.removeItem(STORAGE_KEY_AUTH); <- Línea eliminada

          // 'true' fuerza una recarga desde el servidor (limpia caché de assets)
          // pero el localStorage se mantiene intacto.
          location.reload(true);
      });
  }

  // 5. Inicializar el resto de la aplicación
  new DIDChat("chat-container");
  gsap.to(".first", 1, { delay: 0.2, top: "-100%", ease: Expo.easeInOut });
  gsap.to(".second", 1, { delay: 0.4, top: "-100%", ease: Expo.easeInOut });
  gsap.to(".third", 1, { delay: 0.6, top: "-100%", ease: Expo.easeInOut });
  gsap.from(".home-information", { opacity: 0, duration: 1.5, delay: 1, y: 30 });
  gsap.from(".anime-text", { opacity: 0, duration: 1.5, delay: 1.2, y: 30, stagger: 0.2 });
  gsap.from("#chat-container", { opacity: 0, duration: 1.5, delay: 1.5, y: 50, ease: "power3.out" });
  gsap.from(".control-buttons", { opacity: 0, duration: 1, delay: 2, x: 50, ease: "power3.out" });

  // El auto-refresco por inactividad SÍ debe bloquear la sesión por seguridad
  let inactivityTimeout;
  function resetInactivityTimer() {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
          // Si es por inactividad, borramos el permiso para que pida PIN al volver
          localStorage.removeItem(STORAGE_KEY_AUTH);
          location.reload();
      }, 5 * 60 * 1000); // 5 minutos
  }
  if (accesoPermitido()) {
     ['click', 'touchstart', 'mousemove', 'keydown'].forEach(evt => document.addEventListener(evt, resetInactivityTimer, { passive: true }));
     resetInactivityTimer();
  }
});


/* ==================================================================
   LÓGICA DE LA INTERFAZ MINIMALISTA (Menú y Video)
   ================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('interaction-overlay');
    const btnShowAvatar = document.getElementById('btn-show-avatar');
    const btnPlayVideo = document.getElementById('btn-play-video');
    const videoElement = document.getElementById('playback-video');

    if (!overlay || !btnShowAvatar || !btnPlayVideo || !videoElement) return;
    const VIDEO_URL = "https://www.dropbox.com/scl/fi/ff0ec6i5q92dp3qoepz6d/Foto-espacial.mp4?rlkey=0if4aqvw00pxt5o4q83ua45p1&st=ziy6a2km&raw=1";
    videoElement.src = VIDEO_URL;

    function showOverlay() {
        videoElement.pause(); videoElement.currentTime = 0;
        videoElement.classList.add('video-hidden'); overlay.classList.remove('overlay-hidden');
    }
    videoElement.addEventListener('ended', showOverlay);
    btnShowAvatar.addEventListener('click', () => { overlay.classList.add('overlay-hidden'); });
    btnPlayVideo.addEventListener('click', () => {
        overlay.classList.add('overlay-hidden'); videoElement.classList.remove('video-hidden');
        setTimeout(() => { videoElement.play().catch(e => console.warn("Autoplay bloqueado:", e)); }, 300);
    });
});