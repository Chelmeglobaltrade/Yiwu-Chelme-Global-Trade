window.CHELME_CONFIG = {
  business: {
    name: "Chelme Global Trade",
    whatsapp: "8615257960742",
    email: "alanchelme11@gmail.com",
    instagram: "https://www.instagram.com/alanen.china/",
    instagramHandle: "@alanen.china",
    tiktok: "https://www.tiktok.com/@alanenchina",
    tiktokHandle: "@alanenchina",
    city: "Yiwu, Zhejiang, China"
  },

  exchange: {
    referenceRmbPerUsd: 6.7767,
    previousReferenceRmbPerUsd: 6.7733,
    commercialRmbPerUsd: 6.64,
    updatedAt: "2026-07-17",
    sourceLabel: "Referencia de mercado USD/CNY",
    bufferPercent: 2.02,
    quoteValidityDays: 3,
    note: "El tipo de cambio comercial incluye margen de protección por variación cambiaria, costos bancarios y tiempo de liquidación."
  },

  advisory: {
    startingPriceUsd: 200,
    includes: [
      "Revisión inicial del proyecto",
      "Evaluación de producto, cantidad y presupuesto",
      "Revisión de enlaces, fotos o lista de productos",
      "Estimación inicial de costos",
      "Recomendación entre consolidado LCL y contenedor FCL",
      "Cotización preliminar y próximos pasos"
    ],
    paymentRequiredBeforeReview: true,
    note: "No se inicia la revisión ni la cotización sin el pago de la asesoría inicial."
  },

  payment: {
    amountUsd: 200,
    referencePrefix: "ASESORIA",
    bankDetailsPublished: false,
    methods: ["Transferencia bancaria en USD", "USDT"],
    instructions: [
      "Solicita los datos de pago actualizados por WhatsApp.",
      "Transfiere el valor exacto de la asesoría inicial.",
      "Escribe tu nombre y la referencia del proyecto.",
      "Envía el comprobante por WhatsApp.",
      "La revisión comienza después de confirmar el pago."
    ],
    note: "Los datos bancarios no se publican de forma fija para evitar pagos a cuentas desactualizadas."
  },

  lcl: {
    ratePerCbmUsd: 270,
    minimumBillableCbm: 1,
    smallCargoThresholdCbm: 5,
    smallCargoExtraPerCbmUsd: 100,
    sourcingPercent: 8,
    minimumSourcingFeeUsd: 200,
    minimumRecommendedGoodsUsd: 5000,
    nextDepartureText: "Consultar próxima salida",
    explanation: "Se cobra por el CBM facturable. Si la carga ocupa menos de 1 m³, el mínimo facturable es 1 m³."
  },
  destinationCosts: {
    taxesIncludedInPublicEstimate: false,
    customsBrokerIncluded: false,
    portChargesIncluded: false,
    finalDeliveryIncluded: false,
    message: "Al llegar la carga, el cliente debe pagar los impuestos y gastos de destino que correspondan."
  },

  fcl: {
    sourcingPercent: 5,
    minimumSourcingFeeUsd: 200,
    chinaLocalCostsUsd: 1000,
    oceanFreightUsd: {
      "20GP": 0,
      "40GP": 0,
      "40HQ": 6500
    },
    capacityCbm: {
      "20GP": 28,
      "40GP": 58,
      "40HQ": 68
    }
  },

  publicCalculator: {
    lclRecommendedMaxCbm: 15,
    compareLclFclMaxCbm: 28,
    maxFilesPerRequest: 10,
    maxIndividualItemsBeforeBulk: 20,
    note: "La cantidad de referencias no define el flete. El cálculo depende principalmente del CBM, peso, tipo de producto, origen y destino."
  },

  sourcing: {
    startingDepositUsd: 200
  },

  gallery: [
    {
      src: "operacion-contenedor-chile.webp",
      category: "cargas",
      label: "Cargas",
      title: "Seguimiento de contenedor a destino",
      text: "Coordinación de la operación y seguimiento de la carga después de su salida desde China."
    },
    {
      src: "carga-contenedor-verde.webp",
      category: "cargas",
      label: "Cargas",
      title: "Aprovechamiento del espacio",
      text: "Organización y carga de bultos para utilizar correctamente la capacidad disponible."
    },
    {
      src: "carga-herramientas.webp",
      category: "cargas",
      label: "Cargas",
      title: "Carga completa de mercancía",
      text: "Control visual del acomodo de cajas antes del cierre del contenedor."
    },
    {
      src: "carga-mixta-contenedor.webp",
      category: "cargas",
      label: "Cargas",
      title: "Consolidación de distintos productos",
      text: "Mercancía de diferentes referencias coordinada dentro de una misma operación."
    },
    {
      src: "hero-fabrica-industrial.webp",
      category: "fabricas",
      label: "Fábricas",
      title: "Visita a fábrica industrial",
      text: "Presencia en terreno para conocer el producto y evaluar la capacidad del proveedor."
    },
    {
      src: "fabrica-neumaticos.webp",
      category: "fabricas",
      label: "Fábricas",
      title: "Evaluación de capacidad productiva",
      text: "Recorrido por instalaciones y revisión del entorno de fabricación."
    },
    {
      src: "fabrica-revestimientos.webp",
      category: "fabricas",
      label: "Fábricas",
      title: "Revisión de materiales y acabados",
      text: "Comparación de colores, superficies y opciones disponibles directamente en fábrica."
    },
    {
      src: "control-produccion-textil.webp",
      category: "fabricas",
      label: "Control de calidad",
      title: "Control durante la producción",
      text: "Revisión del proceso y de las especificaciones antes de finalizar el pedido."
    },
    {
      src: "reunion-muestras-proveedor.webp",
      category: "clientes",
      label: "Clientes",
      title: "Reuniones con proveedores",
      text: "Comparación de muestras, negociación y definición de especificaciones con el cliente."
    },
    {
      src: "visita-equipo-fabrica.webp",
      category: "clientes",
      label: "Clientes",
      title: "Acompañamiento a fábricas",
      text: "Coordinación de visitas y comunicación directa entre cliente y proveedor."
    },
    {
      src: "clientes-tren-china.webp",
      category: "clientes",
      label: "Clientes",
      title: "Traslados durante la agenda comercial",
      text: "Apoyo logístico para conectar distintas ciudades, fábricas y reuniones."
    },
    {
      src: "clientes-shanghai.webp",
      category: "clientes",
      label: "Clientes",
      title: "Experiencia comercial en China",
      text: "Acompañamiento durante viajes que combinan reuniones, visitas y conocimiento del país."
    },
    {
      src: "viaje-yuyuan.webp",
      category: "china",
      label: "China",
      title: "Acompañamiento en Shanghái",
      text: "Apoyo al cliente durante su estadía y recorrido por distintas zonas de la ciudad."
    },
    {
      src: "viaje-gran-muralla.webp",
      category: "china",
      label: "China",
      title: "China más allá de los negocios",
      text: "Los viajes comerciales también pueden incluir planificación de actividades culturales."
    },
    {
      src: "viaje-beijing.webp",
      category: "china",
      label: "China",
      title: "Viajes personalizados",
      text: "Coordinación de rutas y acompañamiento según la agenda y los intereses del cliente."
    },
    {
      src: "china-shanghai-crop.webp",
      category: "china",
      label: "China",
      title: "Conexión con centros comerciales",
      text: "Presencia en ciudades estratégicas para proveedores, ferias y negocios internacionales."
    }
  ]
};
