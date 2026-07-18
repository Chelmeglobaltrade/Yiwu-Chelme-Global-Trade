const CONFIG = window.CHELME_CONFIG;
const STORAGE_KEY = "chelmeCalculatorV2";

const $ = (id) => document.getElementById(id);
const money = (value) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(Number(value) || 0);

const number = (value, decimals = 2) =>
  new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(Number(value) || 0);

const toNum = (value) => Number.parseFloat(value) || 0;
const fieldNum = (id) => toNum($(id)?.value);

const state = {
  quoteService: "lcl",
  products: [],
  method: "LCL",
  editingId: null
};

const serviceDefinitions = {
  lcl: {
    title: "Cotizar Consolidado Chelme Global",
    badge: "Estimación disponible",
    fields: `
      <div class="dynamic-grid">
        <label class="field">
          <span>Valor aproximado de mercancía (USD)</span>
          <input type="number" id="qGoodsUsd" min="0" step="1" placeholder="0">
        </label>
        <label class="field">
          <span>Volumen estimado (m³) *</span>
          <input type="number" id="qCbm" min="0" step="0.01" required placeholder="0">
        </label>
        <label class="field">
          <span>Cantidad de proveedores</span>
          <input type="number" id="qSuppliers" min="1" step="1" value="1">
        </label>
        <label class="field">
          <span>Tipo de mercancía</span>
          <input type="text" id="qProductType" placeholder="Ej.: herramientas, hogar, textiles">
        </label>
      </div>`
  },
  fcl: {
    title: "Cotizar contenedor completo FCL",
    badge: "Estimación disponible",
    fields: `
      <div class="dynamic-grid">
        <label class="field">
          <span>Tipo de contenedor</span>
          <select id="qContainer">
            <option value="20GP">20GP</option>
            <option value="40GP">40GP</option>
            <option value="40HQ" selected>40HQ</option>
          </select>
        </label>
        <label class="field">
          <span>Valor aproximado de mercancía (USD)</span>
          <input type="number" id="qGoodsUsd" min="0" step="1" placeholder="0">
        </label>
        <label class="field">
          <span>Volumen estimado (m³)</span>
          <input type="number" id="qCbm" min="0" step="0.01" placeholder="0">
        </label>
        <label class="field">
          <span>Puerto o ciudad de origen</span>
          <input type="text" id="qOrigin" placeholder="Ej.: Ningbo, Shanghai, Qingdao">
        </label>
        <label class="field span-2">
          <span>Producto principal</span>
          <input type="text" id="qProductType" placeholder="Describe la mercancía">
        </label>
      </div>`
  },
  quality: {
    title: "Cotizar control de calidad en China",
    badge: "Revisión personalizada",
    fields: `
      <div class="dynamic-grid">
        <label class="field">
          <span>Ciudad de la inspección *</span>
          <input type="text" id="qInspectionCity" required placeholder="Ej.: Yiwu, Guangzhou, Foshan">
        </label>
        <label class="field">
          <span>Tipo de inspección</span>
          <select id="qInspectionType">
            <option value="Preembarque">Inspección preembarque</option>
            <option value="Durante producción">Durante producción</option>
            <option value="Carga de contenedor">Supervisión de carga</option>
            <option value="Videollamada">Inspección por videollamada</option>
            <option value="Auditoría">Auditoría de fábrica</option>
          </select>
        </label>
        <label class="field">
          <span>Producto *</span>
          <input type="text" id="qProductType" required placeholder="Producto a revisar">
        </label>
        <label class="field">
          <span>Cantidad de referencias</span>
          <input type="number" id="qReferences" min="1" step="1" value="1">
        </label>
        <label class="field">
          <span>Cantidad de cajas o unidades</span>
          <input type="number" id="qInspectionQuantity" min="0" step="1" placeholder="0">
        </label>
        <label class="field">
          <span>Fecha requerida</span>
          <input type="date" id="qInspectionDate">
        </label>
        <label class="field span-2">
          <span>Qué necesitas revisar</span>
          <textarea id="qInspectionScope" rows="3" placeholder="Conteo, funcionamiento, medidas, empaque, etiquetas, color, accesorios..."></textarea>
        </label>
      </div>`
  },
  trip: {
    title: "Cotizar viaje de negocios a China",
    badge: "Revisión personalizada",
    fields: `
      <div class="dynamic-grid">
        <label class="field">
          <span>Fecha aproximada del viaje</span>
          <input type="date" id="qTripDate">
        </label>
        <label class="field">
          <span>Cantidad de días *</span>
          <input type="number" id="qTripDays" min="1" step="1" required value="1">
        </label>
        <label class="field span-2">
          <span>Ciudades</span>
          <input type="text" id="qCities" placeholder="Ej.: Yiwu, Guangzhou, Foshan, Shanghai">
        </label>
        <label class="field">
          <span>Tipo de acompañamiento</span>
          <select id="qTripService">
            <option value="Guía y traducción">Guía y traducción</option>
            <option value="Agenda de fábricas">Agenda de fábricas</option>
            <option value="Feria comercial">Acompañamiento a feria</option>
            <option value="Servicio completo">Servicio completo</option>
          </select>
        </label>
        <label class="field">
          <span>Cantidad de viajeros</span>
          <input type="number" id="qTravelers" min="1" step="1" value="1">
        </label>
        <label class="field span-2">
          <span>Productos o industrias</span>
          <input type="text" id="qIndustries" placeholder="Qué productos quieres buscar o qué fábricas quieres visitar">
        </label>
      </div>`
  },
  translation: {
    title: "Cotizar traducción y negociación",
    badge: "Revisión personalizada",
    fields: `
      <div class="dynamic-grid">
        <label class="field">
          <span>Modalidad</span>
          <select id="qTranslationMode">
            <option value="Remota">Remota</option>
            <option value="Presencial">Presencial en China</option>
          </select>
        </label>
        <label class="field">
          <span>Duración estimada</span>
          <input type="number" id="qDuration" min="1" step="1" value="1">
        </label>
        <label class="field">
          <span>Unidad</span>
          <select id="qDurationUnit">
            <option value="horas">Horas</option>
            <option value="días">Días</option>
          </select>
        </label>
        <label class="field">
          <span>Ciudad, si es presencial</span>
          <input type="text" id="qTranslationCity" placeholder="Ciudad">
        </label>
        <label class="field span-2">
          <span>Tema o industria</span>
          <input type="text" id="qTranslationTopic" placeholder="Ej.: maquinaria, textiles, contrato, negociación">
        </label>
      </div>`
  },
  sourcing: {
    title: "Solicitar búsqueda de proveedores",
    badge: "Depósito inicial",
    fields: `
      <div class="dynamic-grid">
        <label class="field span-2">
          <span>Producto que buscas *</span>
          <input type="text" id="qProductType" required placeholder="Descripción clara del producto">
        </label>
        <label class="field">
          <span>Cantidad aproximada</span>
          <input type="number" id="qQuantity" min="1" step="1" placeholder="0">
        </label>
        <label class="field">
          <span>Presupuesto estimado (USD)</span>
          <input type="number" id="qBudget" min="0" step="1" placeholder="0">
        </label>
        <label class="field">
          <span>¿Necesitas personalización?</span>
          <select id="qCustomization">
            <option value="No">No</option>
            <option value="Logo">Logo</option>
            <option value="Empaque">Empaque</option>
            <option value="Producto y empaque">Producto y empaque</option>
          </select>
        </label>
        <label class="field">
          <span>¿Ya tienes referencias o imágenes?</span>
          <select id="qReferencesAvailable">
            <option value="Sí">Sí</option>
            <option value="No">No</option>
          </select>
        </label>
      </div>`
  },
  advisory: {
    title: "Reservar asesoría personalizada",
    badge: "Desde " + money(CONFIG.advisory.startingPriceUsd),
    fields: `
      <div class="dynamic-grid">
        <label class="field span-2">
          <span>Qué necesitas resolver *</span>
          <input type="text" id="qAdvisoryTopic" required placeholder="Describe brevemente tu proyecto o duda">
        </label>
        <label class="field">
          <span>¿Has importado antes?</span>
          <select id="qExperience">
            <option value="No">No</option>
            <option value="Sí, una vez">Sí, una vez</option>
            <option value="Sí, varias veces">Sí, varias veces</option>
          </select>
        </label>
        <label class="field">
          <span>Presupuesto estimado (USD)</span>
          <input type="number" id="qBudget" min="0" step="1" placeholder="0">
        </label>
      </div>`
  },
  packaging: {
    title: "Cotizar etiquetado, empaque o marca privada",
    badge: "Revisión personalizada",
    fields: `
      <div class="dynamic-grid">
        <label class="field span-2">
          <span>Producto *</span>
          <input type="text" id="qProductType" required placeholder="Producto a personalizar">
        </label>
        <label class="field">
          <span>Cantidad aproximada</span>
          <input type="number" id="qQuantity" min="1" step="1" placeholder="0">
        </label>
        <label class="field">
          <span>Servicio requerido</span>
          <select id="qPackagingType">
            <option value="Etiquetas">Etiquetas</option>
            <option value="Shipping marks">Shipping marks</option>
            <option value="Código de barras">Código de barras</option>
            <option value="Empaque personalizado">Empaque personalizado</option>
            <option value="Marca privada completa">Marca privada completa</option>
          </select>
        </label>
        <label class="field span-2">
          <span>Detalles de diseño o materiales</span>
          <textarea id="qPackagingDetails" rows="3" placeholder="Medidas, material, colores, logo, idioma, códigos..."></textarea>
        </label>
      </div>`
  }
};

