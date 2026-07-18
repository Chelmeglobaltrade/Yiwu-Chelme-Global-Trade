window.CHELME_CONFIG = {
  business: {
    name: "Chelme Global Trade",
    whatsapp: "8615257960742",
    email: "alanchelme11@gmail.com",
    instagram: "https://www.instagram.com/alanen.china/",
    tiktok: "https://www.tiktok.com/@alanenchina",
    city: "Yiwu, Zhejiang, China"
  },

  advisory: {
    priceUsd: 200,
    paymentMethods: ["Transferencia bancaria en USD", "USDT"],
    includes: [
      "Revisión del proyecto",
      "Evaluación del producto, cantidad y presupuesto",
      "Revisión de enlaces, fotografías o lista",
      "Estimación preliminar de costos",
      "Recomendación LCL o FCL",
      "Próximos pasos"
    ]
  },

  exchange: {
    commercialRmbPerUsd: 6.64,
    referenceRmbPerUsd: 6.7767,
    previousReferenceRmbPerUsd: 6.7733,
    updatedAt: "2026-07-17",
    validityDays: 3
  },

  lcl: {
    minimumBillableCbm: 1,
    smallCargoThresholdCbm: 5,
    smallCargoFixedUsd: 100,
    tiers: [
      { min: 0, max: 4.9999, rate: 260 },
      { min: 5, max: 9.9999, rate: 245 },
      { min: 10, max: 14.9999, rate: 230 },
      { min: 15, max: 24.9999, rate: 220 },
      { min: 25, max: 9999, rate: 210 }
    ]
  },

  sourcing: {
    lclPercent: 8,
    fclPercent: 5,
    minimumUsd: 200
  },

  fcl: {
    chinaOperationalUsd: 1000,
    oceanFreightUsd: {
      "20GP": 0,
      "40GP": 0,
      "40HQ": 5000
    }
  },

  publicNotes: {
    destination: "Los impuestos, agencia de aduanas, gastos portuarios y entrega en destino se confirman por separado.",
    restrictions: "Productos con baterías, líquidos, químicos, marcas registradas o requisitos especiales deben revisarse antes de aceptar la operación."
  }
};