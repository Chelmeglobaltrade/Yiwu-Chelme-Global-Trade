// Claves públicas de Supabase (seguras para el navegador: la protección real
// la da Row Level Security, configurada en la base de datos).
var SUPABASE_URL = "https://pvivlnljgpldtlblyvxo.supabase.co";
var SUPABASE_PUBLISHABLE_KEY = "sb_publishable_krvbtoyK0RSsBA3g1dspgA_Bkh55PEh";

var supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

var ORDER_STATUS_LABELS = {
  pedido_confirmado: "Pedido confirmado",
  produccion_yiwu: "Producción / consolidando en Yiwu",
  transito_maritimo: "Tránsito marítimo",
  en_aduana: "En aduana (Chile)",
  entregado: "Entregado"
};

var ORDER_STATUS_ORDER = ["pedido_confirmado", "produccion_yiwu", "transito_maritimo", "en_aduana", "entregado"];