function initBusinessData() {
  const wa = CONFIG.business.whatsapp;
  document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
    link.href = `https://wa.me/${wa}`;
  });
  document.querySelectorAll("[data-business-city]").forEach((el) => el.textContent = CONFIG.business.city);
  document.querySelectorAll("[data-business-whatsapp]").forEach((el) => el.textContent = `+${wa}`);
  document.querySelectorAll("[data-instagram-link]").forEach((link) => link.href = CONFIG.business.instagram);
  document.querySelectorAll("[data-tiktok-link]").forEach((link) => link.href = CONFIG.business.tiktok);
}

function setQuoteService(service) {
  state.quoteService = service;
  document.querySelectorAll("[data-quote-service]").forEach((button) => {
    button.classList.toggle("active", button.dataset.quoteService === service);
  });

  const definition = serviceDefinitions[service];
  $("quoteTitle").textContent = definition.title;
  $("quoteBadge").textContent = definition.badge;
  $("dynamicQuoteFields").innerHTML = definition.fields;
  $("quoteEstimate").textContent = "Por calcular";
  $("quoteEstimateNote").textContent = "Completa la información para calcular o solicitar revisión.";
  $("quoteAlert").classList.add("hidden");

  $("dynamicQuoteFields").querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("input", updateQuoteEstimate);
    input.addEventListener("change", updateQuoteEstimate);
  });

  updateQuoteEstimate();
}

