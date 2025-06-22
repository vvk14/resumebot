const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Static file hosting
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

// 🔑 Your OpenRouter API Key
const OPENROUTER_API_KEY = "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";

// 🧠 Load resume data from JSON
const resume = JSON.parse(fs.readFileSync(path.join(__dirname, "resumeData.json"), "utf-8"));

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message?.trim();

  // ✅ Handle resume download request (before sending to AI)
  const commands = userMessage.toLowerCase();

  // 🎯 Strong system prompt — AI uses only the resume
  const systemPrompt = `
  You are ResumeBot, an AI assistant trained exclusively on Vivek Patel's resume JSON. Your job is to respond accurately, briefly, and only based on the data provided.

  📌 Rules:
  - DO NOT guess or fabricate any info.
  - DO NOT repeat the entire resume unless asked.
  - DO NOT add sections the user didn’t ask for (like projects if they only asked about education).
  - If someone asks for something not in the resume, politely decline.
  - Use <strong> and <mark> for styling important text.
  - For links (LinkedIn, GitHub, portfolio), use clean clickable anchor tags.
  - For the resume download, say:
    "📄 You can download my resume here" and include the button in this format:
    <a href="/resume/vivek_resume.pdf" download><button>⬇️ Download Resume</button></a>

  ---

  🎓 <strong>Education:</strong> ${resume.education.degree}, ${resume.education.university} (${resume.education.duration})

  🛠 <strong>Skills:</strong> ${resume.skills.join(", ")}

  💼 <strong>Experience:</strong>
  ${resume.experience.map(exp => 
    `• ${exp.role} at ${exp.company} (${exp.duration}): ${exp.responsibilities.join("; ")}`
  ).join("\n")}

  📁 <strong>Projects:</strong>
  ${resume.projects.map(p =>
    `• ${p.name} (${p.date}): ${p.description}${p.url ? " – " + p.url : ""}`
  ).join("\n")}

  📬 <strong>Contact:</strong>
  Email: vikupatel2001@gmail.com  
  Phone: +91 8658458987  
  LinkedIn: https://linkedin.com/in/vivek-patel-shopify14082001  
  GitHub: https://github.com/vvk14  
  Portfolio: https://www.babyorgano.com

  🎂 <strong>Birthday:</strong> 14 August 2001

  ✅ Respond professionally and conversationally. Keep each reply focused only on what was asked.
  `;



  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct", // fast, free, and OpenRouter-supported
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "VivekResumeBot",
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error("OpenRouter API Error:", error.response?.data || error.message);
    res.status(500).json({
      reply: "⚠️ I'm having trouble thinking right now. Please try again later."
    });
  }
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});