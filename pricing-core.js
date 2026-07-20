(function (global) {
  "use strict";

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function moneyRound(value) {
    return Math.round((number(value) + Number.EPSILON) * 100) / 100;
  }

  function convertGoodsToUsd(amount, currency, config) {
    const value = number(amount);
    const code = String(currency || "USD").toUpperCase();
    if (code === "RMB" || code === "CNY") {
      const rate = number(config.exchange.commercialRmbPerUsd);
      return rate > 0 ? value / rate : 0;
    }
    return value;
  }

  function sourcingFee(goodsUsd, percent, minimumUsd, enabled) {
    if (!enabled) return 0;
    const goods = number(goodsUsd);
    if (goods <= 0) return null;
    return moneyRound(Math.max(goods * number(percent) / 100, number(minimumUsd)));
  }

  function calculateLcl(input, config) {
    const actualCbm = Math.max(0, number(input.cbm));
    const minimumBillableCbm = Math.max(0, number(config.lcl.minimumBillableCbm));
    const billableCbm = actualCbm > 0 ? Math.max(actualCbm, minimumBillableCbm) : 0;
    const goodsUsd = convertGoodsToUsd(input.goodsAmount, input.goodsCurrency, config);
    const baseRate = number(config.lcl.ratePerCbmUsd);
    const threshold = number(config.lcl.smallCargoThresholdCbm);
    const extraRate = number(config.lcl.smallCargoExtraPerCbmUsd);
    const smallCargo = billableCbm > 0 && billableCbm < threshold;
    const baseFreight = moneyRound(billableCbm * baseRate);
    const smallCargoExtra = moneyRound(smallCargo ? billableCbm * extraRate : 0);
    const sourcing = sourcingFee(
      goodsUsd,
      config.lcl.sourcingPercent,
      config.lcl.minimumSourcingFeeUsd,
      Boolean(input.includeSourcing)
    );
    const logistics = moneyRound(baseFreight + smallCargoExtra);
    const operationTotalKnown = moneyRound(
      goodsUsd + logistics + (sourcing || 0)
    );

    return {
      mode: "LCL",
      goodsAmount: number(input.goodsAmount),
      goodsCurrency: String(input.goodsCurrency || "USD").toUpperCase(),
      goodsUsd: moneyRound(goodsUsd),
      actualCbm,
      minimumBillableCbm,
      billableCbm,
      minimumApplied: actualCbm > 0 && actualCbm < minimumBillableCbm,
      baseRate,
      baseFreight,
      smallCargo,
      smallCargoExtraRate: smallCargo ? extraRate : 0,
      smallCargoExtra,
      includeSourcing: Boolean(input.includeSourcing),
      sourcing,
      sourcingPending: Boolean(input.includeSourcing) && sourcing === null,
      logistics,
      operationTotalKnown
    };
  }

  function calculateFcl(input, config) {
    const container = input.container || "40HQ";
    const goodsUsd = convertGoodsToUsd(input.goodsAmount, input.goodsCurrency, config);
    const sourcing = sourcingFee(
      goodsUsd,
      config.fcl.sourcingPercent,
      config.fcl.minimumSourcingFeeUsd,
      Boolean(input.includeSourcing)
    );
    const chinaLocal = number(config.fcl.chinaLocalCostsUsd);
    const oceanFreight = number(config.fcl.oceanFreightUsd[container]);
    const freightKnown = oceanFreight > 0;
    const knownSubtotal = moneyRound(goodsUsd + (sourcing || 0) + chinaLocal);
    const totalKnown = freightKnown
      ? moneyRound(knownSubtotal + oceanFreight)
      : null;

    return {
      mode: "FCL",
      goodsAmount: number(input.goodsAmount),
      goodsCurrency: String(input.goodsCurrency || "USD").toUpperCase(),
      goodsUsd: moneyRound(goodsUsd),
      container,
      includeSourcing: Boolean(input.includeSourcing),
      sourcing,
      sourcingPending: Boolean(input.includeSourcing) && sourcing === null,
      chinaLocal,
      oceanFreight,
      freightKnown,
      knownSubtotal,
      totalKnown
    };
  }

  function recommendMode(cbm, config) {
    const volume = Math.max(0, number(cbm));
    const lclMax = number(config.publicCalculator.lclRecommendedMaxCbm);
    const compareMax = number(config.publicCalculator.compareLclFclMaxCbm);

    if (volume <= 0) return { code: "pending", label: "Pendiente", container: null };
    if (volume <= lclMax) return { code: "lcl", label: "Consolidado LCL", container: null };
    if (volume <= compareMax) return { code: "compare", label: "Comparar LCL y FCL", container: "20GP" };
    if (volume <= number(config.fcl.capacityCbm["40GP"])) {
      return { code: "fcl_review", label: "Evaluar contenedor FCL", container: "40GP" };
    }
    return { code: "fcl_review", label: "Evaluar contenedor FCL", container: "40HQ" };
  }

  function exchangeTrend(config) {
    const current = number(config.exchange.referenceRmbPerUsd);
    const previous = number(config.exchange.previousReferenceRmbPerUsd);
    const difference = current - previous;
    const percent = previous > 0 ? difference / previous * 100 : 0;

    if (Math.abs(difference) < 0.00005) {
      return {
        direction: "stable",
        usdText: "El dólar se mantuvo estable frente al yuan",
        rmbText: "El yuan se mantuvo estable frente al dólar",
        percent
      };
    }
    if (difference > 0) {
      return {
        direction: "usd_up",
        usdText: "El dólar subió frente al yuan",
        rmbText: "El yuan bajó frente al dólar",
        percent
      };
    }
    return {
      direction: "usd_down",
      usdText: "El dólar bajó frente al yuan",
      rmbText: "El yuan subió frente al dólar",
      percent
    };
  }

  global.CHELME_PRICING = {
    calculateLcl,
    calculateFcl,
    recommendMode,
    convertGoodsToUsd,
    sourcingFee,
    exchangeTrend
  };
})(typeof window !== "undefined" ? window : globalThis);