function updateQuoteEstimate() {
  const service = state.quoteService;
  let estimateText = "Cotización personalizada";
  let note = "Enviaremos la información para revisión antes de confirmar el precio.";

  if (service === "lcl") {
    const goods = fieldNum("qGoodsUsd");
    const cbm = fieldNum("qCbm");
    const rate = CONFIG.lcl.ratePerCbmUsd;
    const small = cbm > 0 && cbm < CONFIG.lcl.smallCargoThresholdCbm;
    const effectiveRate = rate + (small ? CONFIG.lcl.smallCargoExtraPerCbmUsd : 0);
    const management = goods > 0
      ? Math.max(goods * CONFIG.lcl.managementPercent / 100, CONFIG.lcl.minimumManagementUsd)
      : 0;
    const logistics = cbm * effectiveRate;
    const total = goods + management + logistics;

    if (cbm > 0) {
      estimateText = money(total);
      note = `${money(logistics)} de consolidado (${money(effectiveRate)}/m³) + ${money(management)} de gestión + mercancía ingresada. Impuestos no incluidos.`;
    } else {
      estimateText = `Desde ${money(rate)}/m³`;
      note = CONFIG.lcl.nextDepartureText;
    }
  }

  if (service === "fcl") {
    const container = $("qContainer")?.value || "40HQ";
    const goods = fieldNum("qGoodsUsd");
    const cbm = fieldNum("qCbm");
    const freight = CONFIG.fcl.oceanFreightUsd[container] || 0;
    const management = goods > 0
      ? Math.max(goods * CONFIG.fcl.managementPercent / 100, CONFIG.fcl.minimumManagementUsd)
      : 0;
    const total = goods + management + CONFIG.fcl.chinaLocalCostsUsd + freight;
    const capacity = CONFIG.fcl.capacityCbm[container] || 0;
    const occupancy = capacity && cbm ? cbm / capacity * 100 : 0;

    if (freight > 0 || goods > 0) {
      estimateText = money(total);
      note = `Incluye mercancía ingresada, gestión ${CONFIG.fcl.managementPercent}%, gastos China y flete configurado. Ocupación referencial: ${number(occupancy, 0)}%.`;
    } else {
      estimateText = "Flete por confirmar";
      note = `Gestión desde ${CONFIG.fcl.managementPercent}% sobre mercancía.`;
    }
  }

  if (service === "quality") {
    const days = 1;
    const configured = CONFIG.qualityControl.baseVisitUsd + CONFIG.qualityControl.dayRateUsd * days;
    if (configured > 0) {
      estimateText = `Desde ${money(configured)}`;
      note = CONFIG.qualityControl.note;
    } else {
      estimateText = "Cotización según alcance";
      note = CONFIG.qualityControl.note;
    }
  }

  if (service === "trip") {
    const days = fieldNum("qTripDays") || 1;
    const configured =
      CONFIG.chinaTrip.planningFeeUsd +
      (CONFIG.chinaTrip.guidePerDayUsd + CONFIG.chinaTrip.interpreterPerDayUsd + CONFIG.chinaTrip.localTransportPerDayUsd) * days;

    if (configured > 0) {
      estimateText = `Desde ${money(configured)}`;
      note = `Estimación para ${days} día(s). No incluye vuelos, hoteles ni gastos personales.`;
    } else {
      estimateText = "Cotización según agenda";
      note = CONFIG.chinaTrip.note;
    }
  }

  if (service === "translation") {
    const duration = fieldNum("qDuration") || 1;
    const unit = $("qDurationUnit")?.value || "horas";
    const mode = $("qTranslationMode")?.value || "Remota";
    let rate = 0;

    if (mode === "Remota" && unit === "horas") rate = CONFIG.translation.remotePerHourUsd;
    if (mode === "Presencial" || unit === "días") rate = CONFIG.translation.onsitePerDayUsd;

    if (rate > 0) {
      estimateText = `Desde ${money(rate * duration)}`;
      note = CONFIG.translation.note;
    } else {
      estimateText = "Cotización según duración";
      note = CONFIG.translation.note;
    }
  }

  if (service === "sourcing") {
    estimateText = `Depósito desde ${money(CONFIG.sourcing.startingDepositUsd)}`;
    note = CONFIG.sourcing.note;
  }

  if (service === "advisory") {
    estimateText = `Desde ${money(CONFIG.advisory.startingPriceUsd)}`;
    note = "Evaluación del proyecto, proceso recomendado, costos aproximados y próximos pasos.";
  }

  if (service === "packaging") {
    estimateText = "Cotización según cantidad";
    note = "El precio depende de material, medidas, impresión, cantidad mínima y proveedor.";
  }

  $("quoteEstimate").textContent = estimateText;
  $("quoteEstimateNote").textContent = note;
}

