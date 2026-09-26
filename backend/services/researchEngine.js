import { analyzeWebsite } from "./websiteResearch.js";
import { customSearch } from "./googleSearch.js";

export async function researchEntity(entity, depth){
  const result={entity:{...entity},identity:{name:entity.name||"UNKNOWN"},location:{address:entity.address||"UNKNOWN",lat:entity.lat??null,lng:entity.lng??null},contact:{phone:entity.phone||null,email:entity.email||null,whatsapp:entity.whatsapp||null},website:{},social:{},services:[],products:[],branches:[],research:{status:"IN_PROGRESS",depth,stages:[]},opportunity:entity.opportunity||null,sources:entity.sources||[],confidence:entity.confidence||"UNVERIFIED",changes:[]};
  result.research.stages.push({name:"Entity discovered",complete:true},{name:"Identity verified",complete:Boolean(entity.name)},{name:"Location checked",complete:Boolean(entity.address||entity.lat)});

  if(entity.website){
    const site=await analyzeWebsite(entity.website);
    result.website=site;
    result.research.stages.push({name:"Website checked",complete:true});
  }else{
    result.website={status:"Website Unknown",evidence:"A missing website field from structured search is not sufficient to establish that no website exists."};
    result.research.stages.push({name:"Website checked",complete:false});
  }

  if(depth!=="Quick Research"){
    const web=await customSearch(entity.name,entity.address||"");
    result.webResearch=web;
    result.research.stages.push({name:"Public web researched",complete:Boolean(web.completed)});
  }
  if(depth==="Deep Research"){
    result.research.stages.push({name:"Projects researched",complete:Boolean(result.webResearch?.completed)},
      {name:"Partnerships researched",complete:Boolean(result.webResearch?.completed)},
      {name:"News researched",complete:Boolean(result.webResearch?.completed)},
      {name:"Events researched",complete:Boolean(result.webResearch?.completed)});
  }
  result.research.status="COMPLETED";
  result.research.summary="Research completed using the configured public sources. Fields not supported by evidence remain unknown or unavailable.";
  result.research.gaps=["Social profiles require additional configured/public-source research where not found."];
  return result;
}
