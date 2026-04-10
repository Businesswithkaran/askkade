import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors({
  origin: ["https://askkade.netlify.app", "http://localhost:3000"]
}));
app.use(express.json());

const API_KEY = process.env.GROQ_API_KEY;
console.log("API KEY LOADED:", API_KEY ? "YES ✅" : "NO ❌");

const SYSTEM_PROMPT = `You are AskKade, a smart and direct AI assistant. Follow these rules strictly:
- Answer the question directly. Never repeat the question back.
- Keep answers medium length — clear and well structured.
- Use short paragraphs or bullet points when listing things.
- Never add unnecessary filler like "Great question!" or "Certainly!".
- Never ask follow-up questions unless absolutely necessary.
- Be friendly, confident and to the point.
- If asked something simple, give a simple answer. If complex, structure it clearly.`;

app.post("/chat", async (req, res) => {
  const userInput = req.body.message;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "qwen/qwen3-32b",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userInput }
          ]
        })
      }
    );

    const data = await response.json();
    let reply = "No response";

    try {
      reply = data.choices[0].message.content;
    } catch (e) {
      console.log("FULL RESPONSE:", JSON.stringify(data));
      reply = data.error?.message || "Error from API";
    }

    res.json({ reply });

  } catch (error) {
    console.log("ERROR:", error);
    res.json({ reply: "Error connecting to AI" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});