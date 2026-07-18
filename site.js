const $ = id => document.getElementById(id);
const CONFIG = window.CHELME_CONFIG;
const PRICING = window.CHELME_PRICING;

function money(value){
  return new Intl.NumberFormat("en-US",{
    style:"currency",currency:"USD",maximumFractionDigits:2
  }).format(Number(value)||0);
}
function fmt(value,digits=2){
  return new Intl.NumberFormat("es-CL",{maximumFractionDigits:digits}).format(Number(value)||0);
}
function reference(prefix="CGT"){
  const date=new Date();
  const stamp=`${date.getFullYear()}${String(date.getMonth()+1).padStart(2,"0")}${String(date.getDate()).padStart(2,"0")}`;
  const token=Math.random().toString(36).slice(2,6).toUpperCase();
  return `${prefix}-${stamp}-${token}`;
}
function whatsapp(text){
  window.open(`https://wa.me/${CONFIG.business.whatsapp}?text=${encodeURIComponent(text)}`,"_blank","noopener");
}
function setupCommon(){
  document.querySelectorAll("[data-whatsapp]").forEach(el=>{
    el.addEventListener("click",event=>{
      event.preventDefault();
      whatsapp(el.dataset.whatsapp||"Hola, quiero información sobre Chelme Global Trade.");
    });
  });
  document.querySelectorAll("[data-instagram]").forEach(el=>el.href=CONFIG.business.instagram);
  document.querySelectorAll("[data-tiktok]").forEach(el=>el.href=CONFIG.business.tiktok);
  document.querySelectorAll("[data-email]").forEach(el=>el.href=`mailto:${CONFIG.business.email}`);
  const toggle=$("menuToggle");
  const nav=$("navLinks");
  if(toggle&&nav){
    toggle.addEventListener("click",()=>nav.classList.toggle("open"));
    nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));
  }
}
function setupFx(){
  const commercial=$("fxCommercial");
  if(!commercial)return;
  const trend=PRICING.exchangeTrend(CONFIG);
  commercial.textContent=`${CONFIG.exchange.commercialRmbPerUsd.toFixed(4)} RMB/USD`;
  $("fxReference").textContent=`${CONFIG.exchange.referenceRmbPerUsd.toFixed(4)} RMB/USD`;
  $("fxTrend").textContent=`${trend.text} (${trend.percent>=0?"+":""}${trend.percent.toFixed(2)}%)`;
  $("fxDate").textContent=CONFIG.exchange.updatedAt;
}
document.addEventListener("DOMContentLoaded",()=>{
  setupCommon();
  setupFx();
});