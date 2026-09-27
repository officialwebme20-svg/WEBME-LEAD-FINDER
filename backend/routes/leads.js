import { Router } from "express";
import { searchPlaces } from "../services/googlePlaces.js";
import { researchEntity } from "../services/researchEngine.js";
import { websiteBrief } from "../services/opportunityEngine.js";
import { validateSearch } from "../utils/validation.js";

const router = Router();

router.get("/test", (_req, res) => {
  res.json({
    success: true,
    data: {
      message: "LEADS ROUTE IS WORKING"
    }
  });
});

router.post("/search", async (req, res) => {
  try {
    const check = validateSearch(req.body);

    if (!check.ok) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: check.message
        }
      });
    }

    const data = await searchPlaces(check.value);

    return res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error("SEARCH ERROR:", err);

    return res.status(err.status || 503).json({
      success: false,
      error: {
        code: err.code || "SEARCH_PROVIDER_UNAVAILABLE",
        message: err.message || "Search service is temporarily unavailable."
      }
    });
  }
});

router.post("/research", async (req, res) => {
  if (!req.body?.entity) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: "Entity is required."
      }
    });
  }

  try {
    const data = await researchEntity(
      req.body.entity,
      req.body.depth || "Quick Research"
    );

    return res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error("RESEARCH ERROR:", err);

    return res.status(503).json({
      success: false,
      error: {
        code: "RESEARCH_UNAVAILABLE",
        message: err.message || "Research unavailable."
      }
    });
  }
});

router.post("/website-brief", async (req, res) => {
  if (!req.body?.entity) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: "Entity is required."
      }
    });
  }

  try {
    return res.json({
      success: true,
      data: websiteBrief(req.body.entity)
    });
  } catch (err) {
    return res.status(503).json({
      success: false,
      error: {
        code: "WEBSITE_BRIEF_UNAVAILABLE",
        message: err.message || "Website brief unavailable."
      }
    });
  }
});

export default router;
