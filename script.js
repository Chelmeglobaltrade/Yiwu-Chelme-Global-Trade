const CONFIG = window.CHELME_CONFIG;
const $ = (id) => document.getElementById(id);
const money = (value) => new Intl.NumberFormat("es-CL",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(Number(value)||0);
const moneyClp = (value) => new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(Number(value)||0);
const fmt = (value, decimals=2) => new Intl.NumberFormat("es-CL",{minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(Number(value)||0);
const val = (id) => Number.parseFloat($(id)?.value)||0;

const state = {
  quoteService: "lcl",
  sourceMode: "link",
  quoteFiles: [],
  quoteBreakdown: [],
  preparedQuoteText: "",
  preparedQuoteFiles: [],
  preparedQuoteReference: ""
};

const services = {
  lcl: {
    title: "Cotizar carga consolidada",
    badge: "Estimación disponible",
    html: `
      <div class="service-field-panel form-grid">
        <label class="field"><span>Valor aproximado de productos</span><input id="qGoods" type="number" min="0" placeholder="0"></label>
        <label class="field"><span>Moneda de los productos</span><select id="qCurrency"><option value="USD">USD</option><option value="RMB">RMB / CNY</option></select></label>
        <label class="field"><span>Volumen real, si lo conoces (m³)</span><input id="qCbm" type="number" min="0" step="0.01" placeholder="0"></label>
        <label class="field"><span>Cantidad aproximada</span><input id="qQuantity" type="number" min="1" placeholder="0"></label>
        <label class="field"><span>Cantidad de proveedores</span><input id="qSuppliers" type="number" min="1" value="1"></label>
        <div class="cbm-helper" style="grid-column:1/-1">
          <button type="button" class="cbm-helper-toggle" data-cbm-helper-toggle>¿No sabes el CBM? Calcúlalo con las medidas de tus cajas</button>
          <div class="cbm-helper-fields hidden form-grid" data-cbm-helper-fields>
            <label class="field"><span>Largo (cm)</span><input type="number" min="0" placeholder="0" data-box-length></label>
            <label class="field"><span>Ancho (cm)</span><input type="number" min="0" placeholder="0" data-box-width></label>
            <label class="field"><span>Alto (cm)</span><input type="number" min="0" placeholder="0" data-box-height></label>
            <label class="field"><span>Cantidad de cajas</span><input type="number" min="1" placeholder="0" data-box-count></label>
          </div>
        </div>
        <label class="service-option" style="grid-column:1/-1">
          <input id="qIncludeSourcing" type="checkbox">
          <span><strong>Necesito búsqueda de proveedor y gestión de compra</strong><small>Solo al marcar esta opción se agrega este servicio a tu cotización. El detalle del cargo aparece en tu estimación y en el PDF.</small></span>
        </label>
      </div>`
  },
  fcl: {
    title: "Cotizar contenedor completo",
    badge: "Estimación disponible",
    html: `
      <div class="service-field-panel form-grid">
        <label class="field"><span>Contenedor</span><select id="qContainer"><option>20GP</option><option>40GP</option><option selected>40HQ</option></select></label>
        <label class="field"><span>Valor aproximado de productos</span><input id="qGoods" type="number" min="0" placeholder="0"></label>
        <label class="field"><span>Moneda de los productos</span><select id="qCurrency"><option value="USD">USD</option><option value="RMB">RMB / CNY</option></select></label>
        <label class="field"><span>Volumen estimado (m³)</span><input id="qCbm" type="number" min="0" step="0.01" placeholder="0"></label>
        <label class="field"><span>Puerto o ciudad de origen</span><input id="qOrigin" placeholder="Ningbo, Shanghai, Qingdao..."></label>
        <div class="cbm-helper" style="grid-column:1/-1">
          <button type="button" class="cbm-helper-toggle" data-cbm-helper-toggle>¿No sabes el CBM? Calcúlalo con las medidas de tus cajas</button>
          <div class="cbm-helper-fields hidden form-grid" data-cbm-helper-fields>
            <label class="field"><span>Largo (cm)</span><input type="number" min="0" placeholder="0" data-box-length></label>
            <label class="field"><span>Ancho (cm)</span><input type="number" min="0" placeholder="0" data-box-width></label>
            <label class="field"><span>Alto (cm)</span><input type="number" min="0" placeholder="0" data-box-height></label>
            <label class="field"><span>Cantidad de cajas</span><input type="number" min="1" placeholder="0" data-box-count></label>
          </div>
        </div>
        <label class="service-option" style="grid-column:1/-1">
          <input id="qIncludeSourcing" type="checkbox">
          <span><strong>Necesito búsqueda de proveedor y gestión de compra</strong><small>Solo al marcar esta opción se agrega este servicio a tu cotización. El detalle del cargo aparece en tu estimación y en el PDF.</small></span>
        </label>
      </div>`
  },
  quality: {
    title: "Cotizar control de calidad",
    badge: "Cotización personalizada",
    html: `
      <div class="service-field-panel form-grid">
        <label class="field"><span>Ciudad de la inspección *</span><input id="qCity" required placeholder="Yiwu, Guangzhou, Foshan..."></label>
        <label class="field"><span>Tipo de inspección</span><select id="qInspection"><option>Preembarque</option><option>Durante producción</option><option>Supervisión de carga</option><option>Videollamada</option><option>Auditoría de fábrica</option></select></label>
        <label class="field"><span>Cantidad de referencias</span><input id="qReferences" type="number" min="1" value="1"></label>
        <label class="field"><span>Fecha requerida</span><input id="qDate" type="date"></label>
        <label class="field" style="grid-column:1/-1"><span>Qué necesitas revisar</span><textarea id="qScope" rows="3" placeholder="Conteo, funcionamiento, medidas, empaque, etiquetas, color..."></textarea></label>
      </div>`
  },
  sourcing: {
    title: "Buscar proveedor en China",
    badge: `Depósito desde ${money(CONFIG.sourcing.startingDepositUsd)}`,
    html: `
      <div class="service-field-panel form-grid">
        <label class="field"><span>Cantidad aproximada</span><input id="qQuantity" type="number" min="1" placeholder="0"></label>
        <label class="field"><span>Presupuesto estimado (USD)</span><input id="qBudget" type="number" min="0" placeholder="0"></label>
        <label class="field"><span>¿Necesitas logo o empaque?</span><select id="qCustom"><option>No</option><option>Logo</option><option>Empaque</option><option>Producto y empaque</option></select></label>
        <label class="field"><span>Calidad esperada</span><select id="qQuality"><option>Económica</option><option>Media</option><option>Alta</option><option>No lo sé</option></select></label>
      </div>`
  },
  trip: {
    title: "Cotizar viaje de negocios a China",
    badge: "Cotización personalizada",
    html: `
      <div class="service-field-panel form-grid">
        <label class="field"><span>Fecha aproximada</span><input id="qTripDate" type="date"></label>
        <label class="field"><span>Cantidad de días *</span><input id="qDays" type="number" min="1" value="1" required></label>
        <label class="field"><span>Ciudades</span><input id="qCities" placeholder="Yiwu, Guangzhou, Foshan..."></label>
        <label class="field"><span>Cantidad de viajeros</span><input id="qTravelers" type="number" min="1" value="1"></label>
      </div>`
  },
  translation: {
    title: "Cotizar traducción y negociación",
    badge: "Cotización personalizada",
    html: `
      <div class="service-field-panel form-grid">
        <label class="field"><span>Modalidad</span><select id="qTranslationMode"><option>Remota</option><option>Presencial en China</option></select></label>
        <label class="field"><span>Duración aproximada</span><input id="qDuration" type="number" min="1" value="1"></label>
        <label class="field"><span>Unidad</span><select id="qDurationUnit"><option>Horas</option><option>Días</option></select></label>
        <label class="field"><span>Ciudad, si es presencial</span><input id="qTranslationCity" placeholder="Ciudad"></label>
      </div>`
  },
  advisory: {
    title: "Asesoría + revisión + cotización",
    badge: `Pago inicial ${money(CONFIG.advisory.startingPriceUsd)}`,
    html: `
      <div class="service-field-panel form-grid">
        <label class="field"><span>Presupuesto estimado (USD)</span><input id="qBudget" type="number" min="0" placeholder="0"></label>
        <label class="field"><span>¿Has importado antes?</span><select id="qExperience"><option>No</option><option>Sí, una vez</option><option>Sí, varias veces</option></select></label>
      </div>`
  }
};

function setupBusinessLinks(){
  const wa = CONFIG.business.whatsapp;
  document.querySelectorAll("[data-whatsapp-message]").forEach(a=>{
    const message = a.dataset.whatsappMessage || "";
    a.href = `https://wa.me/${wa}?text=${encodeURIComponent(message)}`;
  });
  document.querySelectorAll("[data-instagram-link]").forEach(a=>a.href=CONFIG.business.instagram);
  document.querySelectorAll("[data-tiktok-link]").forEach(a=>a.href=CONFIG.business.tiktok);
  document.querySelectorAll("[data-email-link]").forEach(a=>{
    a.href=`mailto:${CONFIG.business.email}`;
    if(!a.textContent.trim()) a.textContent=CONFIG.business.email;
  });
  document.querySelectorAll("[data-business-city]").forEach(e=>e.textContent=CONFIG.business.city);
  const trend=CHELME_PRICING.exchangeTrend(CONFIG);
  if($("fxCommercialRate"))$("fxCommercialRate").textContent=CONFIG.exchange.commercialRmbPerUsd.toFixed(4);
  if($("fxReferenceRate"))$("fxReferenceRate").textContent=`${CONFIG.exchange.referenceRmbPerUsd.toFixed(4)} RMB/USD`;
  if($("fxUpdatedAt"))$("fxUpdatedAt").textContent=CONFIG.exchange.updatedAt;
  if($("fxTrendText"))$("fxTrendText").textContent=`${trend.usdText} (${trend.percent>=0?"+":""}${trend.percent.toFixed(2)}%)`;
  if($("paidAdvisoryPrice"))$("paidAdvisoryPrice").textContent=money(CONFIG.advisory.startingPriceUsd);
  if($("transferAmount"))$("transferAmount").textContent=money(CONFIG.payment.amountUsd);
  if($("advisoryStartingPrice"))$("advisoryStartingPrice").textContent=`Desde ${money(CONFIG.advisory.startingPriceUsd)}`;
  document.querySelectorAll("[data-instagram-handle]").forEach(e=>e.textContent=CONFIG.business.instagramHandle);
  document.querySelectorAll("[data-tiktok-handle]").forEach(e=>e.textContent=CONFIG.business.tiktokHandle);
}

let activeGalleryFilter = "all";
let visibleGalleryItems = [];
let currentLightboxIndex = 0;

function renderGallery(filter = activeGalleryFilter){
  activeGalleryFilter = filter;
  const grid = $("galleryGrid");
  visibleGalleryItems = CONFIG.gallery.filter(item => filter === "all" || item.category === filter);

  grid.innerHTML = visibleGalleryItems.map((item, index)=>`
    <button class="gallery-card" type="button" data-gallery-index="${index}" aria-label="Abrir fotografía: ${item.title}">
      <img src="${item.src}" alt="${item.title}" loading="lazy" width="900" height="1200">
      <div class="gallery-copy">
        <span>${item.label}</span>
        <h3>${item.title}</h3>
        <p>${item.text}</p>
      </div>
    </button>`).join("");

  grid.querySelectorAll("[data-gallery-index]").forEach(button => {
    button.addEventListener("click", () => openLightbox(Number(button.dataset.galleryIndex)));
  });
}

function setGalleryFilter(filter){
  document.querySelectorAll("[data-gallery-filter]").forEach(button => {
    button.classList.toggle("active", button.dataset.galleryFilter === filter);
  });
  renderGallery(filter);
}

function openLightbox(index){
  currentLightboxIndex = index;
  updateLightbox();
  $("galleryLightbox").classList.remove("hidden");
  document.body.classList.add("lightbox-open");
}

function closeLightbox(){
  $("galleryLightbox").classList.add("hidden");
  document.body.classList.remove("lightbox-open");
}

function changeLightbox(step){
  if (!visibleGalleryItems.length) return;
  currentLightboxIndex = (currentLightboxIndex + step + visibleGalleryItems.length) % visibleGalleryItems.length;
  updateLightbox();
}

function updateLightbox(){
  const item = visibleGalleryItems[currentLightboxIndex];
  if (!item) return;
  $("lightboxImage").src = item.src;
  $("lightboxImage").alt = item.title;
  $("lightboxCategory").textContent = item.label;
  $("lightboxTitle").textContent = item.title;
  $("lightboxText").textContent = item.text;
}

function setService(service){
  state.quoteService = service;
  document.querySelectorAll("[data-quote-service]").forEach(b=>b.classList.toggle("active",b.dataset.quoteService===service));
  const data = services[service];
  $("quoteTitle").textContent=data.title;
  $("quoteBadge").textContent=data.badge;
  const submitBtnText=$("quoteSubmitBtnText");
  if(submitBtnText){
    submitBtnText.textContent=service==="fcl"?"Solicitar cotización FCL":"Revisar solicitud";
  }
  $("serviceFields").innerHTML=data.html;
  $("serviceFields").querySelectorAll("input,select,textarea").forEach(el=>{
    el.addEventListener("input",updateEstimate);
    el.addEventListener("change",updateEstimate);
  });
  wireCbmHelper();
  updateEstimate();
}

function wireCbmHelper(){
  const toggle=document.querySelector("[data-cbm-helper-toggle]");
  const fields=document.querySelector("[data-cbm-helper-fields]");
  if(!toggle||!fields)return;
  toggle.addEventListener("click",()=>fields.classList.toggle("hidden"));
  const recompute=()=>{
    const l=Number(document.querySelector("[data-box-length]")?.value)||0;
    const w=Number(document.querySelector("[data-box-width]")?.value)||0;
    const h=Number(document.querySelector("[data-box-height]")?.value)||0;
    const count=Number(document.querySelector("[data-box-count]")?.value)||0;
    const cbmField=$("qCbm");
    if(l>0&&w>0&&h>0&&count>0&&cbmField){
      cbmField.value=((l*w*h/1_000_000)*count).toFixed(3);
      updateEstimate();
    }
  };
  fields.querySelectorAll("input").forEach(i=>i.addEventListener("input",recompute));
}

function setSourceMode(mode){
  state.sourceMode=mode;
  state.quoteFiles=[];
  document.querySelectorAll("[data-source-mode]").forEach(b=>b.classList.toggle("active",b.dataset.sourceMode===mode));
  const wrap=$("sourceFields");
  const maxFiles=CONFIG.publicCalculator.maxFilesPerRequest||10;

  if(mode==="link"){
    wrap.innerHTML=`<div class="source-panel form-grid">
      <label class="field" style="grid-column:1/-1"><span>Enlace del producto *</span><input id="sourceLink" type="url" required placeholder="Pega un enlace de 1688, Alibaba u otro proveedor"></label>
      <label class="field"><span>Nombre del producto</span><input id="sourceProductName" placeholder="Ej.: lámpara solar"></label>
      <label class="field"><span>Cantidad aproximada</span><input id="sourceQuantity" type="number" min="1" placeholder="0"></label>
    </div>`;
  }else if(mode==="photos"){
    wrap.innerHTML=`<div class="source-panel">
      <label class="photo-drop">
        <svg><use href="#i-camera"></use></svg>
        <strong>Subir fotografías del producto</strong>
        <span>Máximo ${maxFiles} imágenes</span>
        <input id="sourceFiles" type="file" accept="image/*" multiple>
      </label>
      <div class="photo-preview" id="photoPreview"></div>
      <div class="form-grid" style="margin-top:15px">
        <label class="field"><span>¿Qué producto parece ser?</span><input id="sourceProductName" placeholder="Ej.: máquina expendedora de agua"></label>
        <label class="field"><span>Cantidad aproximada</span><input id="sourceQuantity" type="number" min="1" placeholder="0"></label>
        <label class="field"><span>Número de productos o referencias</span><input id="sourceReferences" type="number" min="1" value="1"></label>
      </div>
    </div>`;
    $("sourceFiles").addEventListener("change",handleSourceFiles);
  }else if(mode==="bulk"){
    wrap.innerHTML=`<div class="source-panel">
      <label class="photo-drop">
        <svg><use href="#i-file"></use></svg>
        <strong>Subir lista completa</strong>
        <span>Excel, CSV, PDF, Word o imágenes · máximo ${maxFiles} archivos</span>
        <input id="sourceFiles" type="file" accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,image/*" multiple>
      </label>
      <div class="file-list" id="fileList"></div>
      <div class="form-grid" style="margin-top:15px">
        <label class="field"><span>Número aproximado de productos o referencias *</span><input id="sourceReferences" required type="number" min="1" placeholder="Ej.: 35"></label>
        <label class="field"><span>Cantidad de proveedores</span><input id="sourceSuppliers" type="number" min="1" placeholder="0"></label>
        <label class="field"><span>Valor total aproximado (USD)</span><input id="sourceBulkGoods" type="number" min="0" placeholder="0"></label>
        <label class="field"><span>CBM total, si lo conoces</span><input id="sourceBulkCbm" type="number" min="0" step="0.01" placeholder="0"></label>
        <label class="field" style="grid-column:1/-1"><span>Pega aquí parte de la lista, si no tienes archivo</span><textarea id="sourceBulkList" rows="5" placeholder="Producto 1 - cantidad...&#10;Producto 2 - cantidad..."></textarea></label>
      </div>
      <p class="bulk-help">No se cobra por la cantidad de referencias. Los productos adicionales pueden aumentar el trabajo de revisión, pero cualquier cargo se confirma antes de comenzar.</p>
    </div>`;
    $("sourceFiles").addEventListener("change",handleSourceFiles);
  }else{
    wrap.innerHTML=`<div class="source-panel form-grid">
      <label class="field" style="grid-column:1/-1"><span>Describe el producto *</span><textarea id="sourceDescription" required rows="4" placeholder="Qué producto es, para qué sirve, material, tamaño, color, calidad o cualquier detalle que recuerdes."></textarea></label>
      <label class="field"><span>Cantidad aproximada</span><input id="sourceQuantity" type="number" min="1" placeholder="0"></label>
      <label class="field"><span>Número de productos o referencias</span><input id="sourceReferences" type="number" min="1" value="1"></label>
      <label class="field"><span>Presupuesto aproximado (USD)</span><input id="sourceBudget" type="number" min="0" placeholder="0"></label>
    </div>`;
  }

  wrap.querySelectorAll("input,textarea").forEach(el=>el.addEventListener("input",updateEstimate));
  updateFileHelp();
}

function handleSourceFiles(event){
  const maxFiles=CONFIG.publicCalculator.maxFilesPerRequest||10;
  state.quoteFiles=[...event.target.files].slice(0,maxFiles);
  renderSourceFiles();
  updateFileHelp();
}

function renderSourceFiles(){
  const photoPreview=$("photoPreview");
  const fileList=$("fileList");

  if(photoPreview){
    photoPreview.innerHTML="";
    state.quoteFiles.forEach((file,index)=>{
      if(!file.type.startsWith("image/"))return;
      const url=URL.createObjectURL(file);
      const item=document.createElement("div");
      item.className="photo-preview-item";
      item.innerHTML=`<img src="${url}" alt="Foto ${index+1}"><button type="button" aria-label="Eliminar">×</button>`;
      item.querySelector("button").addEventListener("click",()=>removeSourceFile(index));
      photoPreview.appendChild(item);
    });
  }

  if(fileList){
    fileList.innerHTML="";
    state.quoteFiles.forEach((file,index)=>{
      const item=document.createElement("div");
      item.className="file-list-item";
      item.innerHTML=`<span>${escapeText(file.name)} · ${formatFileSize(file.size)}</span><button type="button" aria-label="Eliminar">×</button>`;
      item.querySelector("button").addEventListener("click",()=>removeSourceFile(index));
      fileList.appendChild(item);
    });
  }
}

function removeSourceFile(index){
  state.quoteFiles.splice(index,1);
  renderSourceFiles();
  updateFileHelp();
}

function formatFileSize(bytes){
  if(bytes<1024)return `${bytes} B`;
  if(bytes<1024*1024)return `${Math.round(bytes/1024)} KB`;
  return `${(bytes/(1024*1024)).toFixed(1)} MB`;
}

function escapeText(value){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function updateFileHelp(){
  const help=$("photoSendHelp");
  if(!["photos","bulk"].includes(state.sourceMode)){
    help.textContent="";
    return;
  }
  const kind=state.sourceMode==="photos"?"foto(s)":"archivo(s)";
  help.textContent=state.quoteFiles.length
    ? `${state.quoteFiles.length} ${kind} seleccionado(s). En celular compatible se intentará compartirlos. En computador deberás adjuntarlos manualmente en WhatsApp.`
    : state.sourceMode==="photos"
      ? "Selecciona las fotos antes de enviar. No necesitas tener un enlace."
      : "Puedes subir un archivo o pegar la lista directamente en el formulario.";
}
function renderBreakdown(targetId, title, rows, note=""){
  const box=$(targetId);
  if(!rows.length){
    box.innerHTML="";
    box.classList.add("hidden");
    return;
  }
  box.classList.remove("hidden");
  box.innerHTML=`
    <div class="cost-breakdown-header"><span>${title}</span><span>USD</span></div>
    ${rows.map(row=>`
      <div class="cost-breakdown-row ${row.pending?"pending":""} ${row.total?"total":""}">
        <span>${row.label}</span>
        <strong>${row.value}</strong>
      </div>`).join("")}
    ${note?`<div class="cost-breakdown-note">${note}</div>`:""}
  `;
}

function originalGoodsText(amount,currency){
  if(!amount)return "No ingresada";
  return currency==="RMB"
    ? `${new Intl.NumberFormat("es-CL",{maximumFractionDigits:2}).format(amount)} RMB`
    : money(amount);
}

function updateEstimate(){
  const service=state.quoteService;
  let totalText="Cotización personalizada";
  let note="Enviaremos la información para revisión y confirmación.";
  const rows=[];

  if(service==="lcl"){
    const goodsAmount=val("qGoods");
    const goodsCurrency=$("qCurrency")?.value||"USD";
    const cbm=val("qCbm");
    const includeSourcing=Boolean($("qIncludeSourcing")?.checked);
    const result=CHELME_PRICING.calculateLcl({
      goodsAmount,
      goodsCurrency,
      cbm,
      includeSourcing
    },CONFIG);

    if(cbm>0){
      rows.push({label:`Mercancía ingresada (${goodsCurrency})`,value:originalGoodsText(goodsAmount,goodsCurrency),pending:goodsAmount<=0});
      if(goodsCurrency==="RMB"&&goodsAmount>0){
        rows.push({label:`Equivalente usando ${CONFIG.exchange.commercialRmbPerUsd.toFixed(4)} RMB/USD`,value:money(result.goodsUsd)});
      }
      rows.push({label:"Volumen real informado",value:`${fmt(result.actualCbm,2)} m³`});
      rows.push({label:"Volumen facturable",value:`${fmt(result.billableCbm,2)} m³`});
      if(result.minimumApplied){
        rows.push({label:"Mínimo de facturación aplicado",value:`${fmt(result.minimumBillableCbm,2)} m³`,pending:true});
      }
      rows.push({label:`Flete consolidado (${fmt(result.billableCbm,2)} m³ × ${money(result.baseRate)})`,value:money(result.baseFreight)});
      if(result.smallCargo){
        rows.push({label:`Cargo operativo por carga bajo ${CONFIG.lcl.smallCargoThresholdCbm} m³ (fijo)`,value:money(result.smallCargoExtra)});
      }
      rows.push({
        label:`Búsqueda y gestión de compra (${CONFIG.lcl.sourcingPercent}%)`,
        value:includeSourcing
          ? (result.sourcing!==null?money(result.sourcing):"Pendiente")
          : "No seleccionada",
        pending:includeSourcing&&result.sourcing===null
      });

      if(goodsAmount>0){
        totalText=money(result.operationTotalKnown);
        rows.push({label:"Estimado total (incluye tu mercancía)",value:money(result.operationTotalKnown),total:true});
      }else{
        totalText=money(result.logistics);
        rows.push({label:"Logística conocida",value:money(result.logistics),total:true});
      }

      note=`Esta cotización no tiene costo. El valor de mercancía es el que tú informaste: lo confirmamos junto a tu proveedor antes del precio final. Envíala por WhatsApp o descarga el PDF. Los impuestos y gastos de destino se pagan al llegar.`;
    }else{
      totalText=`Desde ${money(CONFIG.lcl.ratePerCbmUsd)}/m³`;
      note=`Mínimo facturable: ${CONFIG.lcl.minimumBillableCbm} m³. Bajo ${CONFIG.lcl.smallCargoThresholdCbm} m³ se agrega el cargo operativo.`;
    }
  }else if(service==="fcl"){
    const container=$("qContainer")?.value||"40HQ";
    const goodsAmount=val("qGoods");
    const goodsCurrency=$("qCurrency")?.value||"USD";
    const includeSourcing=Boolean($("qIncludeSourcing")?.checked);
    const result=CHELME_PRICING.calculateFcl({
      goodsAmount,
      goodsCurrency,
      container,
      includeSourcing
    },CONFIG);

    rows.push({label:`Mercancía ingresada (${goodsCurrency})`,value:originalGoodsText(goodsAmount,goodsCurrency),pending:goodsAmount<=0});
    if(goodsCurrency==="RMB"&&goodsAmount>0){
      rows.push({label:`Equivalente usando ${CONFIG.exchange.commercialRmbPerUsd.toFixed(4)} RMB/USD`,value:money(result.goodsUsd)});
    }
    rows.push({label:"Búsqueda y gestión de compra",value:"Se confirma en la propuesta"});
    rows.push({label:"Gastos operativos en China",value:"Sujeto a cotización"});
    rows.push({label:`Flete marítimo (${container})`,value:"Cotización vigente requerida"});

    totalText="Total pendiente de cotización personalizada";
    rows.push({label:"Total",value:"Total pendiente de cotización personalizada",total:true});
    note=`Esta simulación inicial es gratuita y no constituye una cotización definitiva. El flete marítimo, los gastos operativos en China, los costos en destino, los impuestos y los servicios adicionales se confirman mediante una cotización personalizada y vigente.`;
  }else if(service==="sourcing"){
    totalText=`Asesoría inicial ${money(CONFIG.advisory.startingPriceUsd)}`;
    note=`Después de la asesoría, la búsqueda y gestión de compra se cotizan según el alcance.`;
  }else if(service==="advisory"){
    totalText=`${money(CONFIG.advisory.startingPriceUsd)}`;
    note="Incluye revisión, estimación inicial y cotización preliminar. El pago se confirma antes de comenzar.";
  }

  state.quoteBreakdown=rows.map(row=>`${row.label}: ${row.value}`);
  $("quoteEstimate").textContent=totalText;
  $("quoteEstimateNote").textContent=note;
  renderBreakdown("quoteBreakdown","Desglose transparente",rows,note);
}
function fieldLabel(el){
  const fieldSpan=el.closest(".field")?.querySelector("span");
  if(fieldSpan)return fieldSpan.textContent.trim();
  const optionText=el.closest("label")?.querySelector("strong");
  if(optionText)return optionText.textContent.trim();
  return el.id;
}

function collectFields(root){
  const lines=[];
  root.querySelectorAll("input,select,textarea").forEach(el=>{
    if(el.type==="file")return;
    const label=fieldLabel(el);
    if(el.type==="checkbox"){
      lines.push(`${label}: ${el.checked?"Sí":"No"}`);
      return;
    }
    if(!el.value?.trim())return;
    lines.push(`${label}: ${el.value.trim()}`);
  });
  return lines;
}

function firstMissingRequired(root){
  const fields=[...root.querySelectorAll("[required]")];
  return fields.find(field=>{
    if(field.type==="checkbox")return !field.checked;
    return !String(field.value||"").trim();
  })||null;
}

function createQuoteReference(){
  const now=new Date();
  const date=[now.getFullYear(),String(now.getMonth()+1).padStart(2,"0"),String(now.getDate()).padStart(2,"0")].join("");
  const token=Math.random().toString(36).slice(2,6).toUpperCase();
  return `CGT-${date}-${token}`;
}
function getSelectedSourcingStatus(){
  const box=$("qIncludeSourcing");
  if(!box)return "No aplica";
  return box.checked?"Sí, necesita búsqueda y gestión":"No, ya tiene proveedor";
}
function renderQuotePreview(items){
  $("quoteReference").textContent=state.preparedQuoteReference;
  $("quotePreviewGrid").innerHTML=items.map(([label,value])=>`<div class="quote-preview-item"><span>${escapeText(label)}</span><strong>${escapeText(value)}</strong></div>`).join("");
  $("quotePreview").classList.remove("hidden");
  $("quotePreview").scrollIntoView({behavior:"smooth",block:"center"});
}
async function sendPreparedQuote(){
  const text=state.preparedQuoteText,files=state.preparedQuoteFiles;
  if(files.length&&navigator.share&&navigator.canShare){
    try{const data={title:"Solicitud Chelme Global Trade",text,files};if(navigator.canShare(data)){await navigator.share(data);return;}}catch(error){if(error.name==="AbortError")return;}
  }
  window.open(`https://wa.me/${CONFIG.business.whatsapp}?text=${encodeURIComponent(text)}`,"_blank","noopener");
  if(files.length){$("quoteAlert").textContent="WhatsApp está abierto. Adjunta los archivos seleccionados antes de enviar.";$("quoteAlert").classList.remove("hidden");}
}

async function submitQuote(event){
  event.preventDefault();
  $("quoteAlert").classList.add("hidden");
  const missing=firstMissingRequired($("quoteForm"));
  if(missing){const label=missing.closest(".field")?.querySelector("span")?.textContent||"un campo obligatorio";$("quoteAlert").textContent=`Completa: ${label.replace("*","").trim()}.`;$("quoteAlert").classList.remove("hidden");missing.focus();return;}
  if(state.sourceMode==="photos"&&state.quoteFiles.length===0){$("quoteAlert").textContent="Selecciona al menos una fotografía.";$("quoteAlert").classList.remove("hidden");return;}
  if(state.sourceMode==="bulk"){const pasted=$("sourceBulkList")?.value.trim()||"";if(state.quoteFiles.length===0&&!pasted){$("quoteAlert").textContent="Sube una lista o pega los productos en el campo disponible.";$("quoteAlert").classList.remove("hidden");return;}}
  const name=$("quoteName").value.trim(),destination=$("quoteDestination").value.trim(),phone=$("quoteClientWhatsapp").value.trim()||"No informado";
  const modeNames={link:"Enlace",photos:"Fotografías",description:"Descripción",bulk:"Lista de productos"};
  const sourceLines=collectFields($("sourceFields")),serviceLines=collectFields($("serviceFields"));
  const serviceTitle=services[state.quoteService].title,result=$("quoteEstimate").textContent,sourcingStatus=getSelectedSourcingStatus();
  state.preparedQuoteReference=createQuoteReference();state.preparedQuoteFiles=[...state.quoteFiles];
  const concise=[...sourceLines.slice(0,4),...serviceLines.slice(0,5)];
  const requiresAdvisory=["sourcing","advisory"].includes(state.quoteService);
  state.preparedQuoteText=["SOLICITUD CHELME GLOBAL TRADE",`Referencia: ${state.preparedQuoteReference}`,`Servicio: ${serviceTitle}`,`Cliente: ${name}`,`Destino: ${destination}`,`WhatsApp cliente: ${phone}`,`Información disponible: ${modeNames[state.sourceMode]}`,`Proveedor / búsqueda: ${sourcingStatus}`,...concise,`Resultado mostrado: ${result}`,state.quoteFiles.length?`Archivos para adjuntar: ${state.quoteFiles.length}`:"",$("quoteNotes").value.trim()?`Comentarios: ${$("quoteNotes").value.trim()}`:"","",requiresAdvisory?`Asesoría inicial: ${money(CONFIG.advisory.startingPriceUsd)}`:"Esta cotización no tiene costo.",requiresAdvisory?"La revisión comienza después de confirmar la asesoría.":"Quedamos atentos para confirmar por WhatsApp.","Impuestos y gastos de destino se confirman por separado."].filter(Boolean).join("\n");
  renderQuotePreview([["Referencia",state.preparedQuoteReference],["Servicio",serviceTitle],["Cliente",name],["Destino",destination],["Información",modeNames[state.sourceMode]],["Búsqueda",sourcingStatus],["Resultado mostrado",result],[requiresAdvisory?"Asesoría inicial":"Costo de esta cotización",requiresAdvisory?money(CONFIG.advisory.startingPriceUsd):"Sin costo"]]);
}
function selectServiceAndScroll(service){
  setService(service);
  const target=$("quoteShell")||$("cotizar");
  target.scrollIntoView({behavior:"smooth",block:"start"});
}

function init(){
  setupBusinessLinks();
  renderGallery();

  document.querySelectorAll("[data-gallery-filter]").forEach(button => {
    button.addEventListener("click", () => setGalleryFilter(button.dataset.galleryFilter));
  });
  $("lightboxClose").addEventListener("click", closeLightbox);
  $("lightboxPrev").addEventListener("click", () => changeLightbox(-1));
  $("lightboxNext").addEventListener("click", () => changeLightbox(1));
  $("galleryLightbox").addEventListener("click", event => {
    if (event.target === $("galleryLightbox")) closeLightbox();
  });
  document.addEventListener("keydown", event => {
    if ($("galleryLightbox").classList.contains("hidden")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") changeLightbox(-1);
    if (event.key === "ArrowRight") changeLightbox(1);
  });

  $("menuToggle").addEventListener("click",()=>$("mainNav").classList.toggle("open"));
  $("mainNav").querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>$("mainNav").classList.remove("open")));
  const navServices=$("navServices");
  if(navServices){
    navServices.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{navServices.open=false;}));
  }

  document.querySelectorAll("[data-service-button]").forEach(a=>{
    a.addEventListener("click",e=>{
      e.preventDefault();
      selectServiceAndScroll(a.dataset.serviceButton);
    });
  });
  document.querySelectorAll("[data-quote-service]").forEach(b=>b.addEventListener("click",()=>setService(b.dataset.quoteService)));
  document.querySelectorAll("[data-source-mode]").forEach(b=>b.addEventListener("click",()=>setSourceMode(b.dataset.sourceMode)));

  $("quoteForm").addEventListener("submit",submitQuote);
  $("confirmQuoteWhatsapp").addEventListener("click",sendPreparedQuote);
  $("editQuotePreview").addEventListener("click",()=>{$("quotePreview").classList.add("hidden");$("quoteForm").scrollIntoView({behavior:"smooth",block:"start"});});
  $("clearQuote").addEventListener("click",()=>{
    $("quoteForm").reset();
    $("quotePreview").classList.add("hidden");
    state.preparedQuoteText="";state.preparedQuoteFiles=[];state.preparedQuoteReference="";
    setSourceMode(state.sourceMode);
    setService(state.quoteService);
  });
  setSourceMode("link");
  setService("lcl");
}

init();
