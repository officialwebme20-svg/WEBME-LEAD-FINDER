import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import leadsRouter from "./routes/leads.js";
import aiRouter from "./routes/ai.js";
import currencyRouter from "./routes/currency.js";
import pricingRouter from "./routes/pricing.js";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 3000);

app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",").map(x=>x.trim()) || true }));
app.use(express.json({ limit: "200kb" }));
app.use(rateLimit({ windowMs: 60_000, limit: 100, standardHeaders: true, legacyHeaders: false }));
app.use(express.static(root));

app.get("/api/health", (_req,res)=>res.json({success:true,data:{status:"ok"}}));
app.use("/api/leads", leadsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/currency", currencyRouter);
app.use("/api/pricing", pricingRouter);

app.get("*", (req,res)=>{
  if(req.path.startsWith("/api/")) return res.status(404).json({success:false,error:{code:"NOT_FOUND",message:"API route not found."}});
  res.sendFile(path.join(root,"index.html"));
});

app.listen(port,()=> {
  const services = {
    googlePlaces: Boolean(process.env.GOOGLE_PLACES_API_KEY),
    customSearch: Boolean(process.env.GOOGLE_CUSTOM_SEARCH_API_KEY && process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID),
    groq: Boolean(process.env.GROQ_API_KEY),
    currency: Boolean(process.env.CURRENCY_API_URL)
  };
  console.log(`Web Me running at http://localhost:${port}`);
  console.log("Provider availability:", services);
});