function collectDynamicFields() {
  const data = [];
  $("dynamicQuoteFields").querySelectorAll("input, select, textarea").forEach((field) => {
    const label = field.closest(".field")?.querySelector("span")?.textContent || field.id;
    const value = field.value?.trim();
    if (value) data.push(`${label}: ${value}`);
  });
  return data;
}

function showQuoteAlert(message) {
  $("quoteAlert").textContent = message;
  $("quoteAlert").classList.remove("hidden");
}

function sendQuote(event) {
  event.preventDefault();

  const name = $("quoteName").value.trim();
  const destination = $("quoteDestination").value.trim();

  if (!name || !destination) {
    showQuoteAlert("Completa nombre y destino antes de enviar.");
    return;
  }

  const dynamic = collectDynamicFields();
  const serviceName = serviceDefinitions[state.quoteService].title.replace("Cotizar ", "").replace("Solicitar ", "");
  const lines = [
    "SOLICITUD DE COTIZACIÓN — CHELME GLOBAL TRADE",
    "",
    `Servicio: ${serviceName}`,
    `Nombre: ${name}`,
    `Destino: ${destination}`,
    `Correo: ${$("quoteEmail").value.trim() || "No informado"}`,
    `WhatsApp: ${$("quoteClientWhatsapp").value.trim() || "No informado"}`,
    "",
    ...dynamic,
    $("quoteNotes").value.trim() ? `Información adicional: ${$("quoteNotes").value.trim()}` : "",
    "",
    `Estimación mostrada: ${$("quoteEstimate").textContent}`,
    "Entiendo que esta información es referencial y debe ser revisada antes de confirmar precios."
  ].filter(Boolean);

  const text = encodeURIComponent(lines.join("\n"));
  window.open(`https://wa.me/${CONFIG.business.whatsapp}?text=${text}`, "_blank", "noopener");
}

