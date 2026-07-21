/* ============================================================
   PDF DE COTIZACIÓN AUTOMÁTICA — Chelme Global Trade (v2)
   Diseño con logo real, nombre de empresa en chino y tabla
   con filas alternadas. Usa jsPDF cargado por CDN.
   ============================================================ */
(function () {
  "use strict";
  var CONFIG = window.CHELME_CONFIG || {};
  var COMPANY_CN = "义乌市写迩每贸易有限公司";
  var SITE_URL = "chelmeglobaltrade.github.io/Yiwu-Chelme-Global-Trade";

  var PETROL = [18, 63, 73];
  var PETROL_DARK = [10, 46, 53];
  var GOLD = [215, 170, 40];
  var INK = [23, 42, 48];
  var MUTED = [102, 119, 124];
  var SOFT = [237, 243, 243];

  function pad(n) { return String(n).padStart(2, "0"); }
  function today() {
    var d = new Date();
    return pad(d.getDate()) + "-" + pad(d.getMonth() + 1) + "-" + d.getFullYear();
  }
  function makeRef() {
    var d = new Date();
    return "COT-" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
      "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  }
  function text(id) {
    var el = document.getElementById(id);
    return el ? el.textContent.trim() : "";
  }

  // Convierte una imagen (logo) a dataURL vía canvas
  function loadImageData(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () {
        try {
          var c = document.createElement("canvas");
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          c.getContext("2d").drawImage(img, 0, 0);
          resolve({ data: c.toDataURL("image/png"), w: img.naturalWidth, h: img.naturalHeight });
        } catch (e) { resolve(null); }
      };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  // Renderiza texto (incluye chino) a imagen para insertarlo en el PDF
  function textToImage(str, px, color, bold) {
    var scale = 3;
    var c = document.createElement("canvas");
    var ctx = c.getContext("2d");
    var font = (bold ? "700 " : "400 ") + (px * scale) + "px 'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif";
    ctx.font = font;
    var w = Math.ceil(ctx.measureText(str).width) + 4 * scale;
    var h = Math.ceil(px * scale * 1.45);
    c.width = w; c.height = h;
    ctx = c.getContext("2d");
    ctx.font = font;
    ctx.fillStyle = color || "#66777c";
    ctx.textBaseline = "middle";
    ctx.fillText(str, 2 * scale, h / 2);
    return { data: c.toDataURL("image/png"), w: w / scale, h: h / scale };
  }

  function collectLive() {
    var rows = [];
    document.querySelectorAll("#quoteBreakdown .cost-breakdown-row").forEach(function (r) {
      if (r.children.length >= 2) {
        rows.push([r.children[0].textContent.trim(), r.children[r.children.length - 1].textContent.trim()]);
      }
    });
    var serviceTitle = text("quoteTitle") || "Cotización";
    return { title: serviceTitle, total: text("quoteEstimate"), rows: rows };
  }

  function collectPreview() {
    var rows = [];
    document.querySelectorAll("#quotePreviewGrid .quote-preview-item").forEach(function (item) {
      var label = item.querySelector("span");
      var value = item.querySelector("strong");
      if (label && value) rows.push([label.textContent.trim(), value.textContent.trim()]);
    });
    return { title: "Solicitud de cotización", total: text("quoteEstimate"), rows: rows, ref: text("quoteReference") };
  }

  async function buildPdf(data) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert("El generador de PDF aún está cargando. Intenta de nuevo en unos segundos.");
      return;
    }
    var doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
    var W = 210, M = 16;
    var ref = data.ref || makeRef();
    var validity = (CONFIG.exchange && CONFIG.exchange.quoteValidityDays) || 3;
    var fx = CONFIG.exchange || {};
    var biz = CONFIG.business || {};

    // ---- Banda superior dorada fina + encabezado blanco con logo ----
    doc.setFillColor.apply(doc, [GOLD[0], GOLD[1], GOLD[2]]);
    doc.rect(0, 0, W, 2.6, "F");

    var logo = await loadImageData("logo.png");
    if (logo) {
      var lw = 62, lh = lw * (logo.h / logo.w);
      if (lh > 18) { lh = 18; lw = lh * (logo.w / logo.h); }
      doc.addImage(logo.data, "PNG", M, 9, lw, lh);
    } else {
      doc.setTextColor.apply(doc, PETROL);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.text("CHELME GLOBAL TRADE", M, 18);
    }

    // Caja de referencia a la derecha
    doc.setFillColor.apply(doc, PETROL);
    doc.roundedRect(W - M - 62, 8, 62, 20, 2.5, 2.5, "F");
    doc.setTextColor(240, 198, 77);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("COTIZACIÓN REFERENCIAL", W - M - 31, 13.5, { align: "center" });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(ref, W - M - 31, 19, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("Fecha: " + today() + "  ·  Vigencia: " + validity + " días", W - M - 31, 24.5, { align: "center" });

    // Empresa: nombre chino (como imagen) + ubicación
    var cn = textToImage(COMPANY_CN + "  ·  Yiwu, Zhejiang, China", 8.5, "#66777c", false);
    doc.addImage(cn.data, "PNG", M, 30, cn.w * 0.35, cn.h * 0.35);

    // Línea divisoria
    doc.setDrawColor.apply(doc, GOLD);
    doc.setLineWidth(0.6);
    doc.line(M, 38, W - M, 38);

    // ---- Título de la sección ----
    var y = 46;
    doc.setTextColor.apply(doc, PETROL);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(data.title, M, y);
    doc.setTextColor.apply(doc, MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("Tipo de cambio comercial: " + (fx.commercialRmbPerUsd || "-") + " RMB/USD · actualizado " + (fx.updatedAt || "-"), W - M, y, { align: "right" });
    y += 7;

    // ---- Tabla con filas alternadas ----
    doc.setFillColor.apply(doc, PETROL);
    doc.rect(M, y, W - 2 * M, 8.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("Detalle", M + 4, y + 5.7);
    doc.text("Valor", W - M - 4, y + 5.7, { align: "right" });
    y += 8.5;

    doc.setFontSize(9.5);
    var zebra = false;
    data.rows.forEach(function (row) {
      if (!row[0] && !row[1]) return;
      var label = doc.splitTextToSize(row[0], 115);
      var rowH = Math.max(8.5, label.length * 4.6 + 4);
      if (zebra) {
        doc.setFillColor.apply(doc, SOFT);
        doc.rect(M, y, W - 2 * M, rowH, "F");
      }
      zebra = !zebra;
      doc.setTextColor.apply(doc, INK);
      doc.setFont("helvetica", "normal");
      doc.text(label, M + 4, y + 5.7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor.apply(doc, PETROL);
      doc.text(String(row[1]), W - M - 4, y + 5.7, { align: "right" });
      y += rowH;
      if (y > 235) { doc.addPage(); y = 20; zebra = false; }
    });

    // ---- Total en dorado ----
    doc.setFillColor.apply(doc, GOLD);
    doc.rect(M, y, W - 2 * M, 12, "F");
    doc.setTextColor(23, 40, 44);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.text("ESTIMACIÓN TOTAL", M + 4, y + 8);
    doc.setFontSize(12.5);
    doc.text(String(data.total || "Por confirmar"), W - M - 4, y + 8, { align: "right" });
    y += 20;

    // ---- Condiciones ----
    doc.setTextColor.apply(doc, PETROL);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Condiciones de esta estimación", M, y);
    y += 5;
    doc.setTextColor.apply(doc, MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    [
      "· Estimación referencial: no constituye una cotización final. Precio, MOQ, peso, embalaje, CBM, disponibilidad y",
      "  restricciones deben confirmarse antes de comprar.",
      "· Los impuestos de importación, aduana, gastos portuarios y entrega en destino NO están incluidos.",
      "· El consolidado se factura por CBM: mínimo 1 m³; bajo 5 m³ aplica cargo operativo fijo.",
      "· Para confirmar, envía tu solicitud por WhatsApp indicando la referencia " + ref + "."
    ].forEach(function (a) { doc.text(a, M, y); y += 4.1; });

    // ---- Pie de página: contacto ordenado en filas ----
    var fy = 254;
    doc.setFillColor.apply(doc, PETROL_DARK);
    doc.rect(0, fy, W, 297 - fy, "F");

    doc.setTextColor(240, 198, 77);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("CHELME GLOBAL TRADE — Tu enlace directo con China", M, fy + 8);

    // Fila 1: ubicación (ancho completo, puede ocupar 2 líneas)
    doc.setTextColor(150, 178, 182);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("UBICACIÓN EN CHINA", M, fy + 16);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(doc.splitTextToSize(biz.address || biz.city || "Yiwu, Zhejiang, China", W - 2 * M), M, fy + 20.5);

    // Fila 2: WhatsApp/teléfono y correo en dos columnas
    var half = (W - 2 * M) / 2;
    var col1 = M, col2 = M + half;
    var row2LabelY = fy + 30, row2ValueY = fy + 34.5;
    doc.setTextColor(150, 178, 182);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("WHATSAPP / TELÉFONO", col1, row2LabelY);
    doc.text("CORREO", col2, row2LabelY);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("+" + (biz.whatsapp || ""), col1, row2ValueY);
    doc.text(doc.splitTextToSize(biz.email || "", half - 6), col2, row2ValueY);

    // Fila 3: redes / sitio
    doc.setTextColor(150, 178, 182);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text((biz.instagramHandle ? "IG " + biz.instagramHandle + "   ·   " : "") + SITE_URL, W / 2, fy + 41, { align: "center" });

    doc.save("Cotizacion-Chelme-" + ref + ".pdf");
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var b1 = document.getElementById("livePdfBtn");
    if (b1) b1.addEventListener("click", function () {
      var rows = document.querySelectorAll("#quoteBreakdown .cost-breakdown-row");
      if (!rows.length) {
        alert("Completa primero los datos del formulario para calcular tu estimación.");
        return;
      }
      buildPdf(collectLive());
    });
    var b2 = document.getElementById("quotePdfBtn");
    if (b2) b2.addEventListener("click", function () { buildPdf(collectPreview()); });
  });
})();
