document.addEventListener("DOMContentLoaded", () => {
  const chatbotButton    = document.getElementById("chatbot-button");
  const chatbotPopup     = document.getElementById("chatbot-popup");
  const chatbotSend      = document.getElementById("chatbot-send");
  const chatbotText      = document.getElementById("chatbot-text");
  const chatbotMessages  = document.getElementById("chatbot-messages");
  const clearChatButton  = document.getElementById("clear-chat");

  if (!chatbotButton || !chatbotPopup) return;

  // ---------- Historial (tolerante a formato viejo) ----------
  function loadHistory() {
    const raw = localStorage.getItem("forybot_chat");
    if (!raw) return [];

    // Si huele a HTML del formato viejo, limpiar y empezar vacío
    if (raw.includes("<div") || raw.includes("</")) {
      localStorage.removeItem("forybot_chat");
      localStorage.removeItem("forybot_lastSave");
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // Si no es JSON válido, limpiamos
      localStorage.removeItem("forybot_chat");
      localStorage.removeItem("forybot_lastSave");
      return [];
    }
  }

  function saveMessage(sender, text) {
    const chat = loadHistory();
    chat.push({ sender, text });
    localStorage.setItem("forybot_chat", JSON.stringify(chat));
    localStorage.setItem("forybot_lastSave", Date.now().toString());
  }

  // Borrar historial si pasaron 24 h
  (function expireHistory24h() {
    const last = localStorage.getItem("forybot_lastSave");
    if (last && Date.now() - parseInt(last, 10) > 24 * 60 * 60 * 1000) {
      localStorage.removeItem("forybot_chat");
      localStorage.removeItem("forybot_lastSave");
    }
  })();

  // ---------- UI ----------
  chatbotButton.addEventListener("click", () => {
    chatbotPopup.classList.toggle("hidden");
    if (!chatbotPopup.classList.contains("hidden")) {
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
  });

  const history = loadHistory();
  if (history.length) {
    history.forEach(m => appendMessage(m.sender, m.text));
  } else {
    appendMessage(
      "bot",
      "Hola, soy ForyBot. Puedo guiarte por el sitio: ver el menú, hacer una reserva o ir a tu perfil. ¿Qué necesitás hacer ahora?"
    );
  }

  chatbotSend.addEventListener("click", sendMessage);
  chatbotText.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  if (clearChatButton) {
    clearChatButton.addEventListener("click", () => {
      localStorage.removeItem("forybot_chat");
      localStorage.removeItem("forybot_lastSave");
      chatbotMessages.innerHTML = "";
      appendMessage(
        "bot",
        "Hola, soy ForyBot. Puedo guiarte por el sitio: ver el menú, hacer una reserva o ir a tu perfil. ¿Qué necesitás hacer ahora?"
      );
    });
  }

  // ---------- Envío ----------
  async function sendMessage() {
    const message = chatbotText.value.trim();
    if (!message) return;

    appendMessage("user", message);
    chatbotText.value = "";
    appendMessage("bot", "Pensando...");

    try {
      const resp = await fetch("app/Functions/dashboardUser/chatbot.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const data = await resp.json();
      chatbotMessages.lastChild.remove(); // quitar "Pensando..."

    if (data.reply) {
        appendMessage("bot", data.reply);
        saveMessage("user", message);
        saveMessage("bot", data.reply);
    } else {
        appendMessage("bot", data.error || "Error de red o servidor.");
    }
    } catch (err) {
        chatbotMessages.lastChild.remove();
        appendMessage("bot", "Error de red o servidor.");
        console.error(err);
    }
    }

  // ---------- Formateo de mensajes ----------
    function appendMessage(sender, text) {
    let formatted = text
      // **negrita**, *cursiva*, _cursiva_, `código`
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/_(.*?)_/g, "<em>$1</em>")
        .replace(/`(.*?)`/g, "<code>$1</code>")
        .replace(/#+\s?(.*)/g, "$1")
        .replace(/\[(.*?)\]\(.*?\)/g, "$1")
        .replace(/\n/g, "<br>");

    // Detectar pasos numerados (1., 2., 3.) y convertirlos a lista ordenada
    if (/^\s*\d+\.\s/m.test(formatted)) {
        const lines = formatted.split(/<br>/);
        let listItems = lines.map(line => {
            const match = line.match(/^\s*(\d+)\.\s*(.*)/);
            return match ? `<li>${match[2]}</li>` : line;
        });
        formatted = `<ol>${listItems.join("")}</ol>`;
    }

    const msg = document.createElement("div");
    msg.classList.add("chat-message", sender);
    msg.innerHTML = formatted; // interpreta HTML
    chatbotMessages.appendChild(msg);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
});
