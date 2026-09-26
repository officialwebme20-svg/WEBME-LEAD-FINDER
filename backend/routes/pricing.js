import {Router} from "express";
import {calculatePricing} from "../services/pricingEngine.js";
const router=Router();
router.post("/calculate",(req,res)=>res.json({success:true,data:calculatePricing(req.body||{})}));
export default router;
