const state = {
  results: [], selected: null, countries: [], saved: JSON.parse(localStorage.getItem("webme_saved") || "[]"),
  settings: JSON.parse(localStorage.getItem("webme_settings") || "{}")
};

const $ = (id) => document.getElementById(id);
const API_BASE_URL = "https://webme-lead-finder.onrender.com";

const api = async (url, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({
    success: false,
    error: {
      message: "Invalid server response."
    }
  }));

  if (!response.ok || data.success === false) {
    throw new Error(data.error?.message || "Request failed.");
  }

  return data.data;
};

function toast(message){ const el=document.createElement("div"); el.className="toast"; el.textContent=message; $("toastRoot").appendChild(el); setTimeout(()=>el.remove(),3200); }

function setupCountries(){
  state.countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czechia","Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];
  renderCountries("");
}
function renderCountries(filter=""){ const wrap=$("countryOptions"); wrap.innerHTML=""; state.countries.filter(c=>c.toLowerCase().includes(filter.toLowerCase())).forEach(c=>{const b=document.createElement("button");b.textContent=c;b.onclick=()=>{ $("countryButton").firstChild.textContent=c+" "; $("countryMenu").classList.add("hidden"); $("countryButton").dataset.country=c; };wrap.appendChild(b);}); }

function setupNavigation(){
  document.querySelectorAll(".nav-item").forEach(btn=>btn.onclick=()=>showView(btn.dataset.view));
  $("menuBtn").onclick=()=> $("sidebar").classList.toggle("open");
}
function showView(id){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  $(id).classList.add("active");
  document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.view===id));
  const title = $(id).querySelector("h2")?.textContent || "Lead Finder"; $("pageTitle").textContent=title;
  $("sidebar").classList.remove("open");
}
function setupTheme(){
  const saved=state.settings.theme||"system";
  applyTheme(saved);
  $("themeBtn").onclick=()=>applyTheme(document.body.classList.contains("dark")?"light":"dark");
  $("themeSetting").value=saved;
  $("themeSetting").onchange=e=>applyTheme(e.target.value);
}
function applyTheme(theme){ state.settings.theme=theme; localStorage.setItem("webme_settings",JSON.stringify(state.settings)); const dark=theme==="dark"||(theme==="system"&&matchMedia("(prefers-color-scheme: dark)").matches); document.body.classList.toggle("dark",dark); $("themeBtn").textContent=dark?"☀":"☾"; }

async function checkBackend(){ try{ await api("/api/health"); $("backendStatus").textContent="Backend online"; $("backendStatus").previousElementSibling.style.background="#16805c"; }catch{ $("backendStatus").textContent="Backend unavailable"; } }

function getSearchPayload(){ return {country:$("countryButton").dataset.country||"",region:$("regionInput").value.trim(),area:$("areaInput").value.trim(),additionalQuery:$("keywordInput").value.trim(),radius:$("radiusInput").value}; }

