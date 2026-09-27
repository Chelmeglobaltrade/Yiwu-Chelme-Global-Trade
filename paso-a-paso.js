/* Página "Importar paso a paso": simulador interactivo.
   El cliente arma su caso (¿tiene proveedor? ¿contenedor completo o consolidado?)
   y recorre cada etapa con la ruta, quién hace qué, cuánto tarda, qué paga y qué recibe. */
(function () {
  "use strict";
  var root = document.getElementById("ppx");
  if (!root) return;

  var PHASES = ["Proyecto y pago", "En China", "Navegación", "En Chile"];
  var WHO = { tu: "Tú", chelme: "Chelme", juntos: "Juntos" };

  /* Escenas: foto real o tarjeta de documento. */
  var S = {
    reunion: { photo: "reunion-muestras-proveedor.webp", cap: "Reunión con proveedor revisando muestras" },
    fabrica: { photo: "visita-equipo-fabrica.webp", cap: "Visita del equipo a una fábrica" },
    produccion: { photo: "control-produccion-textil.webp", cap: "Revisión durante la producción" },
    cargaFcl: { photo: "carga-herramientas.webp", cap: "Contenedor cargado y revisado" },
    bodega: { photo: "carga-contenedor-verde.webp", cap: "Carga revisada antes de embarcar" },
    llegada: { photo: "operacion-contenedor-chile.webp", cap: "Operación de contenedor en Chile" }
  };

  var STEPS = {
    asesoria: { ph: 0, who: "tu", time: "Día 0", title: "Reservas la asesoría", text: "Nos cuentas qué quieres importar y confirmas el pago de la asesoría (US$200).", pay: "Asesoría US$200", scene: S.reunion },
    revision: { ph: 0, who: "chelme", time: "Días 1 a 3", title: "Revisamos tu proyecto", text: "Revisamos enlaces, fotos o listas, y evaluamos cantidades, presupuesto y restricciones.", doc: "checklist" },
    preliminar: { ph: 0, who: "chelme", time: "Días 3 a 5", title: "Te enviamos una cotización preliminar", text: "Costos estimados, recomendación de consolidado o contenedor completo, y próximos pasos.", get: "Cotización preliminar", doc: "quote" },
    decides: { ph: 0, who: "tu", title: "Decides si avanzamos", text: "Con números claros decides si compras, ajustas cantidades o buscas otro producto.", doc: "decision" },
    busqueda: { ph: 1, who: "chelme", time: "3 a 10 días", title: "Buscamos y negociamos", text: "Comparamos fábricas, precios y cantidades mínimas, y negociamos en chino por ti.", scene: S.fabrica },
    produccion: { ph: 1, who: "juntos", time: "7 a 25 días según producto", title: "Compra y producción", text: "Se confirma la compra y la fábrica produce. Si lo contratas, hacemos control de calidad antes de embarcar.", pay: "Tu mercancía", scene: S.produccion },

    fclCotiza: { ph: 0, who: "tu", time: "Minutos", title: "Pides la cotización de tu contenedor", text: "Nos cuentas qué traes, el volumen aproximado y dónde está tu proveedor. Te respondemos con una cotización a tu medida.", get: "Cotización a tu medida", doc: "quoteFcl" },
    fclPago: { ph: 0, who: "tu", title: "Confirmas y pagas el servicio", text: "Pagas el servicio y el flete antes de avanzar. Con eso coordinamos la reserva del contenedor.", pay: "Servicio y flete", doc: "pay" },
    fclFecha: { ph: 1, who: "juntos", title: "Acordamos la fecha de carga", text: "Coordinamos con tu proveedor el día y el lugar donde se carga el contenedor.", doc: "date" },
    fclCarga: { ph: 1, who: "chelme", time: "Día de carga", title: "Revisamos y cargamos", text: "Contamos los bultos, revisamos el embalaje y tomamos fotos de la carga y del sellado. Nada sale sin revisar.", get: "Fotos de la carga y del sello", scene: S.cargaFcl },

    lclCotiza: { ph: 0, who: "tu", time: "Minutos", title: "Cotizas en la calculadora", text: "Ingresas el valor y el volumen de tu carga y ves el estimado al instante.", get: "Estimado al instante", doc: "calc" },
    lclPago: { ph: 0, who: "tu", title: "Confirmas y pagas el servicio", text: "Pagas el flete y el servicio según tus m³. Con eso reservamos tu espacio en el contenedor.", pay: "Servicio según tus m³", doc: "pay" },
    lclFecha: { ph: 1, who: "chelme", title: "Te enviamos fecha de carga y dirección", text: "Te pasamos la dirección de nuestra bodega en Yiwu y cómo marcar las cajas, para que tu proveedor despache.", get: "Dirección y marcado de cajas", doc: "label" },
    lclBodega: { ph: 1, who: "chelme", time: "Al llegar a bodega", title: "Recibimos y revisamos tu carga", text: "Contamos los bultos, revisamos el embalaje, tomamos fotos, medimos y pesamos. Nada sale sin revisar.", get: "Fotos, medidas y peso", scene: S.bodega },

    zarpe: { ph: 2, who: "chelme", time: "30 a 45 días de navegación", title: "Zarpa el contenedor", text: "Tu carga navega hacia Chile y sigues el estado desde tu cuenta en la página.", get: "Estado en tu cuenta", doc: "sea" },
    iva: { ph: 3, who: "tu", time: "Antes de la llegada", title: "Pagas IVA y arancel", text: "Unos días antes de la llegada te enviamos el monto exacto según la declaración de aduana.", pay: "IVA y arancel", doc: "customs" },
    fclEntrega: { ph: 3, who: "juntos", title: "Recibes tu carga", text: "Desaduanamos tu contenedor y coordinamos contigo la entrega.", scene: S.llegada },
    lclRetiro: { ph: 3, who: "juntos", title: "Retiras en Santiago", text: "Desaduanamos tu carga y la retiras en nuestra bodega, o te cotizamos el envío a regiones.", doc: "deliverLcl" }
  };

  function flow(hasSupplier, mode) {
    var ids = hasSupplier ? [] : ["asesoria", "revision", "preliminar", "decides", "busqueda", "produccion"];
    if (mode === "fcl") ids = ids.concat(hasSupplier ? ["fclCotiza", "fclPago"] : ["fclPago"], ["fclFecha", "fclCarga", "zarpe", "iva", "fclEntrega"]);
    else ids = ids.concat(hasSupplier ? ["lclCotiza", "lclPago"] : ["lclPago"], ["lclFecha", "lclBodega", "zarpe", "iva", "lclRetiro"]);
    // Sin proveedor, el pago del servicio ocurre cuando la mercancía ya está en producción.
    return ids.map(function (id) { var s = Object.assign({ id: id }, STEPS[id]); if (!hasSupplier && /Pago$/.test(id)) s.ph = 1; return s; });
  }

  var CTAS = {
    "si-fcl": [["Cotizar mi contenedor", "index.html#cotizar"], ["Ver contenedor completo", "contenedor-fcl.html"]],
    "si-lcl": [["Calcular mis m³", "index.html#cotizar"], ["Ver qué incluye el consolidado", "consolidado-lcl.html"]],
    "no-fcl": [["Reservar la asesoría", "asesoria.html"], ["Ver búsqueda de proveedor", "busqueda-proveedor.html"]],
    "no-lcl": [["Reservar la asesoría", "asesoria.html"], ["Ver búsqueda de proveedor", "busqueda-proveedor.html"]]
  };

  var el = {
    list: root.querySelector(".ppx-steps"),
    scene: root.querySelector(".ppx-scene"),
    marker: root.querySelector(".ppx-marker"),
    fill: root.querySelector(".ppx-track-fill"),
    nodes: root.querySelectorAll(".ppx-node"),
    count: root.querySelector(".ppx-count"),
    prev: root.querySelector("[data-ppx-prev]"),
    next: root.querySelector("[data-ppx-next]"),
    play: root.querySelector("[data-ppx-play]"),
    summary: root.querySelector(".ppx-summary"),
    pays: root.querySelector(".ppx-pays"),
    cta: document.getElementById("ppxCta"),
    visual: root.querySelector(".ppx-visual")
  };
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var state = { supplier: true, mode: "fcl", i: 0, steps: [], timer: null };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function docHtml(kind) {
    var row = function (a, b, cls) { return '<div class="ppx-doc-row' + (cls ? " " + cls : "") + '"><span>' + a + "</span><span>" + b + "</span></div>"; };
    var check = function (t) { return '<li><span class="ppx-check" aria-hidden="true"></span>' + t + "</li>"; };
    switch (kind) {
      case "quoteFcl": return '<div class="ppx-doc"><div class="ppx-doc-head"><strong>Cotización</strong><span class="ppx-mono">Contenedor completo</span></div><div class="ppx-chips"><span>20\'</span><span>40\'</span><span class="is-on">40HQ</span></div>' + row("Servicio Chelme", "a tu medida") + row("Flete marítimo", "incluido en la cotización") + row("IVA y arancel", "se pagan aparte", "is-aside") + "</div>";
      case "quote": return '<div class="ppx-doc"><div class="ppx-doc-head"><strong>Cotización preliminar</strong><span class="ppx-mono">Días 3 a 5</span></div>' + row("Costo estimado del producto", "según fábrica") + row("Envío recomendado", "consolidado o contenedor") + row("Próximos pasos", "qué decides tú") + "</div>";
      case "calc": return '<div class="ppx-doc"><div class="ppx-doc-head"><strong>Calculadora</strong><span class="ppx-mono">Ejemplo</span></div><div class="ppx-meter"><span style="--v:35%"></span></div><div class="ppx-doc-row"><span>Tu carga</span><span class="ppx-mono">3,5 m³</span></div><div class="ppx-doc-row is-aside"><span>Estimado</span><span>al instante en la página</span></div></div>';
      case "pay": return '<div class="ppx-doc"><div class="ppx-doc-head"><strong>Pago del servicio</strong><span class="ppx-mono">100% antes de avanzar</span></div><ol class="ppx-flow"><li class="is-done">Transfieres</li><li class="is-done">Subes el comprobante en tu cuenta</li><li class="is-now">Lo confirmamos y avanzamos</li></ol></div>';
      case "checklist": return '<div class="ppx-doc"><div class="ppx-doc-head"><strong>Revisión de tu proyecto</strong></div><ul class="ppx-list">' + check("Enlaces, fotos o listas") + check("Cantidades y presupuesto") + check("Restricciones y permisos") + "</ul></div>";
      case "decision": return '<div class="ppx-doc"><div class="ppx-doc-head"><strong>Tu decisión</strong></div><div class="ppx-choice"><span class="is-on">Avanzar con la compra</span><span>Ajustar cantidades</span><span>Buscar otro producto</span></div></div>';
      case "date": return '<div class="ppx-doc"><div class="ppx-doc-head"><strong>Fecha de carga</strong><span class="ppx-mono">Confirmada con tu proveedor</span></div><div class="ppx-cal">' + Array.apply(null, { length: 14 }).map(function (_, d) { return "<span" + (d === 9 ? ' class="is-on"' : "") + ">" + (d + 1) + "</span>"; }).join("") + '</div><div class="ppx-doc-row is-aside"><span>Lugar de carga</span><span>se coordina con la fábrica</span></div></div>';
      case "label": return '<div class="ppx-doc"><div class="ppx-doc-head"><strong>Marcado de cajas</strong><span class="ppx-mono">Para tu proveedor</span></div><div class="ppx-box"><span class="ppx-mono">CHELME · TU NOMBRE</span><span class="ppx-mono">CAJA 1 / 20</span></div><div class="ppx-doc-row is-aside"><span>Dirección de bodega</span><span>se envía al confirmar la fecha</span></div></div>';
      case "customs": return '<div class="ppx-doc"><div class="ppx-doc-head"><strong>Declaración de aduana</strong><span class="ppx-mono">Antes de la llegada</span></div>' + row("IVA", "según declaración") + row("Arancel", "según producto y origen") + '<div class="ppx-stamp">Monto exacto enviado a tu cuenta</div></div>';
      case "sea": return '<div class="ppx-doc ppx-sea"><div class="ppx-doc-head"><strong>En navegación</strong><span class="ppx-mono">30 a 45 días</span></div><div class="ppx-waves" aria-hidden="true"><span class="ppx-ship"></span></div><ol class="ppx-flow"><li class="is-done">Zarpó desde China</li><li class="is-now">En el mar · ves el estado en tu cuenta</li><li>Llega a Chile</li></ol></div>';
      case "deliverFcl": return '<div class="ppx-doc"><div class="ppx-doc-head"><strong>Entrega</strong><span class="ppx-mono">Contenedor completo</span></div><ol class="ppx-flow"><li class="is-done">Desaduanado</li><li class="is-now">Entrega coordinada contigo</li></ol></div>';
      case "deliverLcl": return '<div class="ppx-doc"><div class="ppx-doc-head"><strong>Retiro</strong><span class="ppx-mono">Bodega en Santiago</span></div><ol class="ppx-flow"><li class="is-done">Desaduanado</li><li class="is-now">Retiras en bodega</li></ol><div class="ppx-doc-row is-aside"><span>¿Regiones?</span><span>te cotizamos el envío</span></div></div>';
    }
    return "";
  }

  function sceneHtml(s) {
    if (s.scene) return '<figure class="ppx-photo"><img src="' + s.scene.photo + '" alt="' + esc(s.scene.cap) + '" loading="lazy"><figcaption>' + esc(s.scene.cap) + "</figcaption></figure>";
    return docHtml(s.doc);
  }

  function renderList() {
    el.list.innerHTML = state.steps.map(function (s, i) {
      var meta = '<span class="pp-who pp-who-' + s.who + '">' + WHO[s.who] + "</span>" + (s.time ? '<span class="pp-time">' + esc(s.time) + "</span>" : "");
      var extra = (s.pay ? '<span class="ppx-pay">Pagas: ' + esc(s.pay) + "</span>" : "") + (s.get ? '<span class="ppx-get">Recibes: ' + esc(s.get) + "</span>" : "");
      var head = i === 0 || state.steps[i - 1].ph !== s.ph ? '<li class="ppx-phase" aria-hidden="true">' + PHASES[s.ph] + "</li>" : "";
      return head + '<li><button type="button" class="ppx-step" data-i="' + i + '" aria-current="false"><span class="ppx-num">' + (i + 1) + '</span><span class="ppx-body"><span class="pp-tags">' + meta + '</span><strong>' + esc(s.title) + '</strong><span class="ppx-text">' + esc(s.text) + '</span><span class="ppx-extra">' + extra + "</span></span></button></li>";
    }).join("");
  }

  function renderSummary() {
    var n = { tu: 0, chelme: 0, juntos: 0 };
    state.steps.forEach(function (s) { n[s.who]++; });
    var time = state.supplier ? "Navegación de 30 a 45 días" : "Proceso completo de 8 a 11 semanas aprox.";
    el.summary.innerHTML = "<strong>" + state.steps.length + " pasos</strong><span><b class=\"pp-who pp-who-tu\">Tú</b> " + n.tu + "</span><span><b class=\"pp-who pp-who-chelme\">Chelme</b> " + n.chelme + "</span><span><b class=\"pp-who pp-who-juntos\">Juntos</b> " + n.juntos + "</span><span>" + time + "</span>";
    var pays = state.steps.filter(function (s) { return s.pay; });
    el.pays.innerHTML = '<span class="ppx-pays-label">Tus pagos, en orden</span><ol>' + pays.map(function (s) { return '<li><button type="button" data-goto="' + state.steps.indexOf(s) + '">' + esc(s.pay) + "</button></li>"; }).join("") + "</ol>";
    var c = CTAS[(state.supplier ? "si-" : "no-") + state.mode];
    el.cta.innerHTML = '<a class="btn btn-gold" href="' + c[0][1] + '">' + c[0][0] + '</a><a class="btn pp-btn-outline" href="' + c[1][1] + '">' + c[1][0] + "</a>";
  }

  function go(i, fromUser) {
    var n = state.steps.length;
    state.i = Math.max(0, Math.min(n - 1, i));
    var s = state.steps[state.i];
    el.list.querySelectorAll(".ppx-step").forEach(function (b) {
      var on = +b.dataset.i === state.i;
      b.classList.toggle("is-active", on);
      b.classList.toggle("is-past", +b.dataset.i < state.i);
      b.setAttribute("aria-current", on ? "step" : "false");
    });
    // Ruta: el marcador avanza por fases y dentro de cada fase según el paso.
    var inPh = state.steps.filter(function (x) { return x.ph === s.ph; });
    var k = inPh.indexOf(s), frac = inPh.length > 1 ? k / (inPh.length - 1) : 0.5;
    var pos = (s.ph + 0.15 + frac * 0.7) / PHASES.length * 100;
    el.marker.style.left = pos + "%";
    el.fill.style.width = pos + "%";
    el.marker.classList.toggle("is-sea", s.ph === 2);
    el.nodes.forEach(function (nd, j) { nd.classList.toggle("is-on", j === s.ph); nd.classList.toggle("is-past", j < s.ph); });
    el.scene.classList.remove("is-in");
    el.scene.innerHTML = '<div class="ppx-scene-meta"><span class="pp-who pp-who-' + s.who + '">' + WHO[s.who] + "</span>" + (s.time ? '<span class="pp-time">' + esc(s.time) + "</span>" : "") + "</div>" + sceneHtml(s);
    void el.scene.offsetWidth; el.scene.classList.add("is-in");
    el.count.textContent = "Paso " + (state.i + 1) + " de " + n;
    el.prev.disabled = state.i === 0;
    el.next.disabled = state.i === n - 1;
    if (fromUser) stop();
  }

  function build() {
    state.steps = flow(state.supplier, state.mode);
    renderList(); renderSummary(); go(0);
    try { history.replaceState(null, "", "#" + (state.supplier ? "ya-tengo-proveedor" : "necesito-proveedor") + (state.mode === "lcl" ? "-lcl" : "")); } catch (e) {}
  }

  function stop() { if (state.timer) { clearInterval(state.timer); state.timer = null; } el.play.textContent = "Ver recorrido completo"; el.play.setAttribute("aria-pressed", "false"); }
  function play() {
    if (state.timer) { stop(); return; }
    if (state.i >= state.steps.length - 1) go(0);
    el.play.textContent = "Pausar recorrido"; el.play.setAttribute("aria-pressed", "true");
    state.timer = setInterval(function () { if (state.i >= state.steps.length - 1) { stop(); return; } go(state.i + 1); }, reduced ? 4200 : 2800);
  }

  root.querySelectorAll("[data-ppx-q]").forEach(function (b) {
    b.addEventListener("click", function () {
      var q = b.dataset.ppxQ, v = b.dataset.v;
      root.querySelectorAll('[data-ppx-q="' + q + '"]').forEach(function (x) { var on = x === b; x.classList.toggle("is-on", on); x.setAttribute("aria-checked", on ? "true" : "false"); });
      if (q === "supplier") state.supplier = v === "si"; else state.mode = v;
      stop(); build();
    });
  });
  el.list.addEventListener("click", function (e) {
    var b = e.target.closest(".ppx-step"); if (!b) return;
    go(+b.dataset.i, true);
    if (window.innerWidth < 900 && el.visual.getBoundingClientRect().bottom < 80) el.visual.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  });
  el.list.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault(); go(state.i + (e.key === "ArrowDown" ? 1 : -1), true);
    var b = el.list.querySelector('.ppx-step[data-i="' + state.i + '"]'); if (b) b.focus();
  });
  el.pays.addEventListener("click", function (e) { var b = e.target.closest("[data-goto]"); if (b) go(+b.dataset.goto, true); });
  el.prev.addEventListener("click", function () { go(state.i - 1, true); });
  el.next.addEventListener("click", function () { go(state.i + 1, true); });
  el.play.addEventListener("click", play);

  var h = location.hash;
  if (/necesito-proveedor/.test(h)) state.supplier = false;
  if (/-lcl/.test(h)) state.mode = "lcl";
  root.querySelectorAll("[data-ppx-q]").forEach(function (x) {
    var on = x.dataset.ppxQ === "supplier" ? (x.dataset.v === "si") === state.supplier : x.dataset.v === state.mode;
    x.classList.toggle("is-on", on); x.setAttribute("aria-checked", on ? "true" : "false");
  });
  root.classList.add("is-ready");
  build();
})();
