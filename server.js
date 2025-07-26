require("dotenv").config(); // Load environment variables

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Use the API key from the .env file
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Static file hosting
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

// Load resume data from JSON
const resume = JSON.parse(fs.readFileSync(path.join(__dirname, "resumeData.json"), "utf-8"));

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message?.trim();

  const commands = userMessage.toLowerCase();

  const systemPrompt = `
  You are ResumeBot, an AI assistant trained exclusively on Vivek Patel's resume JSON. Your job is to respond accurately, briefly, and only based on the data provided.

  📌 Rules:
  - DO NOT guess or fabricate any info.
  - DO NOT repeat the entire resume unless asked.
  - DO NOT add sections the user didn't ask for (like projects if they only asked about education).
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

  // Helper function to generate fallback responses based on user input
  function generateFallbackResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('skill') || lowerMsg.includes('tech') || lowerMsg.includes('language')) {
      return `🛠 <strong>My Skills:</strong><br/><mark>${resume.skills.join(", ")}</mark><br/><br/>I'm proficient in these technologies and always learning new ones!`;
    }
    
    if (lowerMsg.includes('education') || lowerMsg.includes('degree') || lowerMsg.includes('study') || lowerMsg.includes('university')) {
      return `🎓 <strong>Education:</strong><br/>${resume.education.degree}<br/>${resume.education.university}<br/><mark>${resume.education.duration}</mark>`;
    }
    
    if (lowerMsg.includes('experience') || lowerMsg.includes('work') || lowerMsg.includes('job') || lowerMsg.includes('career')) {
      const expList = resume.experience.map(exp => 
        `<strong>${exp.role}</strong> at <mark>${exp.company}</mark> (${exp.duration})<br/>• ${exp.responsibilities.join("<br/>• ")}`
      ).join("<br/><br/>");
      return `💼 <strong>My Experience:</strong><br/><br/>${expList}`;
    }
    
    if (lowerMsg.includes('project') || lowerMsg.includes('portfolio') || lowerMsg.includes('build') || lowerMsg.includes('develop')) {
      const projList = resume.projects.map(p =>
        `<strong>${p.name}</strong> (${p.date})<br/>${p.description}${p.url ? `<br/><a href="${p.url}" target="_blank">🔗 View Project</a>` : ""}`
      ).join("<br/><br/>");
      return `📁 <strong>My Projects:</strong><br/><br/>${projList}`;
    }
    
    if (lowerMsg.includes('contact') || lowerMsg.includes('email') || lowerMsg.includes('phone') || lowerMsg.includes('reach')) {
      return `📬 <strong>Contact Information:</strong><br/>
        📧 Email: <a href="mailto:vikupatel2001@gmail.com">vikupatel2001@gmail.com</a><br/>
        📱 Phone: <mark>+91 8658458987</mark><br/>
        💼 LinkedIn: <a href="https://linkedin.com/in/vivek-patel-shopify14082001" target="_blank">LinkedIn Profile</a><br/>
        💻 GitHub: <a href="https://github.com/vvk14" target="_blank">GitHub Profile</a><br/>
        🌐 Portfolio: <a href="https://www.babyorgano.com" target="_blank">Portfolio Website</a>`;
    }
    
    if (lowerMsg.includes('resume') || lowerMsg.includes('download') || lowerMsg.includes('cv')) {
      return `📄 You can download my resume here:<br/><a href="/resume/vivek_resume.pdf" download><button style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">⬇️ Download Resume</button></a>`;
    }
    
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
      return `👋 Hello! I'm <strong>Vivek Patel</strong>, a passionate developer. What would you like to know about me? You can ask about my <mark>skills</mark>, <mark>experience</mark>, <mark>projects</mark>, or <mark>education</mark>!`;
    }
    
    return `🤖 Hi! I'm Vivek's AI assistant. I can help you learn about:<br/>
      • 🛠 <strong>Skills & Technologies</strong><br/>
      • 💼 <strong>Work Experience</strong><br/>
      • 📁 <strong>Projects</strong><br/>
      • 🎓 <strong>Education</strong><br/>
      • 📬 <strong>Contact Information</strong><br/><br/>
      What would you like to know?`;
  }

  console.log("🔑 Using API Key:", OPENROUTER_API_KEY?.substring(0, 20) + "...");
  console.log("📝 User Message:", userMessage);

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
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
        },
        timeout: 10000 // 10 second timeout
      }
    );

    console.log("✅ OpenRouter API Response Status:", response.status);
    const reply = response.data.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error("❌ OpenRouter API Error:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Full error:", error.message);
    
    // Use fallback response instead of generic error
    console.log("🔄 Using fallback response system...");
    const fallbackReply = generateFallbackResponse(userMessage);
    res.json({ reply: fallbackReply });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

console.log("🔑 Loaded API Key:", process.env.OPENROUTER_API_KEY);
