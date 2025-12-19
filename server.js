import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

/* ---------- GROQ API CALL ---------- */
async function callGroq(prompt) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant", // ✅ best quality
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.4
    })
  });

  const data = await response.json();

  if (!data.choices) {
    throw new Error(JSON.stringify(data));
  }

  return data.choices[0].message.content;
}

/* ---------- API ROUTE ---------- */
app.post("/api/generate", async (req, res) => {
  try {
    const { type, input } = req.body;

    let prompt = "";

    if (type === "ask") {
      prompt = `Answer this clearly:\n${input}`;
    }
    else if (type === "summary") {
      prompt = `Summarize this text clearly:\n${input}`;
    }
    else if (type === "idea") {
      prompt = `Give creative ideas about:\n${input}`;
    }
    else if (type === "define") {
      prompt = `Define this term in simple words:\n${input}`;
    }
    else {
      return res.status(400).json({ error: "Invalid type" });
    }

    const result = await callGroq(prompt);
    res.json({ success: true, result });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Groq server running on http://localhost:${PORT}`);
});
