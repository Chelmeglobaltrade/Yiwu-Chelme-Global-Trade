const state={mode:"LCL",result:null,summaryText:"",summaryRef:""};

const ids=["goodsAmount","goodsCurrency","cbm","container","includeSourcing"];
ids.forEach(id=>{
  const el=$(id);
  el.addEventListener("input",calculate);
  el.addEventListener("change",calculate);
});
$("modeLcl").addEventListener("click",()=>setMode("LCL"));
$("modeFcl").addEventListener("click",()=>setMode("FCL"));

function setMode(mode){
  state.mode=mode;
  $("modeLcl").classList.toggle("active",mode==="LCL");
  $("modeFcl").classList.toggle("active",mode==="FCL");
  $("cbmField").classList.toggle("hidden",mode!=="LCL");
  $("containerField").classList.toggle("hidden",mode!=="FCL");
  calculate();
}

function originalGoods(amount,currency){
  if(!Number(amount))return "No ingresado";
  return currency==="RMB"
    ? `${new Intl.NumberFormat("es-CL").format(amount)} RMB`
    : money(amount);
}

function row(label,value,total=false){
  return `<div class="breakdown-row ${total?"total":""}"><span>${label}</span><strong>${value}</strong></div>`;
}

function calculate(){
  const goodsAmount=Number($("goodsAmount").value)||0;
  const goodsCurrency=$("goodsCurrency").value;
  const includeSourcing=$("includeSourcing").value==="yes";
  let html='<div class="breakdown-head"><span>Desglose</span><span>Resultado</span></div>';

  if(state.mode==="LCL"){
    const result=PRICING.calculateLcl({
      goodsAmount,goodsCurrency,
      cbm:Number($("cbm").value)||0,
      includeSourcing
    },CONFIG);
    state.result=result;

    html+=row(`Mercancía (${goodsCurrency})`,originalGoods(goodsAmount,goodsCurrency));
    if(goodsCurrency==="RMB"&&goodsAmount>0){
      html+=row(`Equivalente a ${CONFIG.exchange.commercialRmbPerUsd.toFixed(4)} RMB/USD`,money(result.goodsUsd));
    }
    html+=row("Volumen real",`${fmt(result.actualCbm)} m³`);
    html+=row("Volumen facturable",`${fmt(result.billableCbm)} m³`);
    if(result.minimumApplied)html+=row("Mínimo aplicado","1,00 m³");
    html+=row(`Flete (${fmt(result.billableCbm)} × ${money(result.rate)})`,money(result.baseFreight));
    if(result.smallCargoFixed)html+=row("Cargo fijo menor a 5 m³",money(result.smallCargoFixed));
    html+=row(`Búsqueda y gestión (${CONFIG.sourcing.lclPercent}%)`,
      includeSourcing?(result.sourcing===null?"Pendiente":money(result.sourcing)):"No seleccionada");
    html+=row(goodsAmount>0?"Total conocido":"Logística conocida",
      goodsAmount>0?money(result.totalKnown):money(result.logistics),true);
    html+=`<div class="breakdown-note">${CONFIG.publicNotes.destination}</div>`;
  }else{
    const result=PRICING.calculateFcl({
      goodsAmount,goodsCurrency,
      container:$("container").value,
      includeSourcing
    },CONFIG);
    state.result=result;

    html+=row(`Mercancía (${goodsCurrency})`,originalGoods(goodsAmount,goodsCurrency));
    if(goodsCurrency==="RMB"&&goodsAmount>0){
      html+=row(`Equivalente a ${CONFIG.exchange.commercialRmbPerUsd.toFixed(4)} RMB/USD`,money(result.goodsUsd));
    }
    html+=row(`Búsqueda y gestión (${CONFIG.sourcing.fclPercent}%)`,
      includeSourcing?(result.sourcing===null?"Pendiente":money(result.sourcing)):"No seleccionada");
    html+=row("Gastos operativos en China",money(result.origin));
    html+=row(`Flete marítimo ${result.container}`,result.oceanKnown?money(result.ocean):"Por confirmar");
    html+=row("Total conocido",result.totalKnown===null?"Pendiente":money(result.totalKnown),true);
    html+=`<div class="breakdown-note">El total final FCL se confirma con producto, peso, puerto y fecha de salida.</div>`;
  }
  $("breakdown").innerHTML=html;
}
calculate();

$("requestForm").addEventListener("submit",event=>{
  event.preventDefault();
  const required=["clientName","clientPhone","destination","product"];
  const missing=required.find(id=>!$(id).value.trim());
  if(missing){
    $("requestAlert").textContent="Completa los campos obligatorios antes de generar el resumen.";
    $("requestAlert").classList.remove("hidden");
    $(missing).focus();
    return;
  }
  $("requestAlert").classList.add("hidden");

  state.summaryRef=reference("CGT");
  const sourcing=$("includeSourcing").value==="yes"?"Sí":"No";
  const goods=`${$("goodsAmount").value||0} ${$("goodsCurrency").value}`;
  const volume=state.mode==="LCL"
    ? `${fmt(state.result.actualCbm)} m³ real / ${fmt(state.result.billableCbm)} m³ facturable`
    : $("container").value;
  const estimate=state.mode==="LCL"
    ? (Number($("goodsAmount").value)>0?money(state.result.totalKnown):money(state.result.logistics))
    : (state.result.totalKnown===null?"Pendiente":money(state.result.totalKnown));

  const items=[
    ["Referencia",state.summaryRef],
    ["Cliente",$("clientName").value.trim()],
    ["WhatsApp",$("clientPhone").value.trim()],
    ["Destino",$("destination").value.trim()],
    ["Producto",$("product").value.trim()],
    ["Modalidad",state.mode],
    ["Valor informado",goods],
    ["Volumen / contenedor",volume],
    ["Búsqueda de proveedor",sourcing],
    ["Estimación mostrada",estimate]
  ];
  $("summaryGrid").innerHTML=items.map(([label,value])=>
    `<div class="summary-item"><span>${label}</span><strong>${value}</strong></div>`
  ).join("");

  state.summaryText=[
    "NUEVA SOLICITUD CHELME GLOBAL TRADE",
    `Referencia: ${state.summaryRef}`,
    `Cliente: ${$("clientName").value.trim()}`,
    `WhatsApp: ${$("clientPhone").value.trim()}`,
    `Destino: ${$("destination").value.trim()}`,
    `Producto: ${$("product").value.trim()}`,
    `Modalidad: ${state.mode}`,
    `Valor informado: ${goods}`,
    `Volumen / contenedor: ${volume}`,
    `Necesita búsqueda: ${sourcing}`,
    `Estimación mostrada: ${estimate}`,
    $("details").value.trim()?`Detalles: ${$("details").value.trim()}`:"",
    "",
    `Asesoría inicial: ${money(CONFIG.advisory.priceUsd)} antes de comenzar la revisión.`,
    "Impuestos y gastos de destino se confirman por separado."
  ].filter(Boolean).join("\n");

  $("summaryPreview").classList.remove("hidden");
  $("summaryPreview").scrollIntoView({behavior:"smooth",block:"center"});
});

$("sendWhatsapp").addEventListener("click",()=>whatsapp(state.summaryText));
$("copySummary").addEventListener("click",async()=>{
  await navigator.clipboard.writeText(state.summaryText);
  $("copySummary").textContent="Resumen copiado";
  setTimeout(()=>$("copySummary").textContent="Copiar resumen",1500);
});
$("editSummary").addEventListener("click",()=>{
  $("summaryPreview").classList.add("hidden");
  $("requestForm").scrollIntoView({behavior:"smooth"});
});