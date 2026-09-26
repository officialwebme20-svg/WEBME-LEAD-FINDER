export function validateSearch(body={}){
  const country=String(body.country||"").trim(), region=String(body.region||"").trim(), area=String(body.area||"").trim(), additionalQuery=String(body.additionalQuery||"").trim(), radius=String(body.radius||"").trim();
  if(!country) return {ok:false,message:"Country is required."};
  if(!additionalQuery) return {ok:false,message:"Additional Query is required."};
  if(additionalQuery.length>200) return {ok:false,message:"Additional Query is too long."};
  if(region.length>150||area.length>150) return {ok:false,message:"Location input is too long."};
  return {ok:true,value:{country,region,area,additionalQuery,radius}};
}
