import {Router} from "express";
const router=Router();
router.post("/ask",async(req,res)=>{
  const {question,entity}=req.body||{};
  if(!question) return res.status(400).json({success:false,error:{code:"INVALID_REQUEST",message:"Question is required."}});
  if(!process.env.GROQ_API_KEY) return res.status(503).json({success:false,error:{code:"AI_UNAVAILABLE",message:"Web Me AI is unavailable because GROQ_API_KEY is not configured."}});
  const context=JSON.stringify(entity||{});
  try{
    const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${process.env.GROQ_API_KEY}`},body:JSON.stringify({model:"llama-3.3-70b-versatile",temperature:.1,messages:[{role:"system",content:"You are Web Me, an AI business and organization research assistant. Never invent facts. Clearly distinguish verified information, unavailable information, inference, and suggestions. Answer only from the supplied entity dossier and say when it is missing."},{role:"user",content:`ENTITY DOSSIER:\n${context}\n\nQUESTION:\n${question}`}]),signal:AbortSignal.timeout(20000)});
    if(!r.ok) throw new Error(`Groq returned HTTP ${r.status}.`);
    const j=await r.json();res.json({success:true,data:{answer:j.choices?.[0]?.message?.content||"No answer returned."}});
  }catch(e){res.status(503).json({success:false,error:{code:"AI_UNAVAILABLE",message:e.message}});}
});
export default router;
