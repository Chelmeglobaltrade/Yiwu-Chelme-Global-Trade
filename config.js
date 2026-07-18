window.CHELME_CONFIG = {
  business: {
    name: "Chelme Global Trade",
    whatsapp: "8615257960742",
    email: "alanchelme11@gmail.com",
    instagram: "https://www.instagram.com/alanen.china/",
    tiktok: "https://www.tiktok.com/@alanenchina",
    city: "Yiwu, Zhejiang, China"
  },

  exchange: {
    rmbPerUsd: 7.20
  },

  advisory: {
    startingPriceUsd: 200
  },

  lcl: {
    enabled: true,
    ratePerCbmUsd: 270,
    smallCargoThresholdCbm: 5,
    smallCargoExtraPerCbmUsd: 100,
    managementPercent: 8,
    minimumManagementUsd: 200,
    minimumRecommendedGoodsUsd: 5000,
    nextDepartureText: "Consultar próxima salida"
  },

  fcl: {
    enabled: true,
    managementPercent: 5,
    minimumManagementUsd: 200,
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

  qualityControl: {
    enabled: true,
    pricingMode: "quote",
    baseVisitUsd: 0,
    dayRateUsd: 0,
    reportIncluded: true,
    travelIncluded: false,
    note: "El valor depende de la ciudad, producto, cantidad de referencias y alcance de la inspección."
  },

  chinaTrip: {
    enabled: true,
    planningFeeUsd: 0,
    guidePerDayUsd: 0,
    interpreterPerDayUsd: 0,
    localTransportPerDayUsd: 0,
    note: "Los costos se confirman según ciudades, fechas, cantidad de días, ferias, fábricas y nivel de acompañamiento."
  },

  translation: {
    remotePerHourUsd: 0,
    onsitePerDayUsd: 0,
    note: "Cotización según idioma, duración, ciudad y complejidad técnica."
  },

  sourcing: {
    startingDepositUsd: 200,
    note: "Incluye evaluación inicial, definición del proceso y primeras gestiones según el alcance acordado."
  },

  restrictions: {
    blocked: [
      "Réplicas o falsificaciones",
      "Marcas registradas sin autorización"
    ],
    review: [
      "Baterías",
      "Líquidos",
      "Químicos",
      "Cosméticos",
      "Alimentos",
      "Productos regulados"
    ]
  }
};
