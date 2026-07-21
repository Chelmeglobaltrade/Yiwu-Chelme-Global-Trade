/* ============================================================
   PDF DE COTIZACIÓN AUTOMÁTICA — Chelme Global Trade
   Genera un PDF referencial desde la calculadora o la vista
   previa de cotización, usando jsPDF (cargado por CDN).
   ============================================================ */
(function () {
  "use strict";
  var CONFIG = window.CHELME_CONFIG || {};

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

  function collectSimple() {
    var rows = [];
    rows.push(["Volumen", text("simpleCbm")]);
    rows.push(["Modalidad recomendada", text("simpleMethod")]);
    rows.push(["Gestión Chelme", text("simpleManagement")]);
    rows.push(["Logística estimada", text("simpleLogistics")]);
    var breakdown = document.querySelectorAll("#simpleBreakdown .cost-breakdown-row");
    breakdown.forEach(function (r) {
      if (r.children.length >= 2) {
        rows.push([r.children[0].textContent.trim(), r.children[r.children.length - 1].textContent.trim()]);
      }
    });
    return { title: "Calculadora rápida", total: text("simpleTotal"), rows: rows };
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

  function buildPdf(data) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert("El generador de PDF aún está cargando. Intenta de nuevo en unos segundos.");
      return;
    }
    var doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
    var W = 210, M = 18, y;
    var ref = data.ref || makeRef();
    var validity = (CONFIG.exchange && CONFIG.exchange.quoteValidityDays) || 3;
    var fx = CONFIG.exchange || {};

    // Encabezado
    doc.setFillColor(18, 63, 73);
    doc.rect(0, 0, W, 34, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("CHELME GLOBAL TRADE", M, 15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Cotización referencial · " + data.title, M, 22);
    doc.setTextColor(240, 198, 77);
    doc.text("Tu enlace directo con China · Yiwu, Zhejiang", M, 28);

    // Datos generales
    y = 44;
    doc.setTextColor(23, 42, 48);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Referencia: " + ref, M, y);
    doc.setFont("helvetica", "normal");
    doc.text("Fecha: " + today(), W - M, y, { align: "right" });
    y += 6;
    doc.setTextColor(102, 119, 124);
    doc.setFontSize(9);
    doc.text("Vigencia: " + validity + " días · Tipo de cambio comercial: " +
      (fx.commercialRmbPerUsd || "-") + " RMB/USD (actualizado " + (fx.updatedAt || "-") + ")", M, y);
    y += 9;

    // Detalle
    doc.setDrawColor(220, 230, 231);
    doc.setFillColor(237, 243, 243);
    doc.rect(M, y, W - 2 * M, 8, "F");
    doc.setTextColor(18, 63, 73);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Detalle", M + 3, y + 5.5);
    doc.text("Valor", W - M - 3, y + 5.5, { align: "right" });
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(23, 42, 48);
    data.rows.forEach(function (row) {
      if (!row[0] && !row[1]) return;
      doc.line(M, y, W - M, y);
      var label = doc.splitTextToSize(row[0], 110);
      doc.text(label, M + 3, y + 5.5);
      doc.setFont("helvetica", "bold");
      doc.text(String(row[1]), W - M - 3, y + 5.5, { align: "right" });
      doc.setFont("helvetica", "normal");
      y += Math.max(8, label.length * 5 + 3);
      if (y > 240) { doc.addPage(); y = 20; }
    });

    // Total
    doc.setFillColor(18, 63, 73);
    doc.rect(M, y, W - 2 * M, 11, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Estimación total", M + 3, y + 7.5);
    doc.text(String(data.total || "Por confirmar"), W - M - 3, y + 7.5, { align: "right" });
    y += 19;

    // Avisos
    doc.setTextColor(102, 119, 124);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    var avisos = [
      "Esta es una estimación referencial y no constituye una cotización final. Precio, MOQ, peso, embalaje, CBM,",
      "disponibilidad y restricciones deben confirmarse antes de comprar.",
      "Los impuestos de importación, aduana, gastos portuarios y entrega en destino NO están incluidos y se pagan al llegar la carga.",
      "El consolidado se factura por CBM (mínimo 1 m³; bajo 5 m³ aplica cargo operativo fijo).",
      "Para confirmar esta cotización, envía tu solicitud por WhatsApp con la referencia indicada."
    ];
    avisos.forEach(function (a) { doc.text(a, M, y); y += 4.2; });
    y += 4;

    // Contacto
    doc.setDrawColor(215, 170, 40);
    doc.setLineWidth(0.8);
    doc.line(M, y, W - M, y);
    y += 6;
    doc.setTextColor(18, 63, 73);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    var biz = CONFIG.business || {};
    doc.text("WhatsApp: +" + (biz.whatsapp || ""), M, y);
    doc.text("Email: " + (biz.email || ""), M + 62, y);
    doc.text("Instagram: " + (biz.instagramHandle || ""), M + 128, y);

    doc.save("Cotizacion-Chelme-" + ref + ".pdf");
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var b1 = document.getElementById("simplePdfBtn");
    if (b1) b1.addEventListener("click", function () { buildPdf(collectSimple()); });
    var b2 = document.getElementById("quotePdfBtn");
    if (b2) b2.addEventListener("click", function () { buildPdf(collectPreview()); });
  });
})();
