(function () {
  if (window.chatbotWidgetLoaded) return;
  window.chatbotWidgetLoaded = true;

  const style = document.createElement('style')
  style.innerHTML = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    #chatbot-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    #chat-toggle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
    }

    #chat-toggle:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }

    #chat-toggle svg {
      width: 28px;
      height: 28px;
      fill: white;
      transition: transform 0.3s ease;
    }

    #chat-toggle.active svg.icon-chat {
      transform: scale(0);
    }

    #chat-toggle.active svg.icon-close {
      transform: scale(1);
    }

    #chat-toggle svg.icon-close {
      position: absolute;
      transform: scale(0);
    }

    #chat-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      height: 550px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      display: none;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.3s ease;
    }

    #chat-window.open {
      display: flex;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    #chat-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    #chat-header-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    #chat-header-info h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 2px;
    }

    #chat-header-info p {
      font-size: 12px;
      opacity: 0.9;
    }

    #chat-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: #f8f9fa;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    #chat-messages::-webkit-scrollbar {
      width: 6px;
    }

    #chat-messages::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 3px;
    }

    .message {
      max-width: 75%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message.bot {
      align-self: flex-start;
      background: white;
      color: #2d3748;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .message.user {
      align-self: flex-end;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-bottom-right-radius: 4px;
    }

    #chat-input-area {
      padding: 16px;
      background: white;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 10px;
      align-items: center;
    }

    #chat-input {
      flex: 1;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      padding: 12px 18px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.3s ease;
      font-family: inherit;
    }

    #chat-input:focus {
      border-color: #667eea;
    }

    #chat-send-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    #chat-send-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    #chat-send-btn:active {
      transform: scale(0.95);
    }

    #chat-send-btn svg {
      width: 20px;
      height: 20px;
      fill: white;
    }

    @media (max-width: 480px) {
      #chat-window {
        width: calc(100vw - 40px);
        height: calc(100vh - 100px);
      }
    }
  `
  document.head.appendChild(style)

  const widget = document.createElement('div');
  widget.id = 'chatbot-widget';
  widget.innerHTML = `
    <div id="chatbot-widget">
    <button id="chat-toggle" aria-label="Abrir chat">
      <svg class="icon-chat" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
      <svg class="icon-close" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>

    <div id="chat-window">
      <div id="chat-header">
        <div id="chat-header-avatar">🤖</div>
        <div id="chat-header-info">
          <h3>Asistente Virtual</h3>
          <p>Siempre disponible para ayudarte</p>
        </div>
      </div>

      <div id="chat-messages">
        <div class="message bot">
          ¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?
        </div>
      </div>

      <div id="chat-input-area">
        <input 
          type="text" 
          id="chat-input" 
          placeholder="Escribe tu mensaje..."
          aria-label="Escribe tu mensaje"
        >
        <button id="chat-send-btn" aria-label="Enviar mensaje">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
  `
  function init() {
    document.body.appendChild(widget);

    const toggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const messages = document.getElementById('chat-messages');

    toggle.addEventListener('click', function () {
      chatWindow.classList.toggle('open');
      toggle.classList.toggle('active');
      if (chatWindow.classList.contains('open')) {
        input.focus();
      }
    });

    function sendMessage() {
      const text = input.value.trim();
      if (!text) return;

      const userMsg = document.createElement('div');
      userMsg.className = 'message user';
      userMsg.textContent = text;
      messages.appendChild(userMsg);

      input.value = '';
      messages.scrollTop = messages.scrollHeight;

      setTimeout(function () {
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot';
        botMsg.textContent = 'Gracias por tu mensaje. ¿En qué más puedo ayudarte?';
        messages.appendChild(botMsg);
        messages.scrollTop = messages.scrollHeight;
      }, 800);
    }

    sendBtn.addEventListener('click', sendMessage);

    input.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    })

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})()