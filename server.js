require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

// Load resume data
const resume = JSON.parse(fs.readFileSync(path.join(__dirname, "resumeData.json"), "utf-8"));

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message?.trim();
  const lowerMsg = userMessage.toLowerCase();

  // Detect if the message is career/resume related
  const careerKeywords = [
    "skill",
    "experience",
    "project",
    "education",
    "resume",
    "job",
    "shopify",
    "developer",
    "work",
    "portfolio",
    "contact",
    "linkedin",
    "dob",
    "date of birth",
    "born",
    "birthplace",
    "place of birth",
    "github"
  ];
  const isCareerRelated = careerKeywords.some(word => lowerMsg.includes(word));

  let systemPrompt;

  if (isCareerRelated) {
    // If related to career → inject resume JSON
    systemPrompt = `
You are Vivek Patel, speaking naturally as yourself.
You are friendly, conversational, and professional.
The user is asking about your career or background, so use this resume info to answer:

${JSON.stringify(resume, null, 2)}

Only answer the specific question. Do not dump the entire resume unless the user specifically asks for "full resume".
    `;
  } else {
    // If small talk or general conversation → no resume
    systemPrompt = `
You are Vivek Patel, speaking naturally like a human in casual conversation.
Do not bring up career details unless the user asks about them.
    `;
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct", // You can change to a better conversational model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message.content.trim();
    res.json({ reply });

  } catch (error) {
    console.error("❌ OpenRouter API Error:", error.message);
    res.status(500).json({
      reply: "⚠️ I'm having trouble thinking right now. Please try again later."
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
