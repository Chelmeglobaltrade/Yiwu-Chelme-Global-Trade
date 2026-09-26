/* ============================================================
   MOTOR DE COTIZACIÓN COMPLETO — Chelme Global Trade
   Formulario de 4 pasos con desglose real, envío por WhatsApp y
   PDF. Vive solo en mi-cuenta.html (requiere cuenta creada).
   ============================================================ */
const CONFIG = window.CHELME_CONFIG;
const $ = (id) => document.getElementById(id);
const money = (value) => new Intl.NumberFormat("es-CL",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(Number(value)||0);
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

/* Cada servicio se muestra como varias pantallas cortas (una idea por pantalla).
   Los ids, las etiquetas y el ORDEN de los campos son los mismos de siempre:
   el estimado, el mensaje de WhatsApp, el PDF y el guardado los leen igual. */
const qzScreen=(question,hint,inner)=>`<div class="qz-screen" data-phase="Detalles"><h3 class="qz-q" tabindex="-1">${question}</h3><p class="qz-hint">${hint}</p>${inner}</div>`;
const qzGrid=(inner)=>`<div class="form-grid">${inner}</div>`;
const CBM_HELPER=`
  <div class="cbm-helper">
    <button type="button" class="cbm-helper-toggle" data-cbm-helper-toggle aria-expanded="false"><svg><use href="#qi-box"></use></svg><span>¿No sabes el CBM? Calcúlalo con las medidas de tus cajas</span></button>
    <div class="cbm-helper-fields hidden form-grid" data-cbm-helper-fields>
      <label class="field"><span>Largo (cm)</span><input type="number" min="0" placeholder="0" data-box-length></label>
      <label class="field"><span>Ancho (cm)</span><input type="number" min="0" placeholder="0" data-box-width></label>
      <label class="field"><span>Alto (cm)</span><input type="number" min="0" placeholder="0" data-box-height></label>
      <label class="field"><span>Cantidad de cajas</span><input type="number" min="1" placeholder="0" data-box-count></label>
    </div>
  </div>`;
const SOURCING_OPTION=`
  <label class="service-option">
    <input id="qIncludeSourcing" type="checkbox">
    <span><strong>Necesito búsqueda de proveedor y gestión de compra</strong><small>Solo al marcar esta opción se agrega este servicio a tu cotización. El detalle del cargo aparece en tu estimación y en el PDF.</small></span>
  </label>`;
const GOODS_FIELDS=qzGrid(`
  <label class="field"><span>Valor aproximado de productos</span><input id="qGoods" type="number" min="0" placeholder="0" inputmode="decimal"></label>
  <label class="field"><span>Moneda de los productos</span><select id="qCurrency"><option value="USD">USD</option><option value="RMB">RMB / CNY</option></select></label>`);

const services = {
  lcl: {
    title: "Cotizar carga consolidada",
    badge: "Estimación disponible",
    html:
      qzScreen("¿Cuánto vale tu mercancía?","Un valor aproximado basta. Lo confirmamos con tu proveedor antes del precio final.",GOODS_FIELDS)+
      qzScreen("¿Cuánto volumen ocupa tu carga?","Con el volumen (CBM) calculamos el flete al instante. Si no lo sabes, usa la calculadora de abajo.",qzGrid(`
        <label class="field"><span>Volumen real, si lo conoces (m³)</span><input id="qCbm" type="number" min="0" step="0.01" placeholder="0" inputmode="decimal"></label>
        <label class="field"><span>Cantidad aproximada</span><input id="qQuantity" type="number" min="1" placeholder="0" inputmode="numeric"></label>
        <label class="field"><span>Cantidad de proveedores</span><input id="qSuppliers" type="number" min="1" value="1" inputmode="numeric"></label>`)+CBM_HELPER)+
      qzScreen("¿Necesitas ayuda con la compra?","Es opcional. Si ya tienes proveedor, sigue sin marcar.",SOURCING_OPTION)
  },
  fcl: {
    title: "Cotizar contenedor completo",
    badge: "Estimación disponible",
    html:
      qzScreen("¿Qué contenedor necesitas?","Si dudas, elige el que creas y lo ajustamos contigo.",`<label class="field"><span>Contenedor</span><select id="qContainer"><option>20GP</option><option>40GP</option><option selected>40HQ</option></select></label>`)+
      qzScreen("¿Cuánto vale tu mercancía?","Un valor aproximado basta. Lo confirmamos con tu proveedor antes del precio final.",GOODS_FIELDS)+
      qzScreen("¿Cuánto volumen y desde dónde sale?","Con esto armamos una cotización de flete vigente.",qzGrid(`
        <label class="field"><span>Volumen estimado (m³)</span><input id="qCbm" type="number" min="0" step="0.01" placeholder="0" inputmode="decimal"></label>
        <label class="field"><span>Puerto o ciudad de origen</span><input id="qOrigin" placeholder="Ningbo, Shanghai, Qingdao..."></label>`)+CBM_HELPER)+
      qzScreen("¿Necesitas ayuda con la compra?","Es opcional. Si ya tienes proveedor, sigue sin marcar.",SOURCING_OPTION)
  },
  quality: {
    title: "Cotizar control de calidad",
    badge: "Cotización personalizada",
    html:
      qzScreen("¿Dónde y qué tipo de inspección?","Indícanos la ciudad y cuándo quieres que revisemos.",qzGrid(`
        <label class="field"><span>Ciudad de la inspección *</span><input id="qCity" required placeholder="Yiwu, Guangzhou, Foshan..."></label>
        <label class="field"><span>Tipo de inspección</span><select id="qInspection"><option>Preembarque</option><option>Durante producción</option><option>Supervisión de carga</option><option>Videollamada</option><option>Auditoría de fábrica</option></select></label>`))+
      qzScreen("¿Cuántas referencias y para cuándo?","Una referencia es un producto o modelo distinto.",qzGrid(`
        <label class="field"><span>Cantidad de referencias</span><input id="qReferences" type="number" min="1" value="1" inputmode="numeric"></label>
        <label class="field"><span>Fecha requerida</span><input id="qDate" type="date"></label>`))+
      qzScreen("¿Qué necesitas revisar?","Cuéntanos con tus palabras.",`<label class="field"><span>Qué necesitas revisar</span><textarea id="qScope" rows="3" placeholder="Conteo, funcionamiento, medidas, empaque, etiquetas, color..."></textarea></label>`)
  },
  sourcing: {
    title: "Buscar proveedor en China",
    badge: `Depósito desde ${money(CONFIG.sourcing.startingDepositUsd)}`,
    html:
      qzScreen("¿Cuánto necesitas y con qué presupuesto?","Números aproximados, no tienen que ser exactos.",qzGrid(`
        <label class="field"><span>Cantidad aproximada</span><input id="qQuantity" type="number" min="1" placeholder="0" inputmode="numeric"></label>
        <label class="field"><span>Presupuesto estimado (USD)</span><input id="qBudget" type="number" min="0" placeholder="0" inputmode="decimal"></label>`))+
      qzScreen("¿Cómo lo quieres?","Personalización y nivel de calidad que buscas.",qzGrid(`
        <label class="field"><span>¿Necesitas logo o empaque?</span><select id="qCustom"><option>No</option><option>Logo</option><option>Empaque</option><option>Producto y empaque</option></select></label>
        <label class="field"><span>Calidad esperada</span><select id="qQuality"><option>Económica</option><option>Media</option><option>Alta</option><option>No lo sé</option></select></label>`))
  },
  trip: {
    title: "Cotizar viaje de negocios a China",
    badge: "Cotización personalizada",
    html:
      qzScreen("¿Cuándo viajas y por cuántos días?","Una fecha aproximada nos sirve.",qzGrid(`
        <label class="field"><span>Fecha aproximada</span><input id="qTripDate" type="date"></label>
        <label class="field"><span>Cantidad de días *</span><input id="qDays" type="number" min="1" value="1" required inputmode="numeric"></label>`))+
      qzScreen("¿A qué ciudades y con cuántas personas?","Puedes listar varias ciudades.",qzGrid(`
        <label class="field"><span>Ciudades</span><input id="qCities" placeholder="Yiwu, Guangzhou, Foshan..."></label>
        <label class="field"><span>Cantidad de viajeros</span><input id="qTravelers" type="number" min="1" value="1" inputmode="numeric"></label>`))
  },
  translation: {
    title: "Cotizar traducción y negociación",
    badge: "Cotización personalizada",
    html:
      qzScreen("¿Cómo necesitas el apoyo?","Remoto desde donde estés o presencial en China.",`<label class="field"><span>Modalidad</span><select id="qTranslationMode"><option>Remota</option><option>Presencial en China</option></select></label>`)+
      qzScreen("¿Por cuánto tiempo?","Si es presencial, dinos la ciudad.",qzGrid(`
        <label class="field"><span>Duración aproximada</span><input id="qDuration" type="number" min="1" value="1" inputmode="numeric"></label>
        <label class="field"><span>Unidad</span><select id="qDurationUnit"><option>Horas</option><option>Días</option></select></label>
        <label class="field"><span>Ciudad, si es presencial</span><input id="qTranslationCity" placeholder="Ciudad"></label>`))
  },
  advisory: {
    title: "Asesoría + revisión + cotización",
    badge: `Pago inicial ${money(CONFIG.advisory.startingPriceUsd)}`,
    html:
      qzScreen("¿Con qué presupuesto piensas partir?","Un monto aproximado en dólares.",`<label class="field"><span>Presupuesto estimado (USD)</span><input id="qBudget" type="number" min="0" placeholder="0" inputmode="decimal"></label>`)+
      qzScreen("¿Has importado antes?","Así adaptamos la asesoría a tu experiencia.",`<label class="field"><span>¿Has importado antes?</span><select id="qExperience"><option>No</option><option>Sí, una vez</option><option>Sí, varias veces</option></select></label>`)
  }
};

/* Servicios que no parten de un producto: se omite el paso "Producto". */
const NO_PRODUCT_SERVICES=["trip","translation"];

function setService(service){
  state.quoteService = service;
  document.querySelectorAll("[data-quote-service]").forEach(b=>{
    const on=b.dataset.quoteService===service;
    b.classList.toggle("active",on);
    b.setAttribute("aria-checked",on?"true":"false");
  });
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
  enhanceSelects($("serviceFields"));
  // Servicios sin producto: se limpian los campos del paso "Producto" (que se omite).
  if(NO_PRODUCT_SERVICES.includes(service))setSourceMode(state.sourceMode);
  wireCbmHelper();
  updateEstimate();
  renderWizardStep();
}

/* Los <select> con pocas opciones se muestran como botones tipo "pastilla".
   El <select> real sigue en el formulario (oculto) y es el que lee el resto del código. */
function enhanceSelects(root){
  root.querySelectorAll("select").forEach(sel=>{
    const wrap=document.createElement("div");
    wrap.className="qz-seg";
    wrap.setAttribute("role","group");
    wrap.setAttribute("aria-label",sel.closest(".field")?.querySelector("span")?.textContent.trim()||"Opciones");
    const sync=()=>wrap.querySelectorAll(".qz-seg-btn").forEach(b=>b.setAttribute("aria-pressed",b.dataset.value===sel.value?"true":"false"));
    [...sel.options].forEach(opt=>{
      const b=document.createElement("button");
      b.type="button";
      b.className="qz-seg-btn";
      b.dataset.value=opt.value;
      b.textContent=opt.textContent;
      b.addEventListener("click",()=>{
        sel.value=opt.value;
        sel.dispatchEvent(new Event("input",{bubbles:true}));
        sel.dispatchEvent(new Event("change",{bubbles:true}));
      });
      wrap.appendChild(b);
    });
    sel.classList.add("qz-sr");
    sel.tabIndex=-1;
    sel.setAttribute("aria-hidden","true");
    sel.addEventListener("change",sync);
    sel.after(wrap);
    sync();
  });
}

function wireCbmHelper(){
  const toggle=document.querySelector("[data-cbm-helper-toggle]");
  const fields=document.querySelector("[data-cbm-helper-fields]");
  if(!toggle||!fields)return;
  toggle.addEventListener("click",()=>{
    fields.classList.toggle("hidden");
    toggle.setAttribute("aria-expanded",fields.classList.contains("hidden")?"false":"true");
  });
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
    wrap.innerHTML=`<div class="source-panel qz-source">
      <label class="field"><span>Enlace del producto *</span><input id="sourceLink" type="url" required placeholder="Pega un enlace de 1688, Alibaba u otro proveedor" inputmode="url"></label>
      <details class="qz-more"><summary>Agregar nombre y cantidad (opcional)</summary>
        <div class="form-grid">
          <label class="field"><span>Nombre del producto</span><input id="sourceProductName" placeholder="Ej.: lámpara solar"></label>
          <label class="field"><span>Cantidad aproximada</span><input id="sourceQuantity" type="number" min="1" placeholder="0" inputmode="numeric"></label>
        </div>
      </details>
    </div>`;
  }else if(mode==="photos"){
    wrap.innerHTML=`<div class="source-panel qz-source">
      <label class="photo-drop">
        <svg><use href="#qi-camera"></use></svg>
        <strong>Subir fotografías del producto</strong>
        <span>Máximo ${maxFiles} imágenes · toca para elegir</span>
        <input id="sourceFiles" type="file" accept="image/*" multiple>
      </label>
      <div class="photo-preview" id="photoPreview"></div>
      <details class="qz-more"><summary>Agregar nombre y cantidad (opcional)</summary>
        <div class="form-grid">
          <label class="field"><span>¿Qué producto parece ser?</span><input id="sourceProductName" placeholder="Ej.: máquina expendedora de agua"></label>
          <label class="field"><span>Cantidad aproximada</span><input id="sourceQuantity" type="number" min="1" placeholder="0" inputmode="numeric"></label>
          <label class="field"><span>Número de productos o referencias</span><input id="sourceReferences" type="number" min="1" value="1" inputmode="numeric"></label>
        </div>
      </details>
    </div>`;
    $("sourceFiles").addEventListener("change",handleSourceFiles);
  }else if(mode==="bulk"){
    wrap.innerHTML=`<div class="source-panel qz-source">
      <label class="photo-drop">
        <svg><use href="#qi-upload"></use></svg>
        <strong>Subir lista completa</strong>
        <span>Excel, CSV, PDF, Word o imágenes · máximo ${maxFiles} archivos</span>
        <input id="sourceFiles" type="file" accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,image/*" multiple>
      </label>
      <div class="file-list" id="fileList"></div>
      <label class="field"><span>Número aproximado de productos o referencias *</span><input id="sourceReferences" required type="number" min="1" placeholder="Ej.: 35" inputmode="numeric"></label>
      <details class="qz-more"><summary>Más datos de la lista (opcional)</summary>
        <div class="form-grid">
          <label class="field"><span>Cantidad de proveedores</span><input id="sourceSuppliers" type="number" min="1" placeholder="0" inputmode="numeric"></label>
          <label class="field"><span>Valor total aproximado (USD)</span><input id="sourceBulkGoods" type="number" min="0" placeholder="0" inputmode="decimal"></label>
          <label class="field"><span>CBM total, si lo conoces</span><input id="sourceBulkCbm" type="number" min="0" step="0.01" placeholder="0" inputmode="decimal"></label>
        </div>
      </details>
      <label class="field"><span>Pega aquí parte de la lista, si no tienes archivo</span><textarea id="sourceBulkList" rows="4" placeholder="Producto 1 - cantidad...&#10;Producto 2 - cantidad..."></textarea></label>
      <p class="bulk-help">No se cobra por la cantidad de referencias. Los productos adicionales pueden aumentar el trabajo de revisión, pero cualquier cargo se confirma antes de comenzar.</p>
    </div>`;
    $("sourceFiles").addEventListener("change",handleSourceFiles);
  }else{
    wrap.innerHTML=`<div class="source-panel qz-source">
      <label class="field"><span>Describe el producto *</span><textarea id="sourceDescription" required rows="4" placeholder="Qué producto es, para qué sirve, material, tamaño, color, calidad o cualquier detalle que recuerdes."></textarea></label>
      <details class="qz-more"><summary>Agregar cantidad y presupuesto (opcional)</summary>
        <div class="form-grid">
          <label class="field"><span>Cantidad aproximada</span><input id="sourceQuantity" type="number" min="1" placeholder="0" inputmode="numeric"></label>
          <label class="field"><span>Número de productos o referencias</span><input id="sourceReferences" type="number" min="1" value="1" inputmode="numeric"></label>
          <label class="field"><span>Presupuesto aproximado (USD)</span><input id="sourceBudget" type="number" min="0" placeholder="0" inputmode="decimal"></label>
        </div>
      </details>
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
    if(field.closest("[data-skip]"))return false;
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
  $("quoteShell").classList.add("qz-previewing");
  $("quotePreview").scrollIntoView({behavior:"smooth",block:"center"});
}
function buildQuoteFieldsPayload(){
  const service=state.quoteService;
  const payload={service,source_mode:state.sourceMode};
  let description=null;
  if(service==="lcl"||service==="fcl"){
    payload.goods_value=val("qGoods")||null;
    payload.goods_currency=$("qCurrency")?.value||"USD";
    payload.cbm=val("qCbm")||null;
    payload.include_sourcing=Boolean($("qIncludeSourcing")?.checked);
    if(service==="fcl")description=`Contenedor ${$("qContainer")?.value||""}`.trim();
  }else if(service==="quality"){
    payload.quantity=Number($("qReferences")?.value)||null;
    description=[$("qCity")?.value,$("qInspection")?.value,$("qScope")?.value].filter(Boolean).join(" · ");
  }else if(service==="sourcing"){
    payload.quantity=Number($("qQuantity")?.value)||null;
    payload.goods_value=val("qBudget")||null;
    description=[$("qCustom")?.value,$("qQuality")?.value].filter(Boolean).join(" · ");
  }else if(service==="translation"){
    description=[$("qTranslationMode")?.value,[$("qDuration")?.value,$("qDurationUnit")?.value].filter(Boolean).join(" "),$("qTranslationCity")?.value].filter(Boolean).join(" · ");
  }else if(service==="advisory"){
    payload.goods_value=val("qBudget")||null;
    description=$("qExperience")?.value||null;
  }
  if(state.sourceMode==="link")payload.source_link=$("sourceLink")?.value||null;
  const sourceDesc=[$("sourceProductName")?.value,$("sourceDescription")?.value].filter(Boolean).join(" — ");
  payload.description=[description,sourceDesc].filter(Boolean).join(" — ")||null;
  return payload;
}

async function saveQuoteAsQuote(){
  try{
    if(typeof supabaseClient==="undefined")return null;
    const sessionRes=await supabaseClient.auth.getSession();
    const session=sessionRes.data.session;
    if(!session)return null;
    const fields=buildQuoteFieldsPayload();
    const res=await supabaseClient.from("quotes").insert({
      user_id:session.user.id,
      reference:state.preparedQuoteReference,
      client_notes:$("quoteNotes")?.value.trim()||null,
      staff_notes:state.preparedQuoteText,
      ...fields
    }).select().single();
    if(res.error){console.warn("No se pudo guardar la cotización:",res.error);notifyQuoteSaveFailed();return null;}
    return res.data;
  }catch(error){
    console.warn("No se pudo guardar la cotización:",error);
    notifyQuoteSaveFailed();
    return null;
  }
}

function notifyQuoteSaveFailed(){
  const alertBox=$("quoteAlert");
  if(!alertBox)return;
  alertBox.textContent="No pudimos guardar tu solicitud en tu cuenta, pero tu mensaje sí se envía por WhatsApp. Si no te respondemos pronto, escríbenos directamente.";
  alertBox.classList.remove("hidden");
}

async function sendPreparedQuote(){
  saveQuoteAsQuote();
  const text=state.preparedQuoteText,files=state.preparedQuoteFiles;
  if(files.length&&navigator.share&&navigator.canShare){
    try{const data={title:"Solicitud Chelme Global Trade",text,files};if(navigator.canShare(data)){await navigator.share(data);return;}}catch(error){if(error.name==="AbortError")return;}
  }
  window.open(`https://wa.me/${CONFIG.business.whatsapp}?text=${encodeURIComponent(text)}`,"_blank","noopener");
  if(files.length){$("quoteAlert").textContent="WhatsApp está abierto. Adjunta los archivos seleccionados antes de enviar.";$("quoteAlert").classList.remove("hidden");}
}

async function submitQuote(event){
  event.preventDefault();
  // Con Enter en cualquier pantalla intermedia solo se avanza; el envío real es en la última.
  if(!isLastScreen()){goWizardStep(1);return;}
  $("quoteAlert").classList.add("hidden");
  const skipSource=NO_PRODUCT_SERVICES.includes(state.quoteService);
  const missing=firstMissingRequired($("quoteForm"));
  if(missing){const label=missing.closest(".field")?.querySelector("span")?.textContent||"un campo obligatorio";$("quoteAlert").textContent=missing.type==="checkbox"?"Marca la casilla \"Entiendo cómo funciona la cotización\" para continuar.":`Completa: ${label.replace("*","").trim()}.`;$("quoteAlert").classList.remove("hidden");focusField(missing);return;}
  if(!skipSource&&state.sourceMode==="photos"&&state.quoteFiles.length===0){$("quoteAlert").textContent="Selecciona al menos una fotografía.";$("quoteAlert").classList.remove("hidden");focusField($("sourceFields"));return;}
  if(!skipSource&&state.sourceMode==="bulk"){const pasted=$("sourceBulkList")?.value.trim()||"";if(state.quoteFiles.length===0&&!pasted){$("quoteAlert").textContent="Sube una lista o pega los productos en el campo disponible.";$("quoteAlert").classList.remove("hidden");focusField($("sourceFields"));return;}}
  const name=$("quoteName").value.trim(),destination=$("quoteDestination").value.trim(),phone=$("quoteClientWhatsapp").value.trim()||"No informado";
  const modeNames={link:"Enlace",photos:"Fotografías",description:"Descripción",bulk:"Lista de productos"};
  const infoLabel=skipSource?"No aplica":modeNames[state.sourceMode];
  const sourceLines=skipSource?[]:collectFields($("sourceFields")),serviceLines=collectFields($("serviceFields"));
  const serviceTitle=services[state.quoteService].title,result=$("quoteEstimate").textContent,sourcingStatus=getSelectedSourcingStatus();
  state.preparedQuoteReference=createQuoteReference();state.preparedQuoteFiles=[...state.quoteFiles];
  const concise=[...sourceLines.slice(0,4),...serviceLines.slice(0,5)];
  const requiresAdvisory=["sourcing","advisory"].includes(state.quoteService);
  state.preparedQuoteText=["SOLICITUD CHELME GLOBAL TRADE",`Referencia: ${state.preparedQuoteReference}`,`Servicio: ${serviceTitle}`,`Cliente: ${name}`,`Destino: ${destination}`,`WhatsApp cliente: ${phone}`,`Información disponible: ${infoLabel}`,`Proveedor / búsqueda: ${sourcingStatus}`,...concise,`Resultado mostrado: ${result}`,state.quoteFiles.length?`Archivos para adjuntar: ${state.quoteFiles.length}`:"",$("quoteNotes").value.trim()?`Comentarios: ${$("quoteNotes").value.trim()}`:"","",requiresAdvisory?`Asesoría inicial: ${money(CONFIG.advisory.startingPriceUsd)}`:"Esta cotización no tiene costo.",requiresAdvisory?"La revisión comienza después de confirmar la asesoría.":"Quedamos atentos para confirmar por WhatsApp.","Impuestos y gastos de destino se confirman por separado."].filter(Boolean).join("\n");
  renderQuotePreview([["Referencia",state.preparedQuoteReference],["Servicio",serviceTitle],["Cliente",name],["Destino",destination],["Información",infoLabel],["Búsqueda",sourcingStatus],["Resultado mostrado",result],[requiresAdvisory?"Asesoría inicial":"Costo de esta cotización",requiresAdvisory?money(CONFIG.advisory.startingPriceUsd):"Sin costo"]]);
}

/* ---------- Asistente: una pantalla a la vez ---------- */
let wizardStep=0;
const prefersReducedMotion=()=>window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function activeScreens(){
  return [...document.querySelectorAll("#quoteForm .qz-screen")].filter(el=>!el.hasAttribute("data-skip"));
}
function isLastScreen(){return wizardStep>=activeScreens().length-1;}

function renderWizardStep(direction=0){
  const source=$("qzSourceScreen");
  if(source)source.toggleAttribute("data-skip",NO_PRODUCT_SERVICES.includes(state.quoteService));
  const list=activeScreens();
  wizardStep=Math.max(0,Math.min(list.length-1,wizardStep));
  const current=list[wizardStep];
  document.querySelectorAll("#quoteForm .qz-screen").forEach(el=>{
    const on=el===current;
    const was=el.classList.contains("is-active");
    el.classList.toggle("is-active",on);
    el.classList.remove("qz-in-fwd","qz-in-back");
    if(on&&!was&&direction)el.classList.add(direction>0?"qz-in-fwd":"qz-in-back");
  });
  const back=$("wizardBack"),next=$("wizardNext");
  if(back)back.style.visibility=wizardStep===0?"hidden":"visible";
  if(next)next.hidden=wizardStep===list.length-1;
  const stepper=$("wizardStepper");
  if(stepper){
    const total=list.length;
    stepper.innerHTML=`<div class="qz-progress-top"><span>Paso ${wizardStep+1} de ${total}</span><strong>${escapeText(current?.dataset.phase||"")}</strong></div>
      <div class="qz-bar" role="progressbar" aria-label="Progreso de la cotización" aria-valuemin="1" aria-valuemax="${total}" aria-valuenow="${wizardStep+1}">${list.map((_,i)=>`<i class="${i<wizardStep?"done":i===wizardStep?"current":""}"></i>`).join("")}</div>`;
  }
}

function validateScreen(el){
  const box=$("quoteAlert");
  box.classList.add("hidden");
  const bad=[...el.querySelectorAll("[required]")].find(f=>f.type==="checkbox"?!f.checked:!String(f.value||"").trim());
  let message="";
  if(bad){
    const label=bad.closest(".field")?.querySelector("span")?.textContent||"un campo obligatorio";
    message=`Completa: ${label.replace("*","").trim()}.`;
  }else if(el.id==="qzSourceScreen"){
    if(state.sourceMode==="photos"&&state.quoteFiles.length===0)message="Selecciona al menos una fotografía.";
    else if(state.sourceMode==="bulk"&&state.quoteFiles.length===0&&!($("sourceBulkList")?.value.trim()))message="Sube una lista o pega los productos en el campo disponible.";
  }
  if(!message)return true;
  box.textContent=message;
  box.classList.remove("hidden");
  bad?.focus();
  return false;
}

function goWizardStep(delta){
  const list=activeScreens();
  if(delta>0&&!validateScreen(list[wizardStep]))return;
  const target=Math.max(0,Math.min(list.length-1,wizardStep+delta));
  if(target===wizardStep)return;
  $("quoteAlert").classList.add("hidden");
  wizardStep=target;
  renderWizardStep(delta);
  const heading=activeScreens()[wizardStep]?.querySelector(".qz-q");
  heading?.focus({preventScroll:true});
  const shell=$("quoteShell");
  if(shell){
    const top=shell.getBoundingClientRect().top;
    if(top<0||top>window.innerHeight*.5)shell.scrollIntoView({behavior:prefersReducedMotion()?"auto":"smooth",block:"start"});
  }
}

/* Lleva al cliente a la pantalla donde está el campo pendiente. */
function focusField(el){
  const list=activeScreens();
  const index=list.indexOf(el.closest(".qz-screen"));
  if(index>=0){wizardStep=index;renderWizardStep();}
  if(el.focus&&el.matches("input,select,textarea,button"))el.focus();
}

function initQuoteWizard(prefill){
  document.querySelectorAll("[data-quote-service]").forEach(b=>b.addEventListener("click",()=>{
    setService(b.dataset.quoteService);
    // Elegir un servicio en la primera pantalla avanza solo.
    if(wizardStep===0)setTimeout(()=>{if(wizardStep===0)goWizardStep(1);},prefersReducedMotion()?0:200);
  }));
  document.querySelectorAll("[data-source-mode]").forEach(b=>b.addEventListener("click",()=>setSourceMode(b.dataset.sourceMode)));

  $("quoteForm").addEventListener("submit",submitQuote);
  $("quoteForm").addEventListener("keydown",e=>{
    if(e.key==="Enter"&&e.target.tagName==="INPUT"&&e.target.type!=="checkbox"&&e.target.type!=="file"){
      e.preventDefault();
      if(isLastScreen())$("quoteForm").requestSubmit();else goWizardStep(1);
    }
  });
  $("confirmQuoteWhatsapp").addEventListener("click",sendPreparedQuote);
  $("editQuotePreview").addEventListener("click",()=>{
    $("quotePreview").classList.add("hidden");
    $("quoteShell").classList.remove("qz-previewing");
    $("quoteForm").scrollIntoView({behavior:"smooth",block:"start"});
  });
  $("wizardBack")?.addEventListener("click",()=>goWizardStep(-1));
  $("wizardNext")?.addEventListener("click",()=>goWizardStep(1));
  $("clearQuote").addEventListener("click",()=>{
    $("quoteForm").reset();
    $("quotePreview").classList.add("hidden");
    $("quoteShell").classList.remove("qz-previewing");
    $("quoteAlert").classList.add("hidden");
    state.preparedQuoteText="";state.preparedQuoteFiles=[];state.preparedQuoteReference="";
    setSourceMode(state.sourceMode);
    wizardStep=0;
    setService(state.quoteService);
    if(prefill)applyPrefill(prefill);
  });

  // Resumen lateral / barra inferior en móvil.
  const summary=$("qzSummary"),sumToggle=$("qzSumToggle");
  sumToggle?.addEventListener("click",()=>{
    const open=summary.classList.toggle("open");
    sumToggle.setAttribute("aria-expanded",open?"true":"false");
    sumToggle.querySelector("span").textContent=open?"Ocultar detalle":"Ver detalle";
  });
  // Pequeña animación cuando cambia el total (no toca el cálculo, solo observa el texto).
  const est=$("quoteEstimate");
  let lastEstimate=est.textContent;
  new MutationObserver(()=>{
    const text=est.textContent;
    est.classList.toggle("qz-long",text.length>18);
    if(text===lastEstimate)return;
    lastEstimate=text;
    est.classList.remove("qz-bump");void est.offsetWidth;est.classList.add("qz-bump");
  }).observe(est,{childList:true,characterData:true,subtree:true});

  setSourceMode("link");
  const requestedService=new URLSearchParams(location.search).get("service");
  const hasRequested=Boolean(requestedService&&services[requestedService]);
  wizardStep=hasRequested?1:0;
  setService(hasRequested?requestedService:"lcl");
  if(prefill)applyPrefill(prefill);
  renderWizardStep();
}

function applyPrefill(prefill){
  if(prefill.name&&$("quoteName")&&!$("quoteName").value)$("quoteName").value=prefill.name;
  if(prefill.email&&$("quoteEmail")&&!$("quoteEmail").value)$("quoteEmail").value=prefill.email;
  if(prefill.phone&&$("quoteClientWhatsapp")&&!$("quoteClientWhatsapp").value)$("quoteClientWhatsapp").value=prefill.phone;
}
