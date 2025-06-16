    const chatBox = document.getElementById("chatBox");
    const chatInput = document.getElementById("chatInput");
    let visitorName = "";

    function startChat() {
      const name = document.getElementById("visitorName").value.trim();
      const email = document.getElementById("visitorEmail").value.trim();

      if (!name || !email) {
        alert("Please enter both name and email.");
        return;
      }

      visitorName = name;
      document.getElementById("introForm").style.display = "none";
      document.getElementById("userLabel").textContent = visitorName;

      setTimeout(() => {
        addMessage("bot", `Hi ${visitorName}! 👋 Welcome to Vivek’s interactive resume.`);
        setTimeout(() => {
          addMessage("bot", "What would you like to know? Type /skills, /experience, or /projects.");
        }, 800);
      }, 400);
    }

    function sendMessage() {
      const msg = chatInput.value.trim();
      if (!msg) return;
      addMessage("user", msg);
      chatInput.value = "";
      showTyping();
      setTimeout(() => {
        handleCommand(msg.toLowerCase());
        hideTyping();
      }, 1000);
    }

    function addMessage(sender, text) {
      const msg = document.createElement("div");
      msg.className = `message ${sender}`;
      msg.innerHTML = text;
      chatBox.appendChild(msg);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    function showTyping() {
      const typing = document.createElement("div");
      typing.className = "message bot typing-indicator";
      typing.id = "typing";
      typing.textContent = "Vivek is typing...";
      chatBox.appendChild(typing);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    function hideTyping() {
      const typing = document.getElementById("typing");
      if (typing) typing.remove();
    }

    function handleCommand(cmd) {
      if (cmd.includes("/skills")) {
        addMessage("bot", `<strong>My Skills:</strong><br>• HTML, CSS, JavaScript<br>• React, Shopify (Liquid), Node.js<br>• UI/UX Design, Web Performance`);
      } else if (cmd.includes("/experience")) {
        addMessage("bot", `<strong>Experience:</strong><br>• Frontend Dev at XYZ (2+ years)<br>• Shopify custom themes and apps<br>• Performance optimization`);
      } else if (cmd.includes("/projects")) {
        addMessage("bot", `<strong>Projects:</strong><br>🔹 <a href="#">Custom Shopify Bundle App</a><br>🔹 <a href="#">Portfolio Website</a><br>🔹 <a href="#">Analytics Dashboard</a>`);
      } else {
        addMessage("bot", "🤖 I didn’t get that. Try /skills, /experience or /projects.");
      }
    }