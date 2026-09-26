export async function customSearch(query, location=""){
  if(!process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || !process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID){
    return {completed:false,reason:"Google Custom Search configuration is unavailable.",results:[]};
  }
  const q=encodeURIComponent(`${query} ${location}`.trim());
  const url=`https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(process.env.GOOGLE_CUSTOM_SEARCH_API_KEY)}&cx=${encodeURIComponent(process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID)}&q=${q}`;
  const r=await fetch(url,{signal:AbortSignal.timeout(10000)});
  if(!r.ok) return {completed:false,reason:`Custom Search returned HTTP ${r.status}.`,results:[]};
  const j=await r.json();
  return {completed:true,results:(j.items||[]).map(x=>({title:x.title,url:x.link,snippet:x.snippet||null}))};
}
