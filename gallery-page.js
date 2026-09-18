const CONFIG = window.CHELME_CONFIG;
const $ = (id) => document.getElementById(id);

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

  $("menuToggle")?.addEventListener("click",()=>$("mainNav").classList.toggle("open"));
  $("mainNav")?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>$("mainNav").classList.remove("open")));
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
}

init();
