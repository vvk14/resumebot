function isSimilar(input, keywords, threshold = 2) {
  input = input.toLowerCase();
  return keywords.some(keyword => {
    const distance = levenshtein(input, keyword);
    return distance <= threshold || input.includes(keyword);
  });
}

function levenshtein(a, b) {
  const matrix = [];
  const al = a.length, bl = b.length;
  for (let i = 0; i <= bl; i++) matrix[i] = [i];
  for (let j = 0; j <= al; j++) matrix[0][j] = j;
  for (let i = 1; i <= bl; i++) {
    for (let j = 1; j <= al; j++) {
      matrix[i][j] = b[i - 1] === a[j - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
    }
  }
  return matrix[bl][al];
}

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

function handleCommand(input) {
  // Always send input to OpenAI for smart replies
  $.ajax({
    url: "http://localhost:5000/chat",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ message: input }),
    success: function (response) {
      hideTyping();
      addMessage("bot", response.reply);
    },
    error: function () {
      hideTyping();
      addMessage("bot", "⚠️ I'm having trouble thinking right now. Please try again later.");
    }
  });
}
// Send message on Enter key
$("#chatInput").on("keypress", function (e) {
  if (e.which === 13 && !e.shiftKey) {
    sendMessage();
    return false; // Prevent line break
  }
});