const STORAGE_KEY = "chelmeImportProjectV1";

const state = {
  products: [],
  editingId: null,
  imageData: "",
  method: "LCL"
};

const $ = (id) => document.getElementById(id);
const num = (id) => Number.parseFloat($(id).value) || 0;
const money = (value) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value || 0);
const number = (value, decimals = 2) =>
  new Intl.NumberFormat("es-CL", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value || 0);

function saveState() {
  const payload = {
    products: state.products,
    method: state.method,
    client: {
      name: $("clientName").value,
      country: $("clientCountry").value,
      email: $("clientEmail").value,
      whatsapp: $("clientWhatsapp").value
    },
    settings: getSettings()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    alert("El navegador no pudo guardar el proyecto. Elimina imágenes grandes o descarga el archivo del proyecto.");
  }
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const payload = JSON.parse(raw);
    state.products = Array.isArray(payload.products) ? payload.products : [];
    state.method = payload.method === "FCL" ? "FCL" : "LCL";

    if (payload.client) {
      $("clientName").value = payload.client.name || "";
      $("clientCountry").value = payload.client.country || "";
      $("clientEmail").value = payload.client.email || "";
      $("clientWhatsapp").value = payload.client.whatsapp || "";
    }

    if (payload.settings) applySettings(payload.settings);
  } catch (error) {
    console.warn("No fue posible recuperar el proyecto guardado.", error);
  }
}

function getSettings() {
  return {
    exchangeRate: num("exchangeRate"),
    minimumProjectUsd: num("minimumProjectUsd"),
    lclRate: num("lclRate"),
    smallCargoThreshold: num("smallCargoThreshold"),
    smallCargoSurcharge: num("smallCargoSurcharge"),
    lclCommissionPct: num("lclCommissionPct"),
    lclMinimumCommission: num("lclMinimumCommission"),
    containerType: $("containerType").value,
    oceanFreight: num("oceanFreight"),
    chinaLocalCosts: num("chinaLocalCosts"),
    fclCommissionPct: num("fclCommissionPct"),
    fclMinimumCommission: num("fclMinimumCommission"),
    otherLogistics: num("otherLogistics"),
    estimatedTaxes: num("estimatedTaxes")
  };
}

function applySettings(settings) {
  Object.entries(settings).forEach(([key, value]) => {
    const el = $(key);
    if (el && value !== undefined && value !== null) el.value = value;
  });
}

function getRestrictionStatus(type) {
  const map = {
    normal: { label: "Apto para revisión normal", className: "status-ok", blocked: false, fclOnly: false },
    battery: { label: "Sujeto a revisión · normalmente FCL", className: "status-fcl", blocked: false, fclOnly: true },
    chemical: { label: "Revisión especial y documentación", className: "status-review", blocked: false, fclOnly: false },
    food: { label: "Producto regulado · revisión especial", className: "status-review", blocked: false, fclOnly: false },
    brand: { label: "No aceptado sin autorización de marca", className: "status-blocked", blocked: true, fclOnly: false },
    replica: { label: "Producto no aceptado", className: "status-blocked", blocked: true, fclOnly: false },
    review: { label: "Pendiente de revisión manual", className: "status-review", blocked: false, fclOnly: false }
  };
  return map[type] || map.review;
}

function showProductAlert(message, type = "error") {
  const alertBox = $("productAlert");
  alertBox.textContent = message;
  alertBox.classList.remove("hidden");
  if (type === "success") {
    alertBox.style.background = "#effaf3";
    alertBox.style.borderColor = "#cce6d6";
    alertBox.style.color = "#14804a";
  } else {
    alertBox.style.background = "#fff2f2";
    alertBox.style.borderColor = "#f1cfcf";
    alertBox.style.color = "#b83232";
  }
}

function hideProductAlert() {
  $("productAlert").classList.add("hidden");
}

async function compressImage(file) {
  if (!file) return "";
  if (!file.type.startsWith("image/")) throw new Error("El archivo seleccionado no es una imagen.");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const maxSide = 800;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };

      img.onerror = () => reject(new Error("No se pudo leer la imagen."));
      img.src = reader.result;
    };

    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}

