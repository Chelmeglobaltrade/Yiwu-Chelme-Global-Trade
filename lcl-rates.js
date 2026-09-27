/* ============================================================
   TARIFAS LCL POR FLETE Y TRAMO — Chelme Global Trade
   Lee la tabla de precios (flete vigente x tramo de volumen) desde
   Supabase. Si está apagada o no responde, se usa la tarifa fija de
   config.js, así la calculadora nunca queda sin precio.
   No modifica pricing-core.js: solo le entrega la tarifa del tramo.
   ============================================================ */
(function (global) {
  "use strict";
  var URL = "https://pvivlnljgpldtlblyvxo.supabase.co";
  var KEY = "sb_publishable_krvbtoyK0RSsBA3g1dspgA_Bkh55PEh";
  var state = { active: false, freight: null, tiers: [], row: null, rowFreight: null, failed: false, updatedAt: null };

  function pickRow(rates, freight) {
    var keys = Object.keys(rates || {}).map(Number).filter(function (n) { return !isNaN(n); }).sort(function (a, b) { return a - b; });
    if (!keys.length) return null;
    var chosen = keys[0];
    keys.forEach(function (k) { if (k <= freight) chosen = k; });
    return { freight: chosen, prices: rates[String(chosen)] };
  }

  function apply(data) {
    if (data && data.updated_at) state.updatedAt = data.updated_at;
    if (!data || !data.active) { state.active = false; return; }
    var picked = pickRow(data.rates, Number(data.current_freight_usd));
    if (!picked || !Array.isArray(picked.prices) || !picked.prices.length) { state.active = false; return; }
    state.active = true;
    state.freight = Number(data.current_freight_usd);
    state.tiers = data.tiers || [];
    state.row = picked.prices.map(Number);
    state.rowFreight = picked.freight;
  }

  var ready = fetch(URL + "/rest/v1/lcl_pricing?id=eq.1&select=active,current_freight_usd,tiers,rates,updated_at", { headers: { apikey: KEY } })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (rows) { apply(rows[0]); return state; })
    .catch(function () { state.active = false; state.failed = true; return state; });

  function tierIndex(billableCbm) {
    var idx = 0;
    state.tiers.forEach(function (t, i) { if (billableCbm >= Number(t.min)) idx = i; });
    return Math.min(idx, state.row.length - 1);
  }

  global.ChelmeLclRates = {
    ready: ready,
    isActive: function () { return state.active; },
    // Tarifa por m³ para un volumen dado (o la fija de config.js si la tabla está apagada).
    rateFor: function (cbm, config) {
      if (!state.active) return Number(config.lcl.ratePerCbmUsd);
      var billable = Math.max(Number(cbm) || 0, Number(config.lcl.minimumBillableCbm) || 0);
      return state.row[tierIndex(billable)];
    },
    // Tarifa más baja vigente, para textos "Desde US$X/m³".
    fromRate: function (config) {
      return state.active ? Math.min.apply(null, state.row) : Number(config.lcl.ratePerCbmUsd);
    },
    tierLabel: function (cbm, config) {
      if (!state.active) return "";
      var billable = Math.max(Number(cbm) || 0, Number(config.lcl.minimumBillableCbm) || 0);
      var t = state.tiers[tierIndex(billable)];
      return t ? t.label : "";
    },
    // Copia de config con la tarifa del tramo, para pasarla a CHELME_PRICING.calculateLcl.
    configFor: function (cbm, config) {
      var copy = Object.assign({}, config, { lcl: Object.assign({}, config.lcl) });
      copy.lcl.ratePerCbmUsd = this.rateFor(cbm, config);
      return copy;
    },
    // Texto de vigencia para mostrar junto al precio.
    validityText: function () {
      if (state.failed) return "No pudimos cargar la tarifa vigente: este valor es referencial y te lo confirmamos en la cotización revisada.";
      if (state.active && state.updatedAt) return "Tarifa vigente actualizada el " + new Date(state.updatedAt).toLocaleDateString("es-CL") + ". Se confirma en tu cotización revisada.";
      return "Tarifa referencial publicada. Se confirma en tu cotización revisada.";
    },
    info: function () { return state; }
  };
})(window);
