/* ============================================================
   PORTADA INTERACTIVA — ruta animada de la carga y contenedor que
   se llena en la calculadora. Solo index.html. Respeta
   prefers-reduced-motion y deja todo visible si el JS no corre.
   ============================================================ */
(function () {
  "use strict";
  var CONFIG = window.CHELME_CONFIG || {};
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Ruta de la carga ---------- */
  var STOPS = [
    { when: "7 a 25 días según producto", title: "Tu proveedor prepara el pedido", text: "Tu proveedor fabrica o prepara tu compra. Si todavía no tienes proveedor, lo buscamos y negociamos por ti." },
    { when: "Al llegar a bodega", title: "Recibimos y revisamos en Yiwu", text: "Contamos los bultos, revisamos el embalaje, tomamos fotos, medimos y pesamos. Nada sale sin revisar." },
    { when: "En la fecha de carga confirmada", title: "Consolidación y zarpe desde Ningbo", text: "Tu carga se ordena en el contenedor junto a la de otros importadores y zarpa en la salida programada." },
    { when: "30 a 45 días de navegación", title: "Tu carga cruza el Pacífico", text: "Mientras navega, sigues el estado de tu pedido desde tu cuenta en la página." },
    { when: "Antes y al llegar", title: "Aduana en San Antonio", text: "Pagas IVA y arancel antes de la llegada y nuestro agente de aduana desaduana tu carga." },
    { when: "Lista para retirar", title: "Tu carga en Santiago", text: "Retiras en nuestra bodega de Santiago o te cotizamos el envío a regiones." }
  ];
  var route = document.getElementById("rdRoute");
  if (route) {
    var path = document.getElementById("rdRoutePath");
    var progress = document.getElementById("rdRouteProgress");
    var ship = document.getElementById("rdShip");
    var total = path.getTotalLength();
    var stopEls = route.querySelectorAll(".rd-stop");
    var tabEls = route.querySelectorAll(".rd-route-stops button");
    // Largo del recorrido en el que cae cada parada.
    var stopLen = Array.prototype.map.call(stopEls, function (g) {
      var m = /translate\(([\d.]+)[ ,]+([\d.]+)\)/.exec(g.getAttribute("transform"));
      var x = +m[1], y = +m[2], best = 0, bestD = Infinity;
      for (var l = 0; l <= total; l += 2) {
        var p = path.getPointAtLength(l), d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y);
        if (d < bestD) { bestD = d; best = l; }
      }
      return best;
    });
    progress.style.strokeDasharray = total;
    var current = total, active = -1, anim = null, userPicked = false;

    function placeShip(len) {
      current = len;
      var p = path.getPointAtLength(len), q = path.getPointAtLength(Math.min(total, len + 1));
      var ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
      ang = Math.max(-18, Math.min(18, ang));
      ship.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ") rotate(" + ang.toFixed(1) + ")");
      progress.style.strokeDashoffset = total - len;
      stopEls.forEach(function (g, i) { g.classList.toggle("is-reached", stopLen[i] <= len + 1); });
    }
    function show(i) {
      if (i === active) return;
      active = i;
      var s = STOPS[i];
      document.getElementById("rdRouteWhen").textContent = s.when;
      document.getElementById("rdRouteTitle").textContent = s.title;
      document.getElementById("rdRouteText").textContent = s.text;
      var card = document.getElementById("rdRouteCard");
      card.classList.remove("is-swap"); void card.offsetWidth; card.classList.add("is-swap");
      stopEls.forEach(function (g, k) { g.classList.toggle("is-active", k === i); });
      tabEls.forEach(function (b, k) { b.classList.toggle("is-active", k === i); b.setAttribute("aria-selected", k === i ? "true" : "false"); });
    }
    function travel(to, ms, follow) {
      if (anim) cancelAnimationFrame(anim);
      if (reduced || ms <= 0) { placeShip(to); return; }
      var from = current, t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var k = Math.min(1, (ts - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        var len = from + (to - from) * e;
        placeShip(len);
        if (follow) {
          var idx = 0; stopLen.forEach(function (sl, i) { if (sl <= len + 1) idx = i; });
          show(idx);
        }
        if (k < 1) anim = requestAnimationFrame(step);
      }
      anim = requestAnimationFrame(step);
    }
    function pick(i) {
      userPicked = true;
      show(i);
      travel(stopLen[i], Math.min(1600, 250 + Math.abs(stopLen[i] - current) * 1.6), false);
    }
    stopEls.forEach(function (g, i) {
      g.setAttribute("tabindex", "0"); g.setAttribute("role", "button"); g.setAttribute("aria-label", STOPS[i].title);
      g.addEventListener("click", function () { pick(i); });
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(i); } });
    });
    tabEls.forEach(function (b, i) { b.addEventListener("click", function () { pick(i); }); });

    // Estado de reposo: todo el recorrido visible y la primera parada explicada.
    placeShip(total); show(0);
    if (!reduced && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting || userPicked) return;
          io.disconnect();
          placeShip(0); show(0);
          setTimeout(function () { if (!userPicked) travel(total, 7000, true); }, 350);
        });
      }, { threshold: .45 });
      io.observe(route);
    }
  }

  /* ---------- Contenedor que se llena en la calculadora ---------- */
  var fill = document.getElementById("miniFill");
  if (fill && CONFIG.fcl) {
    var bar = document.getElementById("miniFillBar"), pct = document.getElementById("miniFillPct");
    var label = document.getElementById("miniFillLabel"), note = document.getElementById("miniFillNote");
    var caps = CONFIG.fcl.capacityCbm || {};
    var fmt = function (n, d) { return new Intl.NumberFormat("es-CL", { maximumFractionDigits: d }).format(n); };
    var advice = { lcl: "Te conviene el consolidado LCL: pagas solo tu espacio.", compare: "Estás en la zona gris: comparemos consolidado LCL y un contenedor de 20 pies.", fcl_review: "Con este volumen conviene evaluar un contenedor completo para ti." };

    function update() {
      var active = document.querySelector("[data-mini-service].active");
      var svc = active ? active.dataset.miniService : "lcl";
      fill.hidden = !(svc === "lcl" || svc === "fcl");
      if (fill.hidden) return;
      fill.classList.remove("is-fcl");
      if (svc === "fcl") {
        var c = (document.getElementById("miniContainer") || {}).value || "40HQ";
        fill.classList.add("is-fcl");
        label.textContent = "Contenedor " + c + " completo, solo para ti";
        bar.style.width = "100%"; pct.textContent = "~" + fmt(caps[c] || 0, 0) + " m³";
        note.textContent = "Un " + c + " lleva hasta unos " + fmt(caps[c] || 0, 0) + " m³ de carga. Lo cotizamos según la ruta y la semana.";
        return;
      }
      var cbm = parseFloat((document.getElementById("miniCbm") || {}).value) || 0;
      var cap = caps["40HQ"] || 68;
      var share = Math.min(1, cbm / cap);
      label.textContent = "Espacio en un contenedor de 40 pies";
      bar.style.width = (cbm > 0 ? Math.max(2, share * 100) : 0) + "%";
      pct.textContent = cbm > 0 ? (share * 100 < 1 ? "<1%" : fmt(share * 100, 0) + "%") : "0%";
      if (cbm <= 0) { note.textContent = "Escribe el volumen y te mostramos cuánto espacio ocupa tu carga."; return; }
      var rec = window.CHELME_PRICING ? window.CHELME_PRICING.recommendMode(cbm, CONFIG) : { code: "lcl" };
      note.textContent = "Tus " + fmt(cbm, 2) + " m³ ocupan cerca del " + fmt(share * 100, 0) + "% de un contenedor de 40 pies. " + (advice[rec.code] || "");
    }
    var fields = document.getElementById("miniFields");
    if (fields) { fields.addEventListener("input", update); fields.addEventListener("change", update); }
    document.querySelectorAll("[data-mini-service]").forEach(function (b) { b.addEventListener("click", function () { setTimeout(update, 0); }); });
    update();
  }
})();