function getCalculatedCartons(quantity, unitsPerCarton, explicitCartons) {
  if (explicitCartons > 0) return Math.ceil(explicitCartons);
  if (unitsPerCarton > 0) return Math.ceil(quantity / unitsPerCarton);
  return 0;
}

function collectProduct() {
  const exchangeRate = Math.max(num("exchangeRate"), 0.01);
  const name = $("productName").value.trim();
  const unitPrice = num("unitPrice");
  const currency = $("priceCurrency").value;
  const quantity = Math.floor(num("quantity"));
  const moq = Math.floor(num("moq"));
  const unitsPerCarton = Math.floor(num("unitsPerCarton"));
  const cartons = getCalculatedCartons(quantity, unitsPerCarton, num("cartons"));
  const lengthCm = num("lengthCm");
  const widthCm = num("widthCm");
  const heightCm = num("heightCm");
  const weightPerCarton = num("weightPerCarton");
  const domesticShippingRmb = num("domesticShippingRmb");
  const restrictionType = $("restrictionType").value;
  const restriction = getRestrictionStatus(restrictionType);
  const negotiateMoq = $("requestMoqNegotiation").checked;

  if (!name) throw new Error("Escribe el nombre del producto.");
  if (unitPrice <= 0) throw new Error("Ingresa un precio unitario mayor que cero.");
  if (quantity <= 0) throw new Error("Ingresa una cantidad válida.");
  if (restriction.blocked) throw new Error(restriction.label + ". Consulta antes de continuar.");
  if (moq > 0 && quantity < moq && !negotiateMoq) {
    throw new Error(`La cantidad solicitada (${quantity}) no cumple el MOQ (${moq}). Aumenta la cantidad o marca la opción para solicitar negociación.`);
  }

  const unitPriceUsd = currency === "RMB" ? unitPrice / exchangeRate : unitPrice;
  const goodsValueUsd = unitPriceUsd * quantity;
  const cbmPerCarton = lengthCm && widthCm && heightCm ? (lengthCm * widthCm * heightCm) / 1_000_000 : 0;
  const totalCbm = cbmPerCarton * cartons;
  const totalWeight = weightPerCarton * cartons;
  const domesticShippingUsd = domesticShippingRmb / exchangeRate;

  return {
    id: state.editingId || crypto.randomUUID(),
    url: $("productUrl").value.trim(),
    name,
    supplier: $("supplierName").value.trim(),
    restrictionType,
    restrictionLabel: restriction.label,
    restrictionClass: restriction.className,
    fclOnly: restriction.fclOnly,
    unitPrice,
    currency,
    unitPriceUsd,
    quantity,
    moq,
    negotiateMoq,
    unitsPerCarton,
    cartons,
    lengthCm,
    widthCm,
    heightCm,
    cbmPerCarton,
    totalCbm,
    weightPerCarton,
    totalWeight,
    domesticShippingRmb,
    domesticShippingUsd,
    goodsValueUsd,
    notes: $("productNotes").value.trim(),
    imageData: state.imageData,
    createdAt: new Date().toISOString()
  };
}

function resetProductForm() {
  $("productForm").reset();
  $("priceCurrency").value = "RMB";
  $("restrictionType").value = "normal";
  state.editingId = null;
  state.imageData = "";
  $("addProductButton").textContent = "Agregar a mi importación";
  hideProductAlert();
}

function fillProductForm(product) {
  $("productUrl").value = product.url || "";
  $("productName").value = product.name || "";
  $("supplierName").value = product.supplier || "";
  $("restrictionType").value = product.restrictionType || "normal";
  $("unitPrice").value = product.unitPrice || "";
  $("priceCurrency").value = product.currency || "RMB";
  $("quantity").value = product.quantity || "";
  $("moq").value = product.moq || "";
  $("unitsPerCarton").value = product.unitsPerCarton || "";
  $("cartons").value = product.cartons || "";
  $("lengthCm").value = product.lengthCm || "";
  $("widthCm").value = product.widthCm || "";
  $("heightCm").value = product.heightCm || "";
  $("weightPerCarton").value = product.weightPerCarton || "";
  $("domesticShippingRmb").value = product.domesticShippingRmb || "";
  $("productNotes").value = product.notes || "";
  $("requestMoqNegotiation").checked = Boolean(product.negotiateMoq);
  state.editingId = product.id;
  state.imageData = product.imageData || "";
  $("addProductButton").textContent = "Guardar cambios";
  window.scrollTo({ top: $("productForm").getBoundingClientRect().top + window.scrollY - 110, behavior: "smooth" });
}

