const CONFIG = window.CHELME_CONFIG;
const $ = (id) => document.getElementById(id);
const money = (value) => new Intl.NumberFormat("es-CL",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(Number(value)||0);
const fmt = (value, decimals=2) => new Intl.NumberFormat("es-CL",{minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(Number(value)||0);

const miniServiceCopy = {
  lcl: { title: "Consolidado LCL", badge: "Estimación aproximada" },
  fcl: { title: "Contenedor FCL", badge: "Estimación aproximada" },
  quality: { title: "Control de calidad", badge: "Cotización personalizada" },
  sourcing: { title: "Buscar proveedor", badge: `Depósito desde ${money(CONFIG.sourcing.startingDepositUsd)}` },
  translation: { title: "Traducción", badge: "Cotización personalizada" },
  advisory: { title: "Asesoría", badge: `Pago inicial ${money(CONFIG.advisory.startingPriceUsd)}` }
};

const miniFieldsHtml = {
  lcl: `<label class="field"><span>Volumen aproximado (m³)</span><input id="miniCbm" type="number" min="0" step="0.01" placeholder="Ej: 1.5"></label>`,
  fcl: `<label class="field"><span>Tamaño de contenedor</span><select id="miniContainer"><option>20GP</option><option>40GP</option><option selected>40HQ</option></select></label>`,
  quality: "",
  sourcing: "",
  translation: "",
  advisory: ""
};

let miniService = "lcl";

function setMiniService(service){
  if(!miniServiceCopy[service])service="lcl";
  miniService=service;
  document.querySelectorAll("[data-mini-service]").forEach(b=>b.classList.toggle("active",b.dataset.miniService===service));
  $("miniTitle").textContent=miniServiceCopy[service].title;
  $("miniBadge").textContent=miniServiceCopy[service].badge;
  $("miniFields").innerHTML=miniFieldsHtml[service];
  $("miniFields").querySelectorAll("input,select").forEach(el=>{
    el.addEventListener("input",updateMiniEstimate);
    el.addEventListener("change",updateMiniEstimate);
  });
  const signupLink=$("miniSignupLink");
  if(signupLink)signupLink.href=`login.html?tab=signup&service=${service}`;
  updateMiniEstimate();
}

function updateMiniEstimate(){
  let text=`Desde ${money(CONFIG.lcl.ratePerCbmUsd)}/m³`;
  let note="Ingresa el volumen para ver un estimado de flete.";
  if(miniService==="lcl"){
    const cbm=Number.parseFloat($("miniCbm")?.value)||0;
    if(cbm>0){
      const result=CHELME_PRICING.calculateLcl({goodsAmount:0,goodsCurrency:"USD",cbm,includeSourcing:false},CONFIG);
      text=money(result.logistics);
      note=`Volumen facturable: ${fmt(result.billableCbm,2)} m³. No incluye el valor de tu mercancía ni impuestos de destino.`;
    }else{
      text=`Desde ${money(CONFIG.lcl.ratePerCbmUsd)}/m³`;
      note=`Mínimo facturable: ${CONFIG.lcl.minimumBillableCbm} m³.`;
    }
  }else if(miniService==="fcl"){
    const container=$("miniContainer")?.value||"40HQ";
    text="Se cotiza según tu contenedor";
    note=`Costos locales en China y flete marítimo para un ${container}. Varían según tamaño, ruta y semana: te los confirmamos en tu cotización.`;
  }else if(miniService==="quality"){
    text="Se cotiza según tu carga";
    note="Depende de la cantidad de productos, ubicación y nivel de detalle requerido.";
  }else if(miniService==="sourcing"){
    text=`Depósito inicial ${money(CONFIG.sourcing.startingDepositUsd)}`;
    note="Luego, la búsqueda y gestión de compra se cotiza según el alcance.";
  }else if(miniService==="translation"){
    text="Se cotiza según tu proyecto";
    note="Depende de si es remota o presencial, y la duración requerida.";
  }else if(miniService==="advisory"){
    text=money(CONFIG.advisory.startingPriceUsd);
    note="Incluye revisión, estimación inicial y cotización preliminar.";
  }
  $("miniEstimate").textContent=text;
  $("miniEstimateNote").textContent=note;
}

function selectServiceAndScroll(service){
  setMiniService(service);
  const target=$("quoteShell")||$("cotizar");
  target.scrollIntoView({behavior:"smooth",block:"start"});
}

function setupBusinessLinks(){
  const wa = CONFIG.business.whatsapp;
  document.querySelectorAll("[data-whatsapp-message]").forEach(a=>{
    const message = a.dataset.whatsappMessage || "";
    a.href = `https://wa.me/${wa}?text=${encodeURIComponent(message)}`;
  });
  document.querySelectorAll("[data-instagram-link]").forEach(a=>a.href=CONFIG.business.instagram);
  document.querySelectorAll("[data-instagram-business-link]").forEach(a=>a.href=CONFIG.business.instagramBusiness);
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
  document.querySelectorAll("[data-instagram-business-handle]").forEach(e=>e.textContent=CONFIG.business.instagramBusinessHandle);
  document.querySelectorAll("[data-tiktok-handle]").forEach(e=>e.textContent=CONFIG.business.tiktokHandle);
}

let activeGalleryFilter = "all";
let visibleGalleryItems = [];
let currentLightboxIndex = 0;

function renderGallery(filter = activeGalleryFilter){
  const grid = $("galleryGrid");
  if(!grid) return;
  activeGalleryFilter = filter;
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

function init(){
  setupBusinessLinks();
  renderGallery();

  document.querySelectorAll("[data-gallery-filter]").forEach(button => {
    button.addEventListener("click", () => setGalleryFilter(button.dataset.galleryFilter));
  });
  const lightbox = $("galleryLightbox");
  if (lightbox) {
    $("lightboxClose").addEventListener("click", closeLightbox);
    $("lightboxPrev").addEventListener("click", () => changeLightbox(-1));
    $("lightboxNext").addEventListener("click", () => changeLightbox(1));
    lightbox.addEventListener("click", event => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", event => {
      if (lightbox.classList.contains("hidden")) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") changeLightbox(-1);
      if (event.key === "ArrowRight") changeLightbox(1);
    });
  }

  $("menuToggle").addEventListener("click",()=>$("mainNav").classList.toggle("open"));
  $("mainNav").querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>$("mainNav").classList.remove("open")));
  document.querySelectorAll(".nav-services").forEach(dd=>{
    dd.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{dd.open=false;}));
    let closeTimer=null;
    dd.addEventListener("mouseenter",()=>{
      if(window.innerWidth<=850)return;
      clearTimeout(closeTimer);
      dd.open=true;
    });
    dd.addEventListener("mouseleave",()=>{
      if(window.innerWidth<=850)return;
      closeTimer=setTimeout(()=>{dd.open=false;},150);
    });
  });

  document.querySelectorAll("[data-service-button]").forEach(a=>{
    a.addEventListener("click",e=>{
      e.preventDefault();
      selectServiceAndScroll(a.dataset.serviceButton);
    });
  });
  document.querySelectorAll("[data-mini-service]").forEach(b=>b.addEventListener("click",()=>setMiniService(b.dataset.miniService)));

  const requestedService=new URLSearchParams(location.search).get("service");
  setMiniService(requestedService&&miniServiceCopy[requestedService]?requestedService:"lcl");
  if(requestedService&&miniServiceCopy[requestedService]&&location.hash==="#quoteShell"){
    setTimeout(()=>$("quoteShell").scrollIntoView({behavior:"smooth",block:"start"}),50);
  }
}

init();
