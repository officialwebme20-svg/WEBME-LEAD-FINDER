export function websiteBrief(entity){
  const hasWebsite=Boolean(entity.website);
  return {
    purpose:hasWebsite?"Improve and extend the entity's existing public digital presence":"Create a public website opportunity based on verified research gaps.",
    targetUsers:"UNKNOWN until audience is supported by research.",
    recommendedWebsiteType:entity.type?.toLowerCase().includes("restaurant")?"Restaurant website":entity.type?.toLowerCase().includes("hotel")?"Hotel website":"Business website",
    currentDigitalPresence:hasWebsite?"Verified website URL is present in the entity record.":"No verified website URL is currently present in the entity record; this is not by itself proof that none exists.",
    pages:["Home","About","Services","Contact"],
    features:["Responsive design","Clear contact information","Search-friendly page structure"],
    caveat:"Feature recommendations are suggestions, not claims about what the entity currently needs."
  };
}
