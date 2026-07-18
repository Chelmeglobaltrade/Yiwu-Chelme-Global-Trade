(function (global) {
  "use strict";

  const n = value => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const round = value => Math.round((n(value) + Number.EPSILON) * 100) / 100;

  function convertToUsd(amount, currency, config) {
    const value = n(amount);
    return String(currency || "USD").toUpperCase() === "RMB"
      ? round(value / n(config.exchange.commercialRmbPerUsd))
      : round(value);
  }

  function lclRate(cbm, config) {
    const actual = Math.max(0, n(cbm));
    const billable = actual > 0
      ? Math.max(actual, n(config.lcl.minimumBillableCbm))
      : 0;
    const tier = config.lcl.tiers.find(item => billable >= item.min && billable <= item.max)
      || config.lcl.tiers[config.lcl.tiers.length - 1];
    return { actual, billable, rate: n(tier.rate) };
  }

  function sourcingFee(goodsUsd, includeSourcing, percent, minimum) {
    if (!includeSourcing) return 0;
    if (n(goodsUsd) <= 0) return null;
    return round(Math.max(n(goodsUsd) * n(percent) / 100, n(minimum)));
  }

  function calculateLcl(input, config) {
    const goodsUsd = convertToUsd(input.goodsAmount, input.goodsCurrency, config);
    const rateInfo = lclRate(input.cbm, config);
    const baseFreight = round(rateInfo.billable * rateInfo.rate);
    const smallCargoFixed = rateInfo.billable > 0 &&
      rateInfo.billable < n(config.lcl.smallCargoThresholdCbm)
      ? n(config.lcl.smallCargoFixedUsd)
      : 0;
    const sourcing = sourcingFee(
      goodsUsd,
      Boolean(input.includeSourcing),
      config.sourcing.lclPercent,
      config.sourcing.minimumUsd
    );
    const logistics = round(baseFreight + smallCargoFixed);
    const totalKnown = round(goodsUsd + logistics + (sourcing || 0));

    return {
      mode: "LCL",
      goodsUsd,
      goodsAmount: n(input.goodsAmount),
      goodsCurrency: String(input.goodsCurrency || "USD").toUpperCase(),
      actualCbm: rateInfo.actual,
      billableCbm: rateInfo.billable,
      minimumApplied: rateInfo.actual > 0 && rateInfo.actual < n(config.lcl.minimumBillableCbm),
      rate: rateInfo.rate,
      baseFreight,
      smallCargoFixed,
      includeSourcing: Boolean(input.includeSourcing),
      sourcing,
      logistics,
      totalKnown
    };
  }

  function calculateFcl(input, config) {
    const container = input.container || "40HQ";
    const goodsUsd = convertToUsd(input.goodsAmount, input.goodsCurrency, config);
    const sourcing = sourcingFee(
      goodsUsd,
      Boolean(input.includeSourcing),
      config.sourcing.fclPercent,
      config.sourcing.minimumUsd
    );
    const origin = n(config.fcl.chinaOperationalUsd);
    const ocean = n(config.fcl.oceanFreightUsd[container]);
    const totalKnown = ocean > 0
      ? round(goodsUsd + origin + ocean + (sourcing || 0))
      : null;

    return {
      mode: "FCL",
      container,
      goodsUsd,
      goodsAmount: n(input.goodsAmount),
      goodsCurrency: String(input.goodsCurrency || "USD").toUpperCase(),
      includeSourcing: Boolean(input.includeSourcing),
      sourcing,
      origin,
      ocean,
      oceanKnown: ocean > 0,
      totalKnown
    };
  }

  function exchangeTrend(config) {
    const current = n(config.exchange.referenceRmbPerUsd);
    const previous = n(config.exchange.previousReferenceRmbPerUsd);
    const difference = current - previous;
    const percent = previous ? difference / previous * 100 : 0;
    if (Math.abs(difference) < 0.00005) {
      return { text: "Sin variación relevante", percent };
    }
    return {
      text: difference > 0
        ? "El dólar subió frente al yuan"
        : "El dólar bajó frente al yuan",
      percent
    };
  }

  global.CHELME_PRICING = {
    calculateLcl,
    calculateFcl,
    convertToUsd,
    exchangeTrend
  };
})(typeof window !== "undefined" ? window : globalThis);