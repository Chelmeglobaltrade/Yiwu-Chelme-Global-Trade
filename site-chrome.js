/* ============================================================
   SITE CHROME — header/footer compartido para páginas internas
   (asesoría, viajes, cursos, cómo funciona, legales).
   No depende de script.js (que solo corre en index.html).
   ============================================================ */
(function () {
  "use strict";
  var CONFIG = window.CHELME_CONFIG || {};
  function $(id) { return document.getElementById(id); }

  if (CONFIG.business) {
    document.querySelectorAll("[data-whatsapp-message]").forEach(function (a) {
      var msg = a.dataset.whatsappMessage || "";
      a.href = "https://wa.me/" + CONFIG.business.whatsapp + "?text=" + encodeURIComponent(msg);
    });
    document.querySelectorAll("[data-instagram-link]").forEach(function (a) { a.href = CONFIG.business.instagram; });
    document.querySelectorAll("[data-tiktok-link]").forEach(function (a) { a.href = CONFIG.business.tiktok; });
    document.querySelectorAll("[data-email-link]").forEach(function (a) {
      a.href = "mailto:" + CONFIG.business.email;
      if (!a.textContent.trim()) a.textContent = CONFIG.business.email;
    });
    document.querySelectorAll("[data-business-city]").forEach(function (e) { e.textContent = CONFIG.business.city; });
  }



  var toggle = $("menuToggle"), nav = $("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () { nav.classList.toggle("open"); });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); });
    });
  }
  document.querySelectorAll(".nav-services").forEach(function (dd) {
    dd.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { dd.open = false; });
    });
    var closeTimer = null;
    dd.addEventListener("mouseenter", function () {
      if (window.innerWidth <= 850) return;
      clearTimeout(closeTimer);
      dd.open = true;
    });
    dd.addEventListener("mouseleave", function () {
      if (window.innerWidth <= 850) return;
      closeTimer = setTimeout(function () { dd.open = false; }, 150);
    });
  });
})();

/* Identificación legal de la empresa (Términos, Privacidad y pie de página), solo si está completa en config.js. */
(function () {
  var co = window.CHELME_CONFIG && CHELME_CONFIG.legal && CHELME_CONFIG.legal.company;
  var ok = co && co.legalName && co.rut;
  var text = ok ? co.legalName + " · RUT " + co.rut + (co.address ? " · " + co.address : "") : "";
  document.querySelectorAll("[data-legal-identity]").forEach(function (el) {
    if (ok) el.textContent = "Responsable: " + text; else el.hidden = true;
  });
  if (ok) {
    var foot = document.querySelector("footer .footer-grid > div");
    if (foot) { var p = document.createElement("p"); p.className = "footer-legal"; p.textContent = text; p.style.cssText = "font-size:.74rem;opacity:.75;margin-top:6px"; foot.appendChild(p); }
  }
})();

