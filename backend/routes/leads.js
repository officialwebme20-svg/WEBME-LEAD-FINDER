import { Router } from "express";
import { searchPlaces } from "../services/googlePlaces.js";
import { researchEntity } from "../services/researchEngine.js";
import { websiteBrief } from "../services/opportunityEngine.js";
import { validateSearch } from "../utils/validation.js";

const router = Router();

router.post("/search", async (req,res)=>{
  const check=validateSearch(req.body);
  if(!check.ok) return res.status(400).json({success:false,error:{code:"INVALID_REQUEST",message:check.message}});
  try{
    const data=await searchPlaces(check.value);
    res.json({success:true,data});
  }catch(err){
    const code=err.code||"SEARCH_PROVIDER_UNAVAILABLE";
    res.status(err.status||503).json({success:false,error:{code,message:err.message||"Search service is temporarily unavailable."}});
  }
});

router.post("/research", async (req,res)=>{
  if(!req.body?.entity) return res.status(400).json({success:false,error:{code:"INVALID_REQUEST",message:"Entity is required."}});
  try{res.json({success:true,data:await researchEntity(req.body.entity,req.body.depth||"Quick Research")});}
  catch(err){res.status(503).json({success:false,error:{code:"RESEARCH_UNAVAILABLE",message:err.message}});}
});

router.post("/website-brief", async (req,res)=>{
  if(!req.body?.entity) return res.status(400).json({success:false,error:{code:"INVALID_REQUEST",message:"Entity is required."}});
  res.json({success:true,data:websiteBrief(req.body.entity)});
});

export default router;