function renderProducts() {
  const list = $("productList");
  list.innerHTML = "";

  $("productCounter").textContent = `${state.products.length} ${state.products.length === 1 ? "producto" : "productos"}`;
  $("emptyCart").classList.toggle("hidden", state.products.length > 0);

  for (const product of state.products) {
    const item = document.createElement("article");
    item.className = "product-item";

    const thumb = product.imageData
      ? `<div class="product-thumb"><img src="${product.imageData}" alt=""></div>`
      : `<div class="product-thumb">${product.name.slice(0, 2).toUpperCase()}</div>`;

    const moqText = product.moq > 0
      ? `${product.quantity >= product.moq ? "MOQ cumplido" : "MOQ a negociar"}`
      : "MOQ no informado";

    item.innerHTML = `
      ${thumb}
      <div class="product-main">
        <h4>${escapeHtml(product.name)}</h4>
        <div class="product-meta">
          <span>${product.quantity} unidades</span>
          <span>${product.cartons || "?"} cajas</span>
          <span>${number(product.totalCbm, 3)} m³</span>
          <span>${money(product.goodsValueUsd)}</span>
          <span>${moqText}</span>
        </div>
        <span class="status-badge ${product.restrictionClass}">${escapeHtml(product.restrictionLabel)}</span>
        <div class="product-actions">
          <button type="button" data-edit="${product.id}">Editar</button>
          <button type="button" class="delete" data-delete="${product.id}">Eliminar</button>
          ${product.url ? `<a href="${escapeAttribute(product.url)}" target="_blank" rel="noopener">Abrir enlace</a>` : ""}
        </div>
      </div>
    `;

    list.appendChild(item);
  }

  list.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = state.products.find((item) => item.id === button.dataset.edit);
      if (product) fillProductForm(product);
    });
  });

  list.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      state.products = state.products.filter((item) => item.id !== button.dataset.delete);
      saveState();
      updateAll();
    });
  });
}

function getTotals() {
  return state.products.reduce(
    (acc, product) => {
      acc.goods += product.goodsValueUsd;
      acc.domestic += product.domesticShippingUsd;
      acc.cbm += product.totalCbm;
      acc.weight += product.totalWeight;
      acc.units += product.quantity;
      return acc;
    },
    { goods: 0, domestic: 0, cbm: 0, weight: 0, units: 0 }
  );
}

function getSupplierCount() {
  const names = state.products
    .map((product) => product.supplier.trim().toLowerCase() || extractDomain(product.url) || product.id)
    .filter(Boolean);
  return new Set(names).size;
}

function calculateProject() {
  const totals = getTotals();
  const settings = getSettings();
  const method = state.method;
  const warnings = [];

  let commission = 0;
  let logistics = 0;
  let commissionDetail = "";
  let logisticsDetail = "";
  let occupancy = 0;
  let containerCapacity = 0;

  if (method === "LCL") {
    const commissionCalculated = totals.goods * (settings.lclCommissionPct / 100);
    commission = totals.goods > 0 ? Math.max(commissionCalculated, settings.lclMinimumCommission) : 0;
    const smallCargo = totals.cbm > 0 && totals.cbm < settings.smallCargoThreshold;
    const effectiveRate = settings.lclRate + (smallCargo ? settings.smallCargoSurcharge : 0);
    logistics = totals.cbm * effectiveRate + settings.otherLogistics;
    commissionDetail = `${settings.lclCommissionPct}% sobre mercancía${commission === settings.lclMinimumCommission && commissionCalculated < settings.lclMinimumCommission ? " · aplica mínimo" : ""}.`;
    logisticsDetail = `${money(effectiveRate)} por m³${smallCargo ? " · incluye cargo por carga menor" : ""}.`;

    if (smallCargo) {
      warnings.push(`La carga tiene ${number(totals.cbm, 2)} m³ y está bajo el límite de ${number(settings.smallCargoThreshold, 1)} m³. Se aplicó el cargo operativo adicional.`);
    }

    if (state.products.some((product) => product.fclOnly)) {
      warnings.push("Hay productos marcados como normalmente FCL. El consolidado debe ser revisado antes de aceptarse.");
    }
  } else {
    const commissionCalculated = totals.goods * (settings.fclCommissionPct / 100);
    commission = totals.goods > 0 ? Math.max(commissionCalculated, settings.fclMinimumCommission) : 0;
    logistics = settings.oceanFreight + settings.chinaLocalCosts + settings.otherLogistics;
    commissionDetail = `${settings.fclCommissionPct}% sobre mercancía${commission === settings.fclMinimumCommission && commissionCalculated < settings.fclMinimumCommission ? " · aplica mínimo" : ""}.`;
    logisticsDetail = `Flete ${money(settings.oceanFreight)} + China ${money(settings.chinaLocalCosts)} + adicionales ${money(settings.otherLogistics)}.`;

    const option = $("containerType").selectedOptions[0];
    containerCapacity = Number(option.dataset.capacity) || 0;
    occupancy = containerCapacity > 0 ? (totals.cbm / containerCapacity) * 100 : 0;

    if (occupancy > 100) {
      warnings.push(`El volumen estimado supera la capacidad referencial del ${settings.containerType}. Debes reducir carga o evaluar otro contenedor.`);
    } else if (occupancy > 0 && occupancy < 65) {
      warnings.push(`El contenedor está ocupado aproximadamente al ${number(occupancy, 0)}%. Todavía queda espacio referencial por completar.`);
    }
  }

  const minimumProjectUsd = settings.minimumProjectUsd;
  if (totals.goods > 0 && minimumProjectUsd > 0 && totals.goods < minimumProjectUsd) {
    warnings.push(`El valor de mercancía está bajo el mínimo recomendado de ${money(minimumProjectUsd)}. Puedes seguir agregando productos o solicitar evaluación.`);
  }

  const missingPacking = state.products.filter((product) => product.totalCbm <= 0).length;
  if (missingPacking > 0) {
    warnings.push(`${missingPacking} producto(s) no tienen CBM calculado. La logística puede estar subestimada.`);
  }

  const belowMoq = state.products.filter((product) => product.moq > 0 && product.quantity < product.moq).length;
  if (belowMoq > 0) {
    warnings.push(`${belowMoq} producto(s) están bajo el MOQ y requieren negociación con el proveedor.`);
  }

  const totalBeforeTaxes = totals.goods + totals.domestic + commission + logistics;
  const total = totalBeforeTaxes + settings.estimatedTaxes;
  const unitCost = totals.units > 0 ? total / totals.units : 0;

  return {
    ...totals,
    method,
    commission,
    logistics,
    taxes: settings.estimatedTaxes,
    totalBeforeTaxes,
    total,
    unitCost,
    warnings,
    commissionDetail,
    logisticsDetail,
    occupancy,
    containerCapacity,
    supplierCount: getSupplierCount(),
    settings
  };
}

