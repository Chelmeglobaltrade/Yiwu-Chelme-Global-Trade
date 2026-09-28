/* Página de contenedor completo: el cliente escribe su volumen y ve cuánto ocupa
   en cada tamaño, con la misma regla de recomendación que usa el cotizador. */
(function () {
  "use strict";
  var box = document.getElementById("fclBoxes");
  if (!box) return;
  var CFG = window.CHELME_CONFIG || {};
  var caps = (CFG.fcl && CFG.fcl.capacityCbm) || { "20GP": 28, "40GP": 58, "40HQ": 68 };
  var calc = CFG.publicCalculator || {};
  var lclMax = Number(calc.lclRecommendedMaxCbm) || 15;
  var compareMax = Number(calc.compareLclFclMaxCbm) || 28;
  var TYPES = [
    { key: "20GP", name: "20'", len: 0.5 },
    { key: "40GP", name: "40'", len: 1 },
    { key: "40HQ", name: "40HQ", len: 1, tall: true }
  ];
  var input = document.getElementById("fclCbm"), range = document.getElementById("fclRange"), reco = document.getElementById("fclReco");
  var fmt = function (n, d) { return new Intl.NumberFormat("es-CL", { maximumFractionDigits: d == null ? 0 : d }).format(n); };

  box.innerHTML = TYPES.map(function (t) {
    return '<div class="fcl-box" data-key="' + t.key + '">' +
      '<div class="fcl-box-head"><strong>' + t.name + '</strong><span>hasta ~' + fmt(caps[t.key]) + ' m³</span></div>' +
      '<div class="fcl-shape' + (t.tall ? ' is-tall' : '') + '" style="width:' + (t.len * 100) + '%"><span class="fcl-fill"></span><span class="fcl-ribs"></span></div>' +
      '<p class="fcl-box-text"></p></div>';
  }).join("");

  function pick(cbm) {
    if (cbm > compareMax) {
      for (var i = 0; i < TYPES.length; i++) if (cbm <= caps[TYPES[i].key] && TYPES[i].key !== "20GP") return TYPES[i].key;
      return "40HQ";
    }
    if (cbm > lclMax) return "20GP";
    return null;
  }
  function update(from) {
    var cbm = Math.max(0, Number(from.value) || 0);
    if (from === input) range.value = Math.min(140, Math.max(1, Math.round(cbm))); else input.value = cbm;
    var best = pick(cbm);
    box.querySelectorAll(".fcl-box").forEach(function (el) {
      var cap = caps[el.dataset.key], share = cbm / cap;
      el.classList.toggle("is-best", el.dataset.key === best);
      el.classList.toggle("is-over", share > 1);
      el.querySelector(".fcl-fill").style.width = Math.min(100, share * 100) + "%";
      el.querySelector(".fcl-box-text").textContent = !cbm ? "" : share > 1
        ? "No cabe: sobran " + fmt(cbm - cap, 1) + " m³"
        : "Ocupa cerca del " + fmt(share * 100) + "%" + (el.dataset.key === best ? " · recomendado" : "");
    });
    var html;
    if (!cbm) html = "Escribe el volumen para ver la recomendación.";
    else if (cbm <= lclMax) html = "Con " + fmt(cbm, 1) + " m³ normalmente conviene el <a href=\"consolidado-lcl.html\">consolidado LCL</a>: pagas solo tus m³.";
    else if (cbm <= compareMax) html = "Con " + fmt(cbm, 1) + " m³ conviene comparar el <a href=\"consolidado-lcl.html\">consolidado</a> con un contenedor de 20'. Te mostramos ambas opciones al cotizar.";
    else if (cbm <= caps["40HQ"]) html = "Con " + fmt(cbm, 1) + " m³ te conviene un contenedor de " + (best === "40HQ" ? "40HQ" : "40'") + ".";
    else html = "Con " + fmt(cbm, 1) + " m³ necesitas más de un contenedor: por ejemplo " + Math.ceil(cbm / caps["40HQ"]) + " × 40HQ. Lo vemos contigo al cotizar.";
    reco.innerHTML = html;
  }
  input.addEventListener("input", function () { update(input); });
  range.addEventListener("input", function () { update(range); });
  update(input);
})();
