let visitorName = "";

function startChat() {
  const name = $.trim($("#visitorName").val());
  const email = $.trim($("#visitorEmail").val());

  if (!name || !email) {
    alert("Please enter both name and email.");
    return;
  }

  visitorName = name;
  $("#introForm").hide();
  $("#userLabel").text(visitorName);

  setTimeout(() => {
    addMessage("bot", `Hi ${visitorName}! 👋 Welcome to Vivek’s interactive resume.`);
    setTimeout(() => {
      addMessage("bot", "What would you like to know? Type /skills, /experience, or /projects.");
    }, 800);
  }, 400);
}

function sendMessage() {
  const msg = $.trim($("#chatInput").val());
  if (!msg) return;

  addMessage("user", msg);
  $("#chatInput").val("");
  showTyping();

  setTimeout(() => {
    handleCommand(msg.toLowerCase());
    hideTyping();
  }, 1000);
}

function addMessage(sender, text) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const msg = $(`
    <div class="message-container">
      <div class="message ${sender}">
        <div class="message-content">
          <div class="text">${text}</div>
        </div>
      </div>
      <div class="timestamp">${time}</div>
    </div>
  `);

  $("#chatBox").append(msg);
  $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
}

function showTyping() {
  const typing = $(`
    <div class="message bot typing-indicator" id="typing">
      Vivek is typing<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
    </div>
  `);

  $("#chatBox").append(typing);
  $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
}

function hideTyping() {
  $("#typing").remove();
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
