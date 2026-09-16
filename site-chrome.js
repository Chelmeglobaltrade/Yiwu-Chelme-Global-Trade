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