async function performSearch(){
  const payload=getSearchPayload();
  if(!payload.country || !payload.additionalQuery){toast("Select a country and enter an additional query.");return;}
  $("loadingState").classList.remove("hidden"); $("emptyState").classList.add("hidden"); $("resultsTableBody").innerHTML="";
  try{ const data=await api("/api/leads/search",{method:"POST",body:JSON.stringify(payload)}); state.results=data.results||[]; renderStats(data.stats||{}); renderResults(); $("activeFilters").textContent=`${payload.country}${payload.region?" · "+payload.region:""}${payload.area?" · "+payload.area:""} · ${payload.additionalQuery}`; if(!state.results.length)$("emptyState").classList.remove("hidden"); }
  catch(e){state.results=[];renderStats({});$("emptyState").classList.remove("hidden");toast(e.message);}
  finally{$("loadingState").classList.add("hidden");}
}
function renderStats(s){$("businessesFound").textContent=s.businessesFound||0;$("noWebsiteFound").textContent=s.noWebsiteFound||0;$("websiteFound").textContent=s.websiteFound||0;$("researchCompleted").textContent=s.researchCompleted||0;$("opportunityCount").textContent=s.noWebsiteFound||0;}
function renderResults(){
  const body=$("resultsTableBody");body.innerHTML="";
  state.results.forEach(lead=>{
    const tr=document.createElement("tr");
    const website=lead.website||"UNKNOWN", status=lead.websiteStatus||"Website Unknown";
    tr.innerHTML=`<td class="entity-cell"><strong>${esc(lead.name||"UNKNOWN")}</strong><small>${esc(lead.address||"Address unavailable")}</small></td>
      <td>${esc(lead.type||"UNKNOWN")}</td><td>${esc([lead.area,lead.region,lead.country].filter(Boolean).join(", ")||"UNKNOWN")}</td>
      <td>${lead.website?`<a href="${safeUrl(lead.website)}" target="_blank" rel="noopener">Open</a>`:"UNKNOWN"}</td>
      <td><span class="status-pill">${esc(status)}</span></td><td>${lead.rating??"UNKNOWN"}</td><td>${lead.reviewCount??"UNKNOWN"}</td>
      <td>${esc(lead.opportunity?.label||"Not analyzed")}</td>
      <td><div class="action-row"><button class="mini-btn" data-action="view">View</button><button class="mini-btn" data-action="research">Research</button><button class="mini-btn" data-action="save">Save</button></div></td>`;
    tr.querySelector('[data-action="view"]').onclick=()=>openDetails(lead);
    tr.querySelector('[data-action="research"]').onclick=()=>researchLead(lead);
    tr.querySelector('[data-action="save"]').onclick=()=>saveLead(lead);
    body.appendChild(tr);
  });
}
function openDetails(lead){
  state.selected=lead;$("detailsPanel").classList.add("open");$("detailsPanel").setAttribute("aria-hidden","false");
  $("detailsBusinessName").textContent=lead.name||"UNKNOWN";$("detailsBusinessType").textContent=lead.type||"UNKNOWN";$("detailsConfidence").textContent=lead.confidence||"UNVERIFIED";
  $("detailType").textContent=lead.type||"Unknown";$("detailAddress").textContent=lead.address||"Address unavailable";
  $("detailPhone").textContent=lead.phone||"Phone unavailable";$("detailEmail").textContent=lead.email||"Email unavailable";$("detailWhatsapp").textContent=lead.whatsapp||"WhatsApp unavailable";
  $("detailWebsiteStatusLarge").textContent=lead.websiteStatus||"Website Unknown";$("websiteEvidenceText").textContent=lead.websiteEvidence||"No verified website evidence available.";
  const socials=lead.social||{};["instagram","facebook","tiktok","linkedin","youtube"].forEach(p=>{ $(p+"Status").textContent=`${p[0].toUpperCase()+p.slice(1)}: ${socials[p]?"FOUND":"UNKNOWN"}`;});
  $("detailResearchStatus").textContent=lead.researchStatus||"Not researched";$("detailDescription").textContent=lead.description||"No research summary available.";$("detailOpportunity").textContent=lead.opportunity?.reason||"No opportunity analysis available.";
  $("aiContextName").textContent=lead.name||"Selected entity";
}
function closeDetails(){$("detailsPanel").classList.remove("open");$("detailsPanel").setAttribute("aria-hidden","true");}
async function researchLead(lead){
  openDetails(lead); $("detailResearchStatus").textContent="Researching public sources…";
  try{const data=await api("/api/leads/research",{method:"POST",body:JSON.stringify({entity:lead,depth:state.settings.depth||"Quick Research"})});Object.assign(lead,data.entity||{},data);openDetails(lead);toast("Research completed.");}
  catch(e){$("detailResearchStatus").textContent="Research unavailable";toast(e.message);}
}
function saveLead(lead){ if(!state.saved.some(x=>x.id===lead.id)){state.saved.push(lead);localStorage.setItem("webme_saved",JSON.stringify(state.saved));toast("Lead saved.");renderSaved();}else toast("Lead already saved.");}
function renderSaved(){const list=$("savedList"),empty=$("savedEmpty");list.innerHTML="";empty.classList.toggle("hidden",state.saved.length>0);state.saved.forEach(l=>{const d=document.createElement("div");d.className="lead-card";d.innerHTML=`<div><strong>${esc(l.name||"UNKNOWN")}</strong><br><small>${esc(l.address||"Location unavailable")}</small></div><div><button class="mini-btn">Open</button></div>`;d.querySelector("button").onclick=()=>openDetails(l);list.appendChild(d);});}