function renderSummary() {
  const project = calculateProject();

  $("cartGoodsValue").textContent = money(project.goods);
  $("cartDomesticShipping").textContent = money(project.domestic);
  $("cartCbm").textContent = `${number(project.cbm, 3)} m³`;
  $("cartWeight").textContent = `${number(project.weight, 1)} kg`;

  $("summaryGoods").textContent = money(project.goods);
  $("summaryCommission").textContent = money(project.commission);
  $("summaryLogistics").textContent = money(project.logistics + project.domestic);
  $("summaryTotal").textContent = money(project.total);
  $("unitCostSummary").textContent = `Costo unitario estimado: ${money(project.unitCost)}`;
  $("commissionDetail").textContent = project.commissionDetail;
  $("logisticsDetail").textContent = project.logisticsDetail;

  const minimum = project.settings.minimumProjectUsd;
  if (project.goods <= 0) {
    $("minimumOrderStatus").textContent = "Agrega productos para evaluar el mínimo.";
  } else if (minimum <= 0 || project.goods >= minimum) {
    $("minimumOrderStatus").textContent = "Valor mínimo recomendado cumplido.";
  } else {
    $("minimumOrderStatus").textContent = `Faltan ${money(minimum - project.goods)} para el mínimo recomendado.`;
  }

  const progressWrap = $("containerProgressWrap");
  progressWrap.classList.toggle("hidden", project.method !== "FCL");

  if (project.method === "FCL") {
    const containerType = $("containerType").value;
    const shownPct = Math.max(0, Math.min(project.occupancy, 100));
    $("containerProgressTitle").textContent = `Ocupación ${containerType}`;
    $("containerProgressText").textContent = `${number(project.cbm, 2)} de ${number(project.containerCapacity, 0)} m³ referenciales`;
    $("containerProgressPct").textContent = `${number(project.occupancy, 0)}%`;
    $("containerProgressBar").style.width = `${shownPct}%`;
    $("containerProgressBar").style.background = project.occupancy > 100 ? "#b83232" : "";
  }

  const warningList = $("projectWarnings");
  warningList.innerHTML = "";

  if (state.products.length === 0) {
    warningList.innerHTML = `<div class="warning-item">Agrega al menos un producto para obtener una estimación.</div>`;
  } else if (project.warnings.length === 0) {
    warningList.innerHTML = `<div class="warning-item success">La información inicial está completa. De todas formas, debe ser confirmada por el equipo en China.</div>`;
  } else {
    project.warnings.forEach((warning) => {
      const item = document.createElement("div");
      item.className = "warning-item";
      item.textContent = warning;
      warningList.appendChild(item);
    });
  }
}

function switchShippingMethod(method) {
  state.method = method;
  $("lclCard").classList.toggle("active", method === "LCL");
  $("fclCard").classList.toggle("active", method === "FCL");
  $("lclSettings").classList.toggle("hidden", method !== "LCL");
  $("fclSettings").classList.toggle("hidden", method !== "FCL");
  document.querySelector(`input[name="shippingMethod"][value="${method}"]`).checked = true;
  saveState();
  renderSummary();
}

function buildSummaryText() {
  const project = calculateProject();
  const clientName = $("clientName").value.trim() || "No informado";
  const clientCountry = $("clientCountry").value.trim() || "No informado";
  const clientEmail = $("clientEmail").value.trim() || "No informado";
  const clientWhatsapp = $("clientWhatsapp").value.trim() || "No informado";

  const productsText = state.products.map((product, index) => {
    return [
      `${index + 1}. ${product.name}`,
      `Cantidad: ${product.quantity} | MOQ: ${product.moq || "no informado"} | Cajas: ${product.cartons || "pendiente"}`,
      `Mercancía: ${money(product.goodsValueUsd)} | CBM: ${number(product.totalCbm, 3)} | Peso: ${number(product.totalWeight, 1)} kg`,
      product.url ? `Enlace: ${product.url}` : "",
      product.notes ? `Observaciones: ${product.notes}` : "",
      `Estado: ${product.restrictionLabel}`
    ].filter(Boolean).join("\n");
  }).join("\n\n");

  return [
    "SOLICITUD DE REVISIÓN — CHELME GLOBAL TRADE",
    "",
    `Cliente: ${clientName}`,
    `Destino: ${clientCountry}`,
    `Correo: ${clientEmail}`,
    `WhatsApp: ${clientWhatsapp}`,
    "",
    `Modalidad: ${project.method === "LCL" ? "Consolidado Chelme Global" : `FCL ${project.settings.containerType}`}`,
    `Productos: ${state.products.length}`,
    `Proveedores estimados: ${project.supplierCount}`,
    `Unidades: ${project.units}`,
    `Volumen estimado: ${number(project.cbm, 3)} m³`,
    `Peso estimado: ${number(project.weight, 1)} kg`,
    "",
    `Mercancía: ${money(project.goods)}`,
    `Transporte interno China: ${money(project.domestic)}`,
    `Gestión Chelme: ${money(project.commission)}`,
    `Logística: ${money(project.logistics)}`,
    `Impuestos ingresados: ${money(project.taxes)}`,
    `TOTAL ESTIMADO: ${money(project.total)}`,
    `Costo unitario estimado: ${money(project.unitCost)}`,
    "",
    "PRODUCTOS",
    productsText || "Sin productos.",
    "",
    "Aviso: esta simulación es referencial y debe ser confirmada antes de pagar o comprar."
  ].join("\n");
}