function selectAndScrollService(service) {
  setQuoteService(service);
  $("cotizar").scrollIntoView({ behavior: "smooth", block: "start" });
}

function calculatorRates() {
  const container = $("containerType")?.value || "40HQ";
  return {
    exchange: CONFIG.exchange.rmbPerUsd,
    minimumGoods: CONFIG.lcl.minimumRecommendedGoodsUsd,
    lclRate: CONFIG.lcl.ratePerCbmUsd,
    smallThreshold: CONFIG.lcl.smallCargoThresholdCbm,
    smallExtra: CONFIG.lcl.smallCargoExtraPerCbmUsd,
    lclPct: CONFIG.lcl.managementPercent,
    lclMin: CONFIG.lcl.minimumManagementUsd,
    fclPct: CONFIG.fcl.managementPercent,
    fclMin: CONFIG.fcl.minimumManagementUsd,
    chinaLocal: CONFIG.fcl.chinaLocalCostsUsd,
    oceanFreight: CONFIG.fcl.oceanFreightUsd[container] || 0,
    capacity: CONFIG.fcl.capacityCbm[container] || 0
  };
}

function getRestriction(type) {
  const map = {
    normal: { label: "Revisión normal", className: "status-ok", blocked: false, fclOnly: false },
    battery: { label: "Normalmente FCL", className: "status-fcl", blocked: false, fclOnly: true },
    chemical: { label: "Revisión especial", className: "status-review", blocked: false, fclOnly: false },
    food: { label: "Producto regulado", className: "status-review", blocked: false, fclOnly: false },
    brand: { label: "Requiere autorización", className: "status-blocked", blocked: true, fclOnly: false },
    replica: { label: "No aceptado", className: "status-blocked", blocked: true, fclOnly: false },
    review: { label: "Revisión manual", className: "status-review", blocked: false, fclOnly: false }
  };
  return map[type] || map.review;
}

function resetProductForm() {
  $("productForm").reset();
  $("priceCurrency").value = "RMB";
  $("restrictionType").value = "normal";
  state.editingId = null;
  $("addProductButton").textContent = "Agregar a mi importación";
  $("productAlert").classList.add("hidden");
}

function collectProduct() {
  const rates = calculatorRates();
  const name = $("productName").value.trim();
  const unitPrice = fieldNum("unitPrice");
  const currency = $("priceCurrency").value;
  const quantity = Math.floor(fieldNum("quantity"));
  const moq = Math.floor(fieldNum("moq"));
  const unitsPerCarton = Math.floor(fieldNum("unitsPerCarton"));
  const explicitCartons = Math.floor(fieldNum("cartons"));
  const cartons = explicitCartons > 0 ? explicitCartons : unitsPerCarton > 0 ? Math.ceil(quantity / unitsPerCarton) : 0;
  const restriction = getRestriction($("restrictionType").value);

  if (!name) throw new Error("Escribe el nombre del producto.");
  if (unitPrice <= 0) throw new Error("Ingresa un precio válido.");
  if (quantity <= 0) throw new Error("Ingresa una cantidad válida.");
  if (restriction.blocked) throw new Error(restriction.label + ". Consulta antes de continuar.");
  if (moq > 0 && quantity < moq && !$("requestMoqNegotiation").checked) {
    throw new Error(`La cantidad ${quantity} no cumple el MOQ ${moq}.`);
  }

  const length = fieldNum("lengthCm");
  const width = fieldNum("widthCm");
  const height = fieldNum("heightCm");
  const cbmPerCarton = length && width && height ? length * width * height / 1_000_000 : 0;
  const unitPriceUsd = currency === "RMB" ? unitPrice / rates.exchange : unitPrice;

  return {
    id: state.editingId || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
    url: $("productUrl").value.trim(),
    name,
    supplier: $("supplierName").value.trim(),
    restrictionType: $("restrictionType").value,
    restrictionLabel: restriction.label,
    restrictionClass: restriction.className,
    fclOnly: restriction.fclOnly,
    unitPrice,
    currency,
    quantity,
    moq,
    unitsPerCarton,
    cartons,
    goodsUsd: unitPriceUsd * quantity,
    totalCbm: cbmPerCarton * cartons,
    totalWeight: fieldNum("weightPerCarton") * cartons,
    domesticUsd: fieldNum("domesticShippingRmb") / rates.exchange,
    notes: $("productNotes").value.trim()
  };
}

