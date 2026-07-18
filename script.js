const CONFIG = window.CHELME_CONFIG;
const $ = (id) => document.getElementById(id);
const money = (value) => new Intl.NumberFormat("es-CL",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(Number(value)||0);
const fmt = (value, decimals=2) => new Intl.NumberFormat("es-CL",{minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(Number(value)||0);
const val = (id) => Number.parseFloat($(id)?.value)||0;

const state = {
  quoteService: "lcl",
  sourceMode: "link",
  quoteFiles: [],
  calcMode: "photos"
};

const services = {
  lcl: {
    title: "Cotizar carga consolidada",
    badge: "Estimación disponible",
    html: `
      <div class="service-field-panel form-grid">
        <label class="field"><span>Valor aproximado de productos (USD)</span><input id="qGoods" type="number" min="0" placeholder="0"></label>
        <label class="field"><span>Volumen, si lo conoces (m³)</span><input id="qCbm" type="number" min="0" step="0.01" placeholder="0"></label>
        <label class="field"><span>Cantidad aproximada</span><input id="qQuantity" type="number" min="1" placeholder="0"></label>
        <label class="field"><span>Cantidad de proveedores</span><input id="qSuppliers" type="number" min="1" value="1"></label>
      </div>`
  },
  fcl: {
    title: "Cotizar contenedor completo",
    badge: "Estimación disponible",
    html: `
      <div class="service-field-panel form-grid">
        <label class="field"><span>Contenedor</span><select id="qContainer"><option>20GP</option><option>40GP</option><option selected>40HQ</option></select></label>
        <label class="field"><span>Valor aproximado de productos (USD)</span><input id="qGoods" type="number" min="0" placeholder="0"></label>
        <label class="field"><span>Volumen estimado (m³)</span><input id="qCbm" type="number" min="0" step="0.01" placeholder="0"></label>
        <label class="field"><span>Puerto o ciudad de origen</span><input id="qOrigin" placeholder="Ningbo, Shanghai, Qingdao..."></label>
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
    title: "Reservar asesoría",
    badge: `Desde ${money(CONFIG.advisory.startingPriceUsd)}`,
    html: `
      <div class="service-field-panel form-grid">
        <label class="field"><span>Presupuesto estimado (USD)</span><input id="qBudget" type="number" min="0" placeholder="0"></label>
        <label class="field"><span>¿Has importado antes?</span><select id="qExperience"><option>No</option><option>Sí, una vez</option><option>Sí, varias veces</option></select></label>
      </div>`
  },
  packaging: {
    title: "Cotizar etiquetado y marca privada",
    badge: "Cotización personalizada",
    html: `
      <div class="service-field-panel form-grid">
        <label class="field"><span>Cantidad aproximada</span><input id="qQuantity" type="number" min="1" placeholder="0"></label>
        <label class="field"><span>Servicio</span><select id="qPackaging"><option>Etiquetas</option><option>Shipping marks</option><option>Código de barras</option><option>Empaque personalizado</option><option>Marca privada completa</option></select></label>
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
  $("serviceFields").innerHTML=data.html;
  $("serviceFields").querySelectorAll("input,select,textarea").forEach(el=>{
    el.addEventListener("input",updateEstimate);
    el.addEventListener("change",updateEstimate);
  });
  updateEstimate();
}

function setSourceMode(mode){
  state.sourceMode=mode;
  state.quoteFiles=[];
  document.querySelectorAll("[data-source-mode]").forEach(b=>b.classList.toggle("active",b.dataset.sourceMode===mode));
  const wrap=$("sourceFields");
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
        <span>Máximo 5 imágenes · JPG, PNG o HEIC compatible con el navegador</span>
        <input id="sourcePhotos" type="file" accept="image/*" multiple>
      </label>
      <div class="photo-preview" id="photoPreview"></div>
      <div class="form-grid" style="margin-top:15px">
        <label class="field"><span>¿Qué producto parece ser?</span><input id="sourceProductName" placeholder="Ej.: máquina expendedora de agua"></label>
        <label class="field"><span>Cantidad aproximada</span><input id="sourceQuantity" type="number" min="1" placeholder="0"></label>
      </div>
    </div>`;
    $("sourcePhotos").addEventListener("change",handlePhotos);
  }else{
    wrap.innerHTML=`<div class="source-panel form-grid">
      <label class="field" style="grid-column:1/-1"><span>Describe el producto *</span><textarea id="sourceDescription" required rows="4" placeholder="Qué producto es, para qué sirve, material, tamaño, color, calidad o cualquier detalle que recuerdes."></textarea></label>
      <label class="field"><span>Cantidad aproximada</span><input id="sourceQuantity" type="number" min="1" placeholder="0"></label>
      <label class="field"><span>Presupuesto aproximado (USD)</span><input id="sourceBudget" type="number" min="0" placeholder="0"></label>
    </div>`;
  }
  wrap.querySelectorAll("input,textarea").forEach(el=>el.addEventListener("input",updateEstimate));
  updatePhotoHelp();
}

function handlePhotos(event){
  const all=[...event.target.files].filter(f=>f.type.startsWith("image/")).slice(0,5);
  state.quoteFiles=all;
  renderPhotoPreview();
  updatePhotoHelp();
}

function renderPhotoPreview(){
  const preview=$("photoPreview");
  if(!preview)return;
  preview.innerHTML="";
  state.quoteFiles.forEach((file,index)=>{
    const url=URL.createObjectURL(file);
    const item=document.createElement("div");
    item.className="photo-preview-item";
    item.innerHTML=`<img src="${url}" alt="Foto ${index+1}"><button type="button" aria-label="Eliminar">×</button>`;
    item.querySelector("button").addEventListener("click",()=>{
      state.quoteFiles.splice(index,1);
      renderPhotoPreview();
      updatePhotoHelp();
    });
    preview.appendChild(item);
  });
}

function updatePhotoHelp(){
  const help=$("photoSendHelp");
  if(state.sourceMode!=="photos"){
    help.textContent="";
    return;
  }
  help.textContent=state.quoteFiles.length
    ? `${state.quoteFiles.length} foto(s) lista(s). En un celular compatible se abrirá el menú para compartirlas. En computador, WhatsApp se abrirá con el mensaje y deberás adjuntar las fotos manualmente.`
    : "Selecciona las fotos antes de enviar. No necesitas tener un enlace.";
}

function updateEstimate(){
  const service=state.quoteService;
  let totalText="Cotización personalizada";
  let note="Enviaremos la información para revisión y confirmación.";

  if(service==="lcl"){
    const goods=val("qGoods");
    const cbm=val("qCbm");
    if(cbm>0){
      const small=cbm<CONFIG.lcl.smallCargoThresholdCbm;
      const rate=CONFIG.lcl.ratePerCbmUsd+(small?CONFIG.lcl.smallCargoExtraPerCbmUsd:0);
      const management=goods>0?Math.max(goods*CONFIG.lcl.managementPercent/100,CONFIG.lcl.minimumManagementUsd):0;
      const logistics=cbm*rate;
      totalText=money(goods+management+logistics);
      note=`Incluye mercancía ingresada, gestión estimada y ${fmt(cbm,2)} m³ a ${money(rate)}/m³. Impuestos no incluidos.`;
    }else{
      totalText=`Desde ${money(CONFIG.lcl.ratePerCbmUsd)}/m³`;
      note="El total se calcula cuando tengamos el volumen o las medidas del embalaje.";
    }
  }else if(service==="fcl"){
    const container=$("qContainer")?.value||"40HQ";
    const goods=val("qGoods");
    const freight=CONFIG.fcl.oceanFreightUsd[container]||0;
    const management=goods>0?Math.max(goods*CONFIG.fcl.managementPercent/100,CONFIG.fcl.minimumManagementUsd):0;
    if(goods>0||freight>0){
      totalText=money(goods+management+CONFIG.fcl.chinaLocalCostsUsd+freight);
      note=`Estimación para ${container}. Requiere confirmar origen, producto, peso y flete vigente.`;
    }else{
      totalText="Flete por confirmar";
      note=`Gestión desde ${CONFIG.fcl.managementPercent}% sobre el valor de mercancía.`;
    }
  }else if(service==="sourcing"){
    totalText=`Depósito desde ${money(CONFIG.sourcing.startingDepositUsd)}`;
    note="Se revisa el producto, se buscan opciones y se confirma el alcance antes de comenzar.";
  }else if(service==="advisory"){
    totalText=`Desde ${money(CONFIG.advisory.startingPriceUsd)}`;
    note="Incluye evaluación del proyecto, proceso recomendado y próximos pasos.";
  }

  $("quoteEstimate").textContent=totalText;
  $("quoteEstimateNote").textContent=note;
}

function collectFields(root){
  const lines=[];
  root.querySelectorAll("input,select,textarea").forEach(el=>{
    if(el.type==="file"||!el.value?.trim())return;
    const label=el.closest(".field")?.querySelector("span")?.textContent||el.id;
    lines.push(`${label}: ${el.value.trim()}`);
  });
  return lines;
}

async function submitQuote(event){
  event.preventDefault();
  $("quoteAlert").classList.add("hidden");

  const name=$("quoteName").value.trim();
  const destination=$("quoteDestination").value.trim();
  if(!name||!destination){
    $("quoteAlert").textContent="Completa tu nombre y el destino.";
    $("quoteAlert").classList.remove("hidden");
    return;
  }
  if(state.sourceMode==="photos"&&state.quoteFiles.length===0){
    $("quoteAlert").textContent="Selecciona al menos una fotografía.";
    $("quoteAlert").classList.remove("hidden");
    return;
  }

  const modeNames={link:"Enlace",photos:"Fotografías",description:"Descripción"};
  const lines=[
    "SOLICITUD DE COTIZACIÓN — CHELME GLOBAL TRADE",
    "",
    `Servicio: ${services[state.quoteService].title}`,
    `Información disponible: ${modeNames[state.sourceMode]}`,
    `Nombre: ${name}`,
    `Destino: ${destination}`,
    `WhatsApp: ${$("quoteClientWhatsapp").value.trim()||"No informado"}`,
    `Correo: ${$("quoteEmail").value.trim()||"No informado"}`,
    "",
    ...collectFields($("sourceFields")),
    ...collectFields($("serviceFields")),
    $("quoteNotes").value.trim()?`Comentarios: ${$("quoteNotes").value.trim()}`:"",
    state.quoteFiles.length?`Fotografías seleccionadas: ${state.quoteFiles.length} (adjuntas en el chat)`:"",
    "",
    `Estimación mostrada: ${$("quoteEstimate").textContent}`,
    "Entiendo que esta información es referencial y debe ser confirmada."
  ].filter(Boolean);

  const text=lines.join("\n");

  if(state.sourceMode==="photos" && state.quoteFiles.length && navigator.share && navigator.canShare){
    try{
      const shareData={title:"Cotización Chelme Global Trade",text,files:state.quoteFiles};
      if(navigator.canShare(shareData)){
        await navigator.share(shareData);
        return;
      }
    }catch(error){
      if(error.name==="AbortError")return;
    }
  }

  window.open(`https://wa.me/${CONFIG.business.whatsapp}?text=${encodeURIComponent(text)}`,"_blank","noopener");
  if(state.sourceMode==="photos"){
    $("quoteAlert").textContent="WhatsApp está abierto. Ahora adjunta las mismas fotos desde tu galería antes de enviar.";
    $("quoteAlert").classList.remove("hidden");
  }
}

function setCalcMode(mode){
  state.calcMode=mode;
  document.querySelectorAll("[data-calc-mode]").forEach(b=>b.classList.toggle("active",b.dataset.calcMode===mode));
  const wrap=$("simpleCalcFields");
  if(mode==="photos"){
    wrap.innerHTML=`<div class="simple-fields form-grid">
      <label class="field"><span>Cantidad aproximada</span><input id="sQuantity" type="number" min="1" placeholder="0"></label>
      <label class="field"><span>Valor aproximado de la compra (USD)</span><input id="sGoods" type="number" min="0" placeholder="0"></label>
      <label class="field" style="grid-column:1/-1"><span>Producto</span><input id="sProduct" placeholder="Ej.: herramientas, ropa, máquinas..."></label>
    </div>`;
  }else if(mode==="boxes"){
    wrap.innerHTML=`<div class="simple-fields form-grid">
      <label class="field"><span>Número de cajas *</span><input id="sBoxes" type="number" min="1" placeholder="0"></label>
      <label class="field"><span>Valor de productos (USD)</span><input id="sGoods" type="number" min="0" placeholder="0"></label>
      <label class="field"><span>Largo de caja (cm) *</span><input id="sLength" type="number" min="0" placeholder="0"></label>
      <label class="field"><span>Ancho de caja (cm) *</span><input id="sWidth" type="number" min="0" placeholder="0"></label>
      <label class="field"><span>Alto de caja (cm) *</span><input id="sHeight" type="number" min="0" placeholder="0"></label>
      <label class="field"><span>Peso total aproximado (kg)</span><input id="sWeight" type="number" min="0" placeholder="0"></label>
    </div>`;
  }else{
    wrap.innerHTML=`<div class="simple-fields form-grid">
      <label class="field"><span>CBM total *</span><input id="sCbm" type="number" min="0" step="0.01" placeholder="0"></label>
      <label class="field"><span>Valor de productos (USD)</span><input id="sGoods" type="number" min="0" placeholder="0"></label>
      <label class="field"><span>Peso total aproximado (kg)</span><input id="sWeight" type="number" min="0" placeholder="0"></label>
      <label class="field"><span>Cantidad total de unidades</span><input id="sUnits" type="number" min="0" placeholder="0"></label>
    </div>`;
  }
  wrap.querySelectorAll("input").forEach(i=>i.addEventListener("input",updateSimpleCalc));
  updateSimpleCalc();
}

function updateSimpleCalc(){
  if(state.calcMode==="photos"){
    $("simpleTotal").textContent="Necesitamos revisar las fotos";
    $("simpleResultNote").textContent="Sube las imágenes en la cotización online y agrega la cantidad aproximada.";
    $("simpleCbm").textContent="Pendiente";
    $("simpleMethod").textContent="Por revisar";
    $("simpleManagement").textContent="Por revisar";
    $("simpleLogistics").textContent="Por revisar";
    return;
  }

  const goods=val("sGoods");
  let cbm=val("sCbm");
  if(state.calcMode==="boxes"){
    const boxes=val("sBoxes");
    cbm=(val("sLength")*val("sWidth")*val("sHeight")/1_000_000)*boxes;
  }

  if(cbm<=0){
    $("simpleTotal").textContent="Completa los datos";
    $("simpleResultNote").textContent="Necesitamos el CBM o las medidas de las cajas.";
    $("simpleCbm").textContent="0 m³";
    $("simpleMethod").textContent="Pendiente";
    $("simpleManagement").textContent="Pendiente";
    $("simpleLogistics").textContent="Pendiente";
    return;
  }

  const useLcl=cbm<20;
  if(useLcl){
    const small=cbm<CONFIG.lcl.smallCargoThresholdCbm;
    const rate=CONFIG.lcl.ratePerCbmUsd+(small?CONFIG.lcl.smallCargoExtraPerCbmUsd:0);
    const logistics=cbm*rate;
    const management=goods>0?Math.max(goods*CONFIG.lcl.managementPercent/100,CONFIG.lcl.minimumManagementUsd):CONFIG.lcl.minimumManagementUsd;
    const total=goods+management+logistics;
    $("simpleTotal").textContent=money(total);
    $("simpleResultNote").textContent="Estimación preliminar para Consolidado Chelme Global. Impuestos no incluidos.";
    $("simpleCbm").textContent=`${fmt(cbm,2)} m³`;
    $("simpleMethod").textContent="Consolidado LCL";
    $("simpleManagement").textContent=money(management);
    $("simpleLogistics").textContent=money(logistics);
  }else{
    const container=cbm<=28?"20GP":cbm<=58?"40GP":"40HQ";
    const freight=CONFIG.fcl.oceanFreightUsd[container]||0;
    const management=goods>0?Math.max(goods*CONFIG.fcl.managementPercent/100,CONFIG.fcl.minimumManagementUsd):CONFIG.fcl.minimumManagementUsd;
    const total=goods+management+CONFIG.fcl.chinaLocalCostsUsd+freight;
    $("simpleTotal").textContent=freight>0?money(total):"Flete por confirmar";
    $("simpleResultNote").textContent=`Por volumen conviene evaluar un ${container}. La decisión final depende también del peso y producto.`;
    $("simpleCbm").textContent=`${fmt(cbm,2)} m³`;
    $("simpleMethod").textContent=`Evaluar ${container}`;
    $("simpleManagement").textContent=money(management);
    $("simpleLogistics").textContent=freight>0?money(freight+CONFIG.fcl.chinaLocalCostsUsd):"Por confirmar";
  }
}

function selectServiceAndScroll(service){
  setService(service);
  $("cotizar").scrollIntoView({behavior:"smooth",block:"start"});
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

  document.querySelectorAll("[data-service-button]").forEach(a=>{
    a.addEventListener("click",e=>{
      e.preventDefault();
      selectServiceAndScroll(a.dataset.serviceButton);
    });
  });
  document.querySelectorAll("[data-quote-service]").forEach(b=>b.addEventListener("click",()=>setService(b.dataset.quoteService)));
  document.querySelectorAll("[data-source-mode]").forEach(b=>b.addEventListener("click",()=>setSourceMode(b.dataset.sourceMode)));
  document.querySelectorAll("[data-calc-mode]").forEach(b=>b.addEventListener("click",()=>setCalcMode(b.dataset.calcMode)));

  $("quoteForm").addEventListener("submit",submitQuote);
  $("clearQuote").addEventListener("click",()=>{
    $("quoteForm").reset();
    setSourceMode(state.sourceMode);
    setService(state.quoteService);
  });
  $("resetSimpleCalc").addEventListener("click",()=>setCalcMode("photos"));
  $("sendSimpleQuote").addEventListener("click",()=>{
    setService(state.calcMode==="photos"?"sourcing":"lcl");
  });

  setSourceMode("link");
  setService("lcl");
  setCalcMode("photos");
}

init();
