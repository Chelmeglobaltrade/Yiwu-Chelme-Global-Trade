window.CHELME_CONFIG = {
  business: {
    name: "Chelme Global Trade",
    whatsapp: "8615257960742",
    email: "chelmeglobaltrade@gmail.com",
    instagram: "https://www.instagram.com/alanen.china/",
    instagramHandle: "@alanen.china",
    tiktok: "https://www.tiktok.com/@alanenchina",
    tiktokHandle: "@alanenchina",
    instagramBusiness: "https://www.instagram.com/chelmeglobaltrade/",
    instagramBusinessHandle: "@chelmeglobaltrade",
    city: "Yiwu, Zhejiang, China",
    address: "Room 718, Building A, Liandu Building, No. 3 Jinrong 3rd Street, Yiwu, China"
  },

  // Versión vigente de Términos y Política de privacidad. Cambiarla cuando se modifiquen esos textos:
  // queda guardada en el perfil de cada cliente nuevo como prueba de lo que aceptó.
  legal: {
    termsVersion: "2026-09-28",
    // Datos de la empresa en Chile. Cuando estén completos, se muestran en Términos, Privacidad y el pie de página.
    company: {
      legalName: "",   // Razón social, ej.: "Chelme Global Trade SpA"
      rut: "",         // RUT de la empresa, ej.: "77.123.456-7"
      address: ""      // Domicilio legal en Chile
    }
  },

  exchange: {
    referenceRmbPerUsd: 6.6696,
    previousReferenceRmbPerUsd: 6.7767,
    commercialRmbPerUsd: 6.53,
    updatedAt: "2026-10-31",
    sourceLabel: "Referencia de mercado USD/CNY",
    bufferPercent: 2.02,
    quoteValidityDays: 3,
    note: "El tipo de cambio comercial incluye margen de protección por variación cambiaria, costos bancarios y tiempo de liquidación."
  },

  advisory: {
    startingPriceUsd: 200,
    startingPriceClp: 190000,
    clpReferenceNote: "Valor en CLP referencial según tipo de cambio, actualizado periódicamente.",
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
    amountClp: 190000,
    referencePrefix: "ASESORIA",
    bankDetailsPublished: false,
    methods: ["Transferencia bancaria en CLP", "Transferencia bancaria en USD", "USDT"],
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
    ratePerCbmUsd: 270,          // desde 5 m³
    smallCargoRatePerCbmUsd: 280, // bajo 5 m³ (más el cargo operativo fijo)
    minimumBillableCbm: 1,
    smallCargoThresholdCbm: 5,
    smallCargoExtraFlatUsd: 100,
    sourcingPercent: 8,
    minimumSourcingFeeUsd: 200,
    minimumRecommendedGoodsUsd: 5000,
    nextDepartureText: "Consultar próxima salida",
    explanation: "Se cobra por el CBM facturable. Si la carga ocupa menos de 1 m³, el mínimo facturable es 1 m³."
  },
  destinationCosts: {
    taxesIncludedInPublicEstimate: false,
    customsBrokerIncluded: true,
    portChargesIncluded: true,
    finalDeliveryIncluded: false,
    message: "En consolidado LCL, el agente de aduana y los gastos portuarios van en la tarifa por m³. IVA y arancel se pagan aparte, antes de la llegada."
  },
  // Alcance único del consolidado LCL: lo leen la página, el cotizador, el PDF y los términos.
  lclScope: {
    version: "2026-09-27",
    deliveryPlace: "nuestra bodega en Santiago",
    includes: [
      "Recepción y revisión en nuestra bodega de Yiwu: conteo, fotos, medición y peso",
      "Consolidación y flete marítimo hasta Chile",
      "Seguro de la carga",
      "Gastos portuarios y agente de aduana en Chile",
      "Traslado a nuestra bodega en Santiago"
    ],
    payAside: [
      "La mercancía que pagas a tu proveedor",
      "IVA de importación y arancel, si aplica: se calculan con la declaración de aduana y se pagan antes de la llegada"
    ],
    excludes: [
      "Traslado desde la fábrica hasta nuestra bodega en China",
      "Envío a regiones: se cotiza aparte",
      "Permisos o certificaciones (SEC, SAG, ISP u otros)",
      "Control de calidad y búsqueda de proveedor: son servicios aparte",
      "Bodegaje en Santiago después de los días sin costo"
    ],
    weightReviewKgPerCbm: 500
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
      src: "feria-canton-entrada.webp",
      category: "ferias",
      label: "Ferias",
      title: "Feria de Cantón 2026",
      text: "Entrada de la Feria de Importación y Exportación de China, en Guangzhou, edición 140."
    },
    {
      src: "feria-canton-maquinaria-agricola.webp",
      category: "ferias",
      label: "Ferias",
      title: "Maquinaria agrícola en la Feria de Cantón",
      text: "Visita a stands de tractores e implementos agrícolas para conocer y comparar proveedores."
    },
    {
      src: "feria-canton-maquinaria-construccion.webp",
      category: "ferias",
      label: "Ferias",
      title: "Maquinaria de construcción en la Feria de Cantón",
      text: "Reunión en un stand de miniexcavadoras y rodillos compactadores."
    },
    {
      src: "visita-empresa-clientes.webp",
      category: "clientes",
      label: "Clientes",
      title: "Visita a empresa con clientes",
      text: "Reunión con el equipo de una empresa china durante el viaje comercial."
    },
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
      src: "shanghai-grupo-pudong.webp",
      category: "clientes",
      label: "Clientes",
      title: "Grupo del viaje comercial en Shanghái",
      text: "Recorrido por Pudong con el grupo, entre reuniones, visitas y conocimiento del país."
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
      src: "bodega-ropa-clasificacion.webp",
      category: "fabricas",
      label: "Fábricas",
      title: "Clasificación de mercancía en bodega",
      text: "Bodega industrial con clasificación y selección de producto antes de su despacho."
    },
    {
      src: "guangzhou-canton-tower.webp",
      category: "china",
      label: "China",
      title: "Guangzhou de noche",
      text: "Torre de Cantón, en una de las ciudades comerciales donde coordinamos compras y visitas."
    },
    {
      src: "shanghai-noche-pudong.webp",
      category: "china",
      label: "China",
      title: "Shanghái de noche",
      text: "Pudong visto desde el Bund. Shanghái es uno de los centros de negocios que visitamos con nuestros clientes."
    },
    {
      src: "contenedor-carga-mixta-almacen.webp",
      category: "cargas",
      label: "Cargas",
      title: "Contenedor cargado y ordenado",
      text: "Carga mixta acomodada dentro del contenedor, lista para cerrar y embarcar."
    },
    {
      src: "yuyuan-shanghai-noche.webp",
      category: "china",
      label: "China",
      title: "Jardín Yuyuan, Shanghái",
      text: "Zona comercial e histórica de Shanghái, parte de las rutas de viaje comercial."
    }
  ]
};