function renderProducts() {
  const list = $("productList");
  list.innerHTML = "";
  $("productCounter").textContent = `${state.products.length} ${state.products.length === 1 ? "producto" : "productos"}`;
  $("emptyCart").classList.toggle("hidden", state.products.length > 0);

  state.products.forEach((product) => {
    const item = document.createElement("article");
    item.className = "product-item";
    item.innerHTML = `
      <h4>${escapeHtml(product.name)}</h4>
      <div class="product-meta">
        <span>${product.quantity} unidades</span>
        <span>${product.cartons || "?"} cajas</span>
        <span>${number(product.totalCbm, 3)} m³</span>
        <span>${money(product.goodsUsd)}</span>
      </div>
      <span class="status-badge ${product.restrictionClass}">${escapeHtml(product.restrictionLabel)}</span>
      <div class="product-actions">
        <button type="button" data-edit="${product.id}">Editar</button>
        <button type="button" class="delete" data-delete="${product.id}">Eliminar</button>
        ${product.url ? `<a href="${escapeHtml(product.url)}" target="_blank" rel="noopener">Abrir enlace</a>` : ""}
      </div>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      state.products = state.products.filter((product) => product.id !== button.dataset.delete);
      saveCalculator();
      renderCalculator();
    });
  });

  list.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const p = state.products.find((product) => product.id === button.dataset.edit);
      if (!p) return;
      $("productUrl").value = p.url || "";
      $("productName").value = p.name || "";
      $("supplierName").value = p.supplier || "";
      $("restrictionType").value = p.restrictionType || "normal";
      $("unitPrice").value = p.unitPrice || "";
      $("priceCurrency").value = p.currency || "RMB";
      $("quantity").value = p.quantity || "";
      $("moq").value = p.moq || "";
      $("unitsPerCarton").value = p.unitsPerCarton || "";
      $("cartons").value = p.cartons || "";
      $("productNotes").value = p.notes || "";
      state.editingId = p.id;
      $("addProductButton").textContent = "Guardar cambios";
      $("productForm").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function calculatorTotals() {
  return state.products.reduce((acc, p) => {
    acc.goods += p.goodsUsd;
    acc.domestic += p.domesticUsd;
    acc.cbm += p.totalCbm;
    acc.weight += p.totalWeight;
    acc.units += p.quantity;
    return acc;
  }, { goods: 0, domestic: 0, cbm: 0, weight: 0, units: 0 });
}

function calculateCalculator() {
  const totals = calculatorTotals();
  const rates = calculatorRates();
  const other = fieldNum("otherLogistics");
  const taxes = fieldNum("estimatedTaxes");
  const warnings = [];
  let management = 0;
  let logistics = 0;
  let managementDetail = "";
  let logisticsDetail = "";
  let occupancy = 0;

  if (state.method === "LCL") {
    management = totals.goods > 0 ? Math.max(totals.goods * rates.lclPct / 100, rates.lclMin) : 0;
    const small = totals.cbm > 0 && totals.cbm < rates.smallThreshold;
    const effectiveRate = rates.lclRate + (small ? rates.smallExtra : 0);
    logistics = totals.cbm * effectiveRate + other;
    managementDetail = `${rates.lclPct}% sobre mercancía.`;
    logisticsDetail = `${money(effectiveRate)} por m³.`;
    if (small) warnings.push("Se aplicó el cargo configurado para cargas menores.");
    if (state.products.some((p) => p.fclOnly)) warnings.push("Hay productos que normalmente requieren FCL.");
  } else {
    management = totals.goods > 0 ? Math.max(totals.goods * rates.fclPct / 100, rates.fclMin) : 0;
    logistics = rates.oceanFreight + rates.chinaLocal + other;
    occupancy = rates.capacity > 0 ? totals.cbm / rates.capacity * 100 : 0;
    managementDetail = `${rates.fclPct}% sobre mercancía.`;
    logisticsDetail = `Flete configurado + gastos China.`;
    if (occupancy > 100) warnings.push("El volumen supera la capacidad referencial del contenedor.");
  }

  if (totals.goods > 0 && totals.goods < rates.minimumGoods) warnings.push("El valor de mercancía está bajo el mínimo recomendado.");
  if (state.products.some((p) => p.totalCbm <= 0)) warnings.push("Faltan medidas de caja en uno o más productos.");

  const total = totals.goods + totals.domestic + management + logistics + taxes;

  return {
    ...totals,
    rates,
    management,
    logistics,
    taxes,
    total,
    unitCost: totals.units > 0 ? total / totals.units : 0,
    occupancy,
    warnings,
    managementDetail,
    logisticsDetail
  };
}

function renderCalculator() {
  renderProducts();
  const result = calculateCalculator();

  $("cartGoodsValue").textContent = money(result.goods);
  $("cartDomesticShipping").textContent = money(result.domestic);
  $("cartCbm").textContent = `${number(result.cbm, 3)} m³`;
  $("cartWeight").textContent = `${number(result.weight, 1)} kg`;

  $("summaryGoods").textContent = money(result.goods);
  $("summaryCommission").textContent = money(result.management);
  $("summaryLogistics").textContent = money(result.logistics + result.domestic);
  $("summaryTotal").textContent = money(result.total);
  $("unitCostSummary").textContent = `Costo unitario: ${money(result.unitCost)}`;
  $("commissionDetail").textContent = result.managementDetail;
  $("logisticsDetail").textContent = result.logisticsDetail;
  $("minimumOrderStatus").textContent =
    result.goods > 0 && result.goods >= result.rates.minimumGoods
      ? "Mínimo recomendado cumplido."
      : `Mínimo recomendado: ${money(result.rates.minimumGoods)}.`;

  $("containerTypeWrap").classList.toggle("hidden", state.method !== "FCL");
  $("containerProgressWrap").classList.toggle("hidden", state.method !== "FCL");

  if (state.method === "FCL") {
    const pct = Math.max(0, Math.min(result.occupancy, 100));
    $("containerProgressTitle").textContent = `Ocupación ${$("containerType").value}`;
    $("containerProgressText").textContent = `${number(result.cbm, 2)} de ${number(result.rates.capacity, 0)} m³`;
    $("containerProgressPct").textContent = `${number(result.occupancy, 0)}%`;
    $("containerProgressBar").style.width = `${pct}%`;
  }

  const warningBox = $("projectWarnings");
  warningBox.innerHTML = "";
  if (state.products.length === 0) {
    warningBox.innerHTML = `<div class="warning-item">Agrega productos para obtener una estimación.</div>`;
  } else if (result.warnings.length === 0) {
    warningBox.innerHTML = `<div class="warning-item success">Estimación inicial completa. Debe ser revisada antes de comprar.</div>`;
  } else {
    result.warnings.forEach((warning) => {
      const item = document.createElement("div");
      item.className = "warning-item";
      item.textContent = warning;
      warningBox.appendChild(item);
    });
  }

  saveCalculator();
}

function saveCalculator() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    products: state.products,
    method: state.method
  }));
}

function loadCalculator() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    state.products = Array.isArray(saved.products) ? saved.products : [];
    state.method = saved.method === "FCL" ? "FCL" : "LCL";
  } catch {
    state.products = [];
  }
}

function sendCalculatorWhatsapp() {
  if (state.products.length === 0) {
    alert("Agrega al menos un producto.");
    return;
  }

  const result = calculateCalculator();
  const lines = [
    "SIMULACIÓN DE IMPORTACIÓN — CHELME GLOBAL TRADE",
    "",
    `Modalidad: ${state.method === "LCL" ? "Consolidado Chelme Global" : `FCL ${$("containerType").value}`}`,
    `Productos: ${state.products.length}`,
    `Unidades: ${result.units}`,
    `Volumen: ${number(result.cbm, 3)} m³`,
    `Peso: ${number(result.weight, 1)} kg`,
    "",
    `Mercancía: ${money(result.goods)}`,
    `Transporte interno: ${money(result.domestic)}`,
    `Gestión Chelme: ${money(result.management)}`,
    `Logística: ${money(result.logistics)}`,
    `Impuestos ingresados: ${money(result.taxes)}`,
    `TOTAL ESTIMADO: ${money(result.total)}`,
    "",
    "PRODUCTOS",
    ...state.products.map((p, i) => `${i + 1}. ${p.name} — ${p.quantity} unidades — ${number(p.totalCbm, 3)} m³ — ${money(p.goodsUsd)}`),
    "",
    "Esta simulación es referencial y requiere revisión."
  ];

  window.open(`https://wa.me/${CONFIG.business.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
}

function switchMethod(method) {
  state.method = method;
  $("lclCard").classList.toggle("active", method === "LCL");
  $("fclCard").classList.toggle("active", method === "FCL");
  document.querySelector(`input[name="shippingMethod"][value="${method}"]`).checked = true;
  renderCalculator();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initEvents() {
  $("menuToggle").addEventListener("click", () => $("mainNav").classList.toggle("open"));
  $("mainNav").querySelectorAll("a").forEach((link) => link.addEventListener("click", () => $("mainNav").classList.remove("open")));

  document.querySelectorAll("[data-quote-service]").forEach((button) => {
    button.addEventListener("click", () => setQuoteService(button.dataset.quoteService));
  });

  document.querySelectorAll("[data-service-button], [data-quick-service]").forEach((button) => {
    const service = button.dataset.serviceButton || button.dataset.quickService;
    button.addEventListener("click", (event) => {
      event.preventDefault();
      selectAndScrollService(service);
    });
  });

  $("quoteForm").addEventListener("submit", sendQuote);
  $("clearQuote").addEventListener("click", () => {
    $("quoteForm").reset();
    setQuoteService(state.quoteService);
  });

  $("openCalculator").addEventListener("click", () => {
    $("calculatorApp").classList.toggle("hidden");
    $("openCalculator").textContent = $("calculatorApp").classList.contains("hidden")
      ? "Abrir calculadora avanzada"
      : "Cerrar calculadora";
  });

  $("productForm").addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      const product = collectProduct();
      const existing = state.products.findIndex((p) => p.id === product.id);
      if (existing >= 0) state.products[existing] = product;
      else state.products.push(product);
      resetProductForm();
      renderCalculator();
    } catch (error) {
      $("productAlert").textContent = error.message;
      $("productAlert").classList.remove("hidden");
    }
  });

  $("clearProductForm").addEventListener("click", resetProductForm);
  $("loadExample").addEventListener("click", () => {
    $("productName").value = "Lámpara solar exterior";
    $("supplierName").value = "Proveedor de ejemplo";
    $("unitPrice").value = "42";
    $("priceCurrency").value = "RMB";
    $("quantity").value = "500";
    $("moq").value = "300";
    $("unitsPerCarton").value = "10";
    $("lengthCm").value = "58";
    $("widthCm").value = "42";
    $("heightCm").value = "36";
    $("weightPerCarton").value = "14.5";
    $("domesticShippingRmb").value = "680";
  });

  document.querySelectorAll('input[name="shippingMethod"]').forEach((radio) => {
    radio.addEventListener("change", () => switchMethod(radio.value));
  });

  ["containerType", "otherLogistics", "estimatedTaxes"].forEach((id) => {
    $(id).addEventListener("input", renderCalculator);
    $(id).addEventListener("change", renderCalculator);
  });

  $("sendCalculatorWhatsapp").addEventListener("click", sendCalculatorWhatsapp);
  $("resetProject").addEventListener("click", () => {
    if (!confirm("¿Borrar todos los productos del cálculo?")) return;
    state.products = [];
    localStorage.removeItem(STORAGE_KEY);
    resetProductForm();
    renderCalculator();
  });
}

initBusinessData();
loadCalculator();
initEvents();
setQuoteService("lcl");
switchMethod(state.method);
