import {Router} from "express";
const router=Router();
router.post("/convert",async(req,res)=>{
  const {amount,from,to}=req.body||{};
  if(!Number.isFinite(Number(amount))||!from||!to) return res.status(400).json({success:false,error:{code:"INVALID_REQUEST",message:"Amount, from and to are required."}});
  if(from===to) return res.json({success:true,data:{converted:Number(amount),rate:1,from,to,updated:new Date().toISOString()}});
  const base=process.env.CURRENCY_API_URL;
  if(!base) return res.status(503).json({success:false,error:{code:"CURRENCY_UNAVAILABLE",message:"Currency provider is unavailable."}});
  try{
    const u=new URL("/latest",base);u.searchParams.set("amount",String(amount));u.searchParams.set("from",from);u.searchParams.set("to",to);
    const r=await fetch(u,{signal:AbortSignal.timeout(8000)});
    if(!r.ok) throw new Error(`Currency provider returned HTTP ${r.status}.`);
    const j=await r.json(); const converted=j.rates?.[to];
    if(typeof converted!=="number") throw new Error("Currency provider returned no usable rate.");
    res.json({success:true,data:{converted,rate:converted/Number(amount),from,to,updated:j.date||null}});
  }catch(e){res.status(503).json({success:false,error:{code:"CURRENCY_UNAVAILABLE",message:e.message}});}
});
export default router;
