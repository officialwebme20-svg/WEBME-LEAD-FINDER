import express from "express";

const router = express.Router();

router.post("/ask", async (req, res) => {
  try {
    const { context = "", question = "" } = req.body || {};

    if (!question.trim()) {
      return res.status(400).json({
        error: "Question is required"
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: "GROQ_API_KEY is not configured"
      });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.1,
          messages: [
            {
              role: "system",
              content:
                "You are Web Me, an AI business and organization research assistant. Never invent facts. Clearly distinguish verified information, unavailable information, inference, and suggestions. Answer only from the supplied entity dossier and say when it is missing."
            },
            {
              role: "user",
              content: `ENTITY DOSSIER:
${context}

QUESTION:
${question}`
            }
          ]
        }),
        signal: AbortSignal.timeout(20000)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Groq API request failed"
      });
    }

    const answer = data?.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(502).json({
        error: "Groq returned no answer"
      });
    }

    return res.json({
      answer
    });
  } catch (error) {
    console.error("AI route error:", error);

    return res.status(500).json({
      error: error?.message || "AI request failed"
    });
  }
});

export default router;
