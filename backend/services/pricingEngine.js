export function calculatePricing({websiteType="Business website",pages=5,design="Standard",features=[]}){
  const base={ "Business website":120000, "Portfolio":90000, "E-commerce":280000, "Booking website":220000, "Corporate website":250000 }[websiteType]||120000;
  const designFactor={Standard:1,Custom:1.35,Premium:1.75}[design]||1;
  const featureCosts={booking:50000,payment:45000,cms:60000,ecommerce:120000,dashboard:100000,accounts:80000,api:70000,database:80000,ai:120000,seo:35000,maintenance:0};
  const extras=features.reduce((s,f)=>s+(featureCosts[f]||0),0);
  const pageCost=Math.max(0,Number(pages)-3)*18000;
  const min=Math.round((base+extras+pageCost)*designFactor);
  const max=Math.round(min*1.45);
  const maintenanceMin=Math.round((min*.05)/1000)*1000, maintenanceMax=Math.round((max*.10)/1000)*1000;
  return {currency:"NGN",min,max,maintenanceMin,maintenanceMax,factors:[`${pages} pages`,`${design} design`,...features.map(x=>x)],scope:`${websiteType} with ${pages} pages and the selected features.`};
}
