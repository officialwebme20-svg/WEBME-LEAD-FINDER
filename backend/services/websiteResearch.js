function safeHttpUrl(value){
  const u=new URL(value);
  if(!["http:","https:"].includes(u.protocol)) throw new Error("Only HTTP/HTTPS websites may be researched.");
  const host=u.hostname.toLowerCase();
  if(host==="localhost" || host==="127.0.0.1" || host==="0.0.0.0" || host.startsWith("10.") || host.startsWith("192.168.") || host.startsWith("169.254.")) throw new Error("Restricted network target.");
  return u;
}
export async function analyzeWebsite(url){
  const u=safeHttpUrl(url);
  const r=await fetch(u,{redirect:"follow",signal:AbortSignal.timeout(10000),headers:{"User-Agent":"WebMeResearch/0.1 (+public-research)"}});
  const html=await r.text();
  const title=(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||"").replace(/\s+/g," ").trim();
  const description=html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]||null;
  const social=[...html.matchAll(/https?:\/\/(?:www\.)?(instagram|facebook|tiktok|linkedin|x|twitter|youtube)\.com\/[^"' <]+/gi)].map(m=>m[0]);
  return {status:r.ok?"Website Found":"Website Error",httpStatus:r.status,reachable:r.ok,finalUrl:r.url,title:title||null,metaDescription:description,socialLinks:[...new Set(social)],evidence:"Public HTTP/HTTPS response inspected. No authentication or private area was accessed."};
}