function setupPricing(){
 $("calculatePrice").onclick=async()=>{const features=[...document.querySelectorAll(".price-feature:checked")].map(x=>x.value);try{const d=await api("/api/pricing/calculate",{method:"POST",body:JSON.stringify({websiteType:$("priceType").value,pages:Number($("pricePages").value),design:$("priceDesign").value,features})});$("priceResult").classList.remove("hidden");$("priceResult").innerHTML=`<strong>${esc(d.currency||"NGN")} ${fmt(d.min)} – ${fmt(d.max)}</strong><br>Maintenance: ${esc(d.currency||"NGN")} ${fmt(d.maintenanceMin)} – ${fmt(d.maintenanceMax)} / month<br><br><b>Factors</b><br>${(d.factors||[]).map(esc).join("<br>")}<br><br><b>Scope</b><br>${esc(d.scope||"")}`;}catch(e){toast(e.message);}};
}
function setupCurrency(){
 const currencies=["USD","NGN","EUR","GBP","CAD","AUD","ZAR","GHS","KES","AED","JPY","CNY","INR"]; ["currencyFrom","currencyTo","defaultCurrency"].forEach(id=>{const s=$(id);currencies.forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=c;s.appendChild(o);});});$("currencyFrom").value="USD";$("currencyTo").value="NGN";
 $("convertCurrency").onclick=async()=>{try{const d=await api("/api/currency/convert",{method:"POST",body:JSON.stringify({amount:Number($("currencyAmount").value),from:$("currencyFrom").value,to:$("currencyTo").value})});$("currencyResult").classList.remove("hidden");$("currencyResult").innerHTML=`<strong>${fmt(d.converted)} ${esc(d.to)}</strong><br>Rate: ${esc(String(d.rate))}<br>Updated: ${esc(d.updated||"Provider timestamp unavailable")}`;}catch(e){$("currencyResult").classList.remove("hidden");$("currencyResult").textContent="Live exchange rate unavailable.";toast(e.message);}};
}
function setupAI(){
 $("openAi").onclick=()=>{$("aiPanel").classList.add("open");$("aiPanel").setAttribute("aria-hidden","false");};
 $("closeAi").onclick=()=>{$("aiPanel").classList.remove("open");};
 $("askWebMeButton").onclick=()=>{openAIFor(state.selected);};
 $("aiForm").onsubmit=async e=>{e.preventDefault();const q=$("aiInput").value.trim();if(!q)return;appendAI(q,true);$("aiInput").value="";try{const d=await api("/api/ai/ask",{method:"POST",body:JSON.stringify({question:q,entity:state.selected})});appendAI(d.answer||"Web Me returned no answer.");}catch(err){appendAI("Web Me is unavailable: "+err.message);}};
}
function openAIFor(entity){$("aiPanel").classList.add("open");$("aiContextName").textContent=entity?.name||"No entity selected";}
function appendAI(text,user=false){const d=document.createElement("div");d.className="ai-message"+(user?" user":"");d.textContent=text;$("aiMessages").appendChild(d);d.scrollIntoView();}
function setupExports(){document.querySelectorAll("[data-export]").forEach(btn=>btn.onclick=()=>exportData(btn.dataset.export));}
async function exportData(format){const records=$("exportDataset").value==="saved"?state.saved:state.results;if(!records.length){toast("There are no actual records to export.");return;}if(format==="json"){download("web-me-export.json",JSON.stringify(records,null,2),"application/json");return;}const headers=["name","type","country","region","area","address","phone","email","website","websiteStatus","rating","reviewCount","researchStatus","opportunity"];const csv=[headers.join(","),...records.map(r=>headers.map(h=>csvCell(h==="opportunity"?r.opportunity?.label:r[h])).join(","))].join("\n");download("web-me-export.csv",csv,"text/csv");}
function download(name,data,type){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Export generated.");}
function csvCell(v){return `"${String(v??"").replaceAll('"','""')}"`;}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function safeUrl(v){try{const u=new URL(v);return ["http:","https:"].includes(u.protocol)?u.href:"#";}catch{return "#";}}
function fmt(v){return Number(v||0).toLocaleString("en-NG",{maximumFractionDigits:2});}

function setup(){
 setupCountries();setupNavigation();setupTheme();setupPricing();setupCurrency();setupAI();setupExports();renderSaved();checkBackend();
 $("countryButton").onclick=()=>$("countryMenu").classList.toggle("hidden");$("countrySearch").oninput=e=>renderCountries(e.target.value);
 document.addEventListener("click",e=>{if(!$("countryMenu").contains(e.target)&&e.target!==$("countryButton"))$("countryMenu").classList.add("hidden");});
 $("searchButton").onclick=performSearch;$("closeDetails").onclick=closeDetails;
 $("defaultRadius").onchange=e=>{state.settings.radius=e.target.value;localStorage.setItem("webme_settings",JSON.stringify(state.settings));};
 $("researchDepth").onchange=e=>{state.settings.depth=e.target.value;localStorage.setItem("webme_settings",JSON.stringify(state.settings));};
}
setup();
