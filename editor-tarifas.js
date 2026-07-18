const C = JSON.parse(JSON.stringify(window.CHELME_CONFIG));
const $ = (id) => document.getElementById(id);

const bindings = {
  eExchange: ["exchange", "rmbPerUsd"],
  eAdvisory: ["advisory", "startingPriceUsd"],
  eLclRate: ["lcl", "ratePerCbmUsd"],
  eLclThreshold: ["lcl", "smallCargoThresholdCbm"],
  eLclExtra: ["lcl", "smallCargoExtraPerCbmUsd"],
  eLclPct: ["lcl", "managementPercent"],
  eLclMin: ["lcl", "minimumManagementUsd"],
  eMinimumGoods: ["lcl", "minimumRecommendedGoodsUsd"],
  eFclPct: ["fcl", "managementPercent"],
  eFclMin: ["fcl", "minimumManagementUsd"],
  eChinaLocal: ["fcl", "chinaLocalCostsUsd"],
  eQcBase: ["qualityControl", "baseVisitUsd"],
  eQcDay: ["qualityControl", "dayRateUsd"],
  eTripPlanning: ["chinaTrip", "planningFeeUsd"],
  eTripGuide: ["chinaTrip", "guidePerDayUsd"],
  eTripInterpreter: ["chinaTrip", "interpreterPerDayUsd"],
  eTripTransport: ["chinaTrip", "localTransportPerDayUsd"],
  eTranslationHour: ["translation", "remotePerHourUsd"],
  eTranslationDay: ["translation", "onsitePerDayUsd"],
  eSourcing: ["sourcing", "startingDepositUsd"],
  eDeparture: ["lcl", "nextDepartureText"]
};

function getPath(path) {
  return path.reduce((obj, key) => obj[key], C);
}

function setPath(path, value) {
  const last = path[path.length - 1];
  const parent = path.slice(0, -1).reduce((obj, key) => obj[key], C);
  parent[last] = value;
}

Object.entries(bindings).forEach(([id, path]) => {
  $(id).value = getPath(path);
});

$("eFreight20").value = C.fcl.oceanFreightUsd["20GP"];
$("eFreight40").value = C.fcl.oceanFreightUsd["40GP"];
$("eFreight40HQ").value = C.fcl.oceanFreightUsd["40HQ"];

$("rateEditor").addEventListener("submit", (event) => {
  event.preventDefault();

  Object.entries(bindings).forEach(([id, path]) => {
    const input = $(id);
    const value = input.type === "number" ? Number(input.value || 0) : input.value;
    setPath(path, value);
  });

  C.fcl.oceanFreightUsd["20GP"] = Number($("eFreight20").value || 0);
  C.fcl.oceanFreightUsd["40GP"] = Number($("eFreight40").value || 0);
  C.fcl.oceanFreightUsd["40HQ"] = Number($("eFreight40HQ").value || 0);

  const content = "window.CHELME_CONFIG = " + JSON.stringify(C, null, 2) + ";\n";
  const blob = new Blob([content], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "config.js";
  link.click();
  URL.revokeObjectURL(url);
});
