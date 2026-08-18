// Step 5G: verified LEGEND GATE published values.
// Medal acquisition probability and zone duration are not verified and are intentionally omitted.
export const LEGEND_GATE_PROFILE = Object.freeze({
  type:'ART_STOCK_SPECIAL_ZONE',
  trigger:'LONG_FREEZE',
  entryDenominator:{
    SHIN_RAIUN:88.9,
    SETTING_1_4:27127.0,
    SETTING_5:14840.9,
    SETTING_6:12100.7
  },
  medals:{
    1:{minGtStocks:2, expectedSetRange:'10.7-12.1'},
    2:{minGtStocks:5, expectedSetRange:'15.3-16.8'},
    3:{minGtStocks:6, expectedSetRange:'16.7-18.4'}
  },
  duration:'UNVERIFIED',
  medalAcquisitionModel:'UNVERIFIED'
});

export function getLegendGateBenefit(medals){
  return LEGEND_GATE_PROFILE.medals[Number(medals)] ?? null;
}
