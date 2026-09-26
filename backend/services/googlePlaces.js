function requireKey(){
  if(!process.env.GOOGLE_PLACES_API_KEY){
    const e=new Error("Google Places configuration is missing."); e.code="SEARCH_PROVIDER_UNAVAILABLE"; e.status=503; throw e;
  }
}
export async function searchPlaces({country,region,area,additionalQuery,radius}){
  requireKey();
  const text=[additionalQuery,area,region,country].filter(Boolean).join(", ");
  const body={textQuery:text, languageCode:"en"};
  if(radius && area) body.locationBias={circle:{center:{latitude:0,longitude:0},radius:Number(radius.replace("km",""))*1000}};
  // IMPORTANT: locationBias above is deliberately not fabricated. The production adapter
  // should resolve a real area center before sending a radius. Without verified coordinates,
  // we omit the radius rather than pretending it was applied.
  delete body.locationBias;

  const response=await fetch("https://places.googleapis.com/v1/places:searchText",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "X-Goog-Api-Key":process.env.GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask":"places.id,places.displayName,places.formattedAddress,places.location,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.types,businessStatus"
    },
    body:JSON.stringify(body),
    signal:AbortSignal.timeout(12000)
  });
  if(!response.ok){
    const e=new Error(`Google Places returned HTTP ${response.status}.`);e.code="SEARCH_PROVIDER_UNAVAILABLE";e.status=response.status===429?429:503;throw e;
  }
  const json=await response.json();
  const results=(json.places||[]).map((p,i)=>({
    id:p.id||`provider-${i}`,
    name:p.displayName?.text||"UNKNOWN",
    type:p.types?.[0]||"UNKNOWN",
    country,region,area,
    address:p.formattedAddress||"Address unavailable",
    lat:typeof p.location?.latitude==="number"?p.location.latitude:null,
    lng:typeof p.location?.longitude==="number"?p.location.longitude:null,
    phone:p.nationalPhoneNumber||null,
    email:null, whatsapp:null,
    website:p.websiteUri||null,
    websiteStatus:p.websiteUri?"Website Found":"Website Unknown",
    websiteEvidence:p.websiteUri?"Google Places returned an official-looking website URI.":"No verified website URI returned by this provider.",
    rating:p.rating??null, reviewCount:p.userRatingCount??null,
    businessStatus:p.businessStatus||"UNKNOWN",
    social:{}, researchStatus:"Not researched",
    opportunity:p.websiteUri?null:{label:"Potential website opportunity",reason:"No verified website URI was returned by the current structured search provider. Deeper research is required before treating this as a confirmed absence."},
    confidence:p.formattedAddress&&p.location?"High":"Medium",
    sources:[{type:"Google Places",url:null}]
  }));
  return {query:{country,region,area,additionalQuery,radius},results,stats:{
    businessesFound:results.length,
    noWebsiteFound:results.filter(x=>!x.website).length,
    websiteFound:results.filter(x=>x.website).length,
    researchCompleted:0
  },map:{center:null,radius:null}};
}
