/* Cotizaciones que Chelme prepara en su sistema y publica en la cuenta del cliente.
   El cliente ve productos, fotos y totales (sin datos internos), y puede aceptarla:
   al aceptar se crea su pedido con el adelanto y el saldo para pagar. */
(function () {
  "use strict";

  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var yuan = function (v) { return "¥" + new Intl.NumberFormat("es-CL", { maximumFractionDigits: 2 }).format(Number(v) || 0); };
  var usd = function (v) { return "US$" + new Intl.NumberFormat("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v) || 0); };
  var num = function (v, d) { return new Intl.NumberFormat("es-CL", { maximumFractionDigits: d == null ? 0 : d }).format(Number(v) || 0); };
  var dia = function (d) { return d ? new Date(String(d).length === 10 ? d + "T12:00:00" : d).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" }) : ""; };

  function tarjeta(c) {
    var t = c.totales || {};
    var tc = Number(c.tipo_cambio) || 0;
    var totalUsd = tc ? Number(t.total) / tc : 0;
    var adelanto = totalUsd * (Number(c.adelanto_pct) || 0) / 100;
    var filas = (c.items || []).map(function (it) {
      var unid = (Number(it.cajas) || 0) * (Number(it.unidades_caja) || 0);
      var precio = Number(it.precio) || 0;
      return '<tr>' +
        '<td class="cc-foto">' + (it.foto_url ? '<img src="' + esc(it.foto_url) + '" alt="" loading="lazy">' : '') + '</td>' +
        '<td><strong>' + esc(it.descripcion || "Producto") + '</strong>' + (it.item ? '<small>' + esc(it.item) + '</small>' : '') + '</td>' +
        '<td>' + num(it.cajas) + ' cajas × ' + num(it.unidades_caja) + '<small>' + num(unid) + ' unid.</small></td>' +
        '<td>' + (it.moneda === "USD" ? usd(precio) : yuan(precio)) + '</td>' +
        '<td><strong>' + (it.moneda === "USD" ? usd(unid * precio) : yuan(unid * precio)) + '</strong></td></tr>';
    }).join("");
    var aceptada = Boolean(c.aceptada_at);
    return '<article class="cc-card' + (aceptada ? ' is-ok' : '') + '" data-id="' + esc(c.id) + '">' +
      '<header class="cc-head"><div><span class="cc-num">' + esc(c.numero) + '</span><h3>Cotización de Chelme</h3><p>' + dia(c.publicada_at || c.fecha) + ' · ' + esc(c.tipo_envio === "FCL" ? "Contenedor completo" : "Consolidado") + '</p></div>' +
        '<span class="cc-estado">' + (aceptada ? "Aceptada" : "Lista para revisar") + '</span></header>' +
      (c.mensaje ? '<p class="cc-msg">' + esc(c.mensaje) + '</p>' : '') +
      '<div class="cc-scroll"><table class="cc-tabla"><thead><tr><th></th><th>Producto</th><th>Cantidad</th><th>Precio unidad</th><th>Total</th></tr></thead><tbody>' + filas + '</tbody></table></div>' +
      '<dl class="cc-tot">' +
        '<div><dt>Mercadería</dt><dd>' + yuan(t.mercaderia) + '</dd></div>' +
        '<div><dt>Servicio Chelme (' + num(c.comision_pct, 1) + '%)</dt><dd>' + yuan(t.comision) + '</dd></div>' +
        '<div class="cc-big"><dt>Total</dt><dd>' + yuan(t.total) + (totalUsd ? '<small>≈ ' + usd(totalUsd) + ' (¥' + num(tc, 4) + ' por dólar)</small>' : '') + '</dd></div>' +
        '<div><dt>Volumen y peso</dt><dd>' + num(t.cbm, 2) + ' m³ · ' + num(t.kg) + ' kg · ' + num(t.cajas) + ' cajas</dd></div>' +
      '</dl>' +
      (aceptada
        ? '<p class="cc-ok">La aceptaste el ' + dia(c.aceptada_at) + '. Tu pedido y los pagos están en <a href="#" data-ir-pedidos>Mis pedidos</a>.</p>'
        : '<div class="cc-pago"><p><strong>Cómo se paga:</strong> ' + num(c.adelanto_pct) + '% de adelanto (' + usd(adelanto) + ') para empezar a comprar, y el resto antes de recibir la carga en nuestra bodega. Fletes, IVA y arancel se cotizan aparte.</p>' +
          '<button type="button" class="btn btn-gold" data-aceptar="' + esc(c.id) + '">Aceptar cotización</button>' +
          '<p class="cc-nota">¿Quieres cambiar algo? Escríbenos antes de aceptar.</p></div>') +
      '</article>';
  }

  window.ChelmeCotiz = {
    // Devuelve cuántas cotizaciones esperan respuesta del cliente.
    cargar: async function (opciones) {
      var caja = document.getElementById("cotizChelme");
      if (!caja || !window.supabaseClient) return 0;
      var res = await window.supabaseClient.rpc("mis_cotizaciones");
      var lista = (res && res.data) || [];
      if (!lista.length) { caja.hidden = true; caja.innerHTML = ""; return 0; }
      caja.hidden = false;
      caja.innerHTML = '<h2 class="cc-titulo">Cotizaciones de Chelme</h2>' + lista.map(tarjeta).join("");
      caja.querySelectorAll("[data-aceptar]").forEach(function (b) {
        b.addEventListener("click", async function () {
          if (!confirm("¿Aceptar esta cotización? Se creará tu pedido con el adelanto para pagar.")) return;
          b.disabled = true; b.textContent = "Aceptando…";
          var r = await window.supabaseClient.rpc("aceptar_cotizacion", { p_id: b.dataset.aceptar });
          if (r.error) { alert("No se pudo aceptar: " + (r.error.message || "intenta de nuevo")); b.disabled = false; b.textContent = "Aceptar cotización"; return; }
          if (opciones && opciones.alAceptar) await opciones.alAceptar(r.data);
          window.ChelmeCotiz.cargar(opciones);
        });
      });
      caja.querySelectorAll("[data-ir-pedidos]").forEach(function (a) {
        a.addEventListener("click", function (e) { e.preventDefault(); if (opciones && opciones.irPedidos) opciones.irPedidos(); });
      });
      return lista.filter(function (c) { return !c.aceptada_at; }).length;
    }
  };
})();
