// Step 4F: verified RIZE ZONE published values.
// Entry rate / overall expectation / background confidence are published analysis values.
// Background-upgrade probabilities and zone duration are not verified and are intentionally omitted.

export const RIZE_PROFILE = Object.freeze({
  entryRate:2980.1,
  overallExpectation:44.66,
  backgrounds:['BLUE','YELLOW','GREEN','RED','PURPLE','RAINBOW'],
  confidence:{
    RIZE:{BLUE:35.58,YELLOW:36.04,GREEN:37.38,RED:45.02,PURPLE:76.01,RAINBOW:100},
    SHIN_RIZE:{BLUE:69.20,YELLOW:72.00,GREEN:73.69,RED:74.21,PURPLE:78.24,RAINBOW:100}
  }
});

export function getRizeConfidence(variant, background){
  return RIZE_PROFILE.confidence[variant]?.[background] ?? null;
}