function downloadProject() {
  if (state.products.length === 0) {
    alert("Agrega productos antes de descargar el proyecto.");
    return;
  }

  const project = {
    exportedAt: new Date().toISOString(),
    client: {
      name: $("clientName").value.trim(),
      country: $("clientCountry").value.trim(),
      email: $("clientEmail").value.trim(),
      whatsapp: $("clientWhatsapp").value.trim()
    },
    products: state.products,
    calculation: calculateProject()
  };

  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `proyecto-chelme-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function resetProject() {
  if (!confirm("¿Seguro que quieres borrar todos los productos y datos del proyecto?")) return;
  state.products = [];
  state.editingId = null;
  state.imageData = "";
  localStorage.removeItem(STORAGE_KEY);
  resetProductForm();
  ["clientName", "clientCountry", "clientEmail", "clientWhatsapp"].forEach((id) => $(id).value = "");
  updateAll();
}

function updateAll() {
  renderProducts();
  renderSummary();
  saveState();
}

function extractDomain(url) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

$("productImage").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) {
    state.imageData = "";
    return;
  }

  try {
    state.imageData = await compressImage(file);
    showProductAlert("Imagen cargada correctamente.", "success");
  } catch (error) {
    showProductAlert(error.message);
  }
});

$("productForm").addEventListener("submit", (event) => {
  event.preventDefault();
  hideProductAlert();

  try {
    const product = collectProduct();
    const existingIndex = state.products.findIndex((item) => item.id === product.id);

    if (existingIndex >= 0) {
      state.products[existingIndex] = product;
      showProductAlert("Producto actualizado correctamente.", "success");
    } else {
      state.products.push(product);
      showProductAlert("Producto agregado a tu importación.", "success");
    }

    updateAll();
    setTimeout(resetProductForm, 500);
  } catch (error) {
    showProductAlert(error.message);
  }
});

$("clearProductForm").addEventListener("click", resetProductForm);

$("loadExample").addEventListener("click", () => {
  $("productName").value = "Lámpara solar para exterior";
  $("supplierName").value = "Proveedor de ejemplo";
  $("unitPrice").value = "42";
  $("priceCurrency").value = "RMB";
  $("quantity").value = "500";
  $("moq").value = "300";
  $("unitsPerCarton").value = "10";
  $("cartons").value = "";
  $("lengthCm").value = "58";
  $("widthCm").value = "42";
  $("heightCm").value = "36";
  $("weightPerCarton").value = "14.5";
  $("domesticShippingRmb").value = "680";
  $("productNotes").value = "Color negro, luz blanca, panel solar incluido.";
  $("restrictionType").value = "normal";
  showProductAlert("Ejemplo cargado. Puedes modificarlo y agregarlo.", "success");
});

document.querySelectorAll('input[name="shippingMethod"]').forEach((radio) => {
  radio.addEventListener("change", () => switchShippingMethod(radio.value));
});

document.querySelectorAll(".settings-box input, .settings-box select").forEach((input) => {
  input.addEventListener("input", updateAll);
  input.addEventListener("change", updateAll);
});

["clientName", "clientCountry", "clientEmail", "clientWhatsapp"].forEach((id) => {
  $(id).addEventListener("input", saveState);
});

$("sendWhatsapp").addEventListener("click", () => {
  if (state.products.length === 0) {
    alert("Agrega al menos un producto antes de enviar la solicitud.");
    return;
  }

  const text = encodeURIComponent(buildSummaryText());
  window.open(`https://wa.me/8615257960742?text=${text}`, "_blank", "noopener");
});

$("downloadProject").addEventListener("click", downloadProject);
$("printProject").addEventListener("click", () => window.print());
$("resetProject").addEventListener("click", resetProject);

loadState();
switchShippingMethod(state.method);
updateAll();
