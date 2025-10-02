// widget.js - Script embebible para tu chatbot
// Uso: <script src="https://tu-dominio.duna.com/widget.js"></script>

(function() {
  'use strict';

  // Prevenir múltiples inicializaciones
  if (window.MiChatbot) {
    console.warn('MiChatbot ya está inicializado');
    return;
  }

  // Configuración por defecto
  const DEFAULT_CONFIG = {
    apiUrl: 'https://tu-dominio.duna.com/api',
    apiKey: '',
    position: 'bottom-right',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    welcomeMessage: '¡Hola! 👋 ¿En qué puedo ayudarte hoy?',
    placeholder: 'Escribe tu mensaje...',
    avatar: null,
    storeName: 'Asistente Virtual',
    autoOpen: false,
    showTimestamp: true,
    soundEnabled: false
  };

  class MiChatbot {
    constructor(userConfig = {}) {
      this.config = { ...DEFAULT_CONFIG, ...userConfig };
      this.isOpen = false;
      this.isMinimized = false;
      this.sessionId = this.getOrCreateSessionId();
      this.messages = [];
      this.isTyping = false;
      
      this.init();
    }

    getOrCreateSessionId() {
      let sessionId = localStorage.getItem('chatbot_session_id');
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('chatbot_session_id', sessionId);
      }
      return sessionId;
    }

    init() {
      this.injectStyles();
      this.createWidget();
      this.attachEventListeners();
      
      if (this.config.autoOpen) {
        setTimeout(() => this.open(), 1000);
      }
    }

    injectStyles() {
      if (document.getElementById('michatbot-styles')) return;

      const css = `
        /* Reset para el widget */
        #michatbot-container,
        #michatbot-container * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }

        /* Container principal */
        #michatbot-container {
          position: fixed;
          ${this.getPositionStyles()}
          z-index: 2147483647;
          font-size: 14px;
        }

        /* Botón flotante */
        .michatbot-launcher {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
          border-radius: 50%;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .michatbot-launcher::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.1);
          transform: scale(0);
          border-radius: 50%;
          transition: transform 0.6s;
        }

        .michatbot-launcher:hover::before {
          transform: scale(1);
        }

        .michatbot-launcher:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .michatbot-launcher:active {
          transform: scale(0.95);
        }

        .michatbot-launcher svg {
          width: 32px;
          height: 32px;
          fill: white;
          position: relative;
          z-index: 1;
          transition: transform 0.3s;
        }

        .michatbot-launcher.open svg {
          transform: rotate(90deg);
        }

        /* Badge de notificación */
        .michatbot-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: white;
          border-radius: 12px;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 600;
          min-width: 20px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
          animation: michatbot-pulse 2s infinite;
        }

        @keyframes michatbot-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        /* Ventana del chat */
        .michatbot-window {
          width: 400px;
          height: 650px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
          display: none;
          flex-direction: column;
          overflow: hidden;
          opacity: 0;
          transform: translateY(20px) scale(0.95);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .michatbot-window.open {
          display: flex;
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .michatbot-window.minimized {
          height: 72px;
        }

        /* Header */
        .michatbot-header {
          background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
          color: white;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .michatbot-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: michatbot-shimmer 8s infinite;
        }

        @keyframes michatbot-shimmer {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(180deg); }
        }

        .michatbot-header-content {
          display: flex;
          align-items: center;
          gap: 14px;
          position: relative;
          z-index: 1;
        }

        .michatbot-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255, 255, 255, 0.3);
          position: relative;
        }

        .michatbot-avatar::after {
          content: '';
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          background: #10b981;
          border-radius: 50%;
          border: 2px solid white;
          animation: michatbot-online-pulse 2s infinite;
        }

        @keyframes michatbot-online-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .michatbot-avatar svg {
          width: 24px;
          height: 24px;
          fill: white;
        }

        .michatbot-info {
          flex: 1;
        }

        .michatbot-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 2px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .michatbot-status {
          font-size: 13px;
          opacity: 0.9;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .michatbot-status::before {
          content: '';
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          animation: michatbot-blink 1.5s infinite;
        }

        @keyframes michatbot-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .michatbot-actions {
          display: flex;
          gap: 8px;
          position: relative;
          z-index: 1;
        }

        .michatbot-action-btn {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          backdrop-filter: blur(10px);
        }

        .michatbot-action-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: scale(1.05);
        }

        .michatbot-action-btn:active {
          transform: scale(0.95);
        }

        .michatbot-action-btn svg {
          width: 20px;
          height: 20px;
          fill: white;
        }

        /* Área de mensajes */
        .michatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
          scroll-behavior: smooth;
        }

        .michatbot-messages::-webkit-scrollbar {
          width: 6px;
        }

        .michatbot-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .michatbot-messages::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 3px;
        }

        .michatbot-messages::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }

        /* Mensaje */
        .michatbot-message {
          display: flex;
          margin-bottom: 20px;
          animation: michatbot-message-in 0.3s ease-out;
        }

        @keyframes michatbot-message-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .michatbot-message.user {
          justify-content: flex-end;
        }

        .michatbot-message-bubble {
          max-width: 75%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
          position: relative;
        }

        .michatbot-message.bot .michatbot-message-bubble {
          background: white;
          color: #1f2937;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #f3f4f6;
        }

        .michatbot-message.user .michatbot-message-bubble {
          background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
          color: white;
          border-bottom-right-radius: 4px;
          box-shadow: 0 2px 12px rgba(37, 99, 235, 0.3);
        }

        .michatbot-message-time {
          font-size: 11px;
          margin-top: 6px;
          opacity: 0.6;
          text-align: right;
        }

        .michatbot-message.bot .michatbot-message-time {
          color: #6b7280;
        }

        .michatbot-message.user .michatbot-message-time {
          color: rgba(255, 255, 255, 0.8);
        }

        /* Typing indicator */
        .michatbot-typing {
          display: flex;
          gap: 6px;
          padding: 12px 16px;
          background: white;
          border-radius: 18px;
          border-bottom-left-radius: 4px;
          width: fit-content;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #f3f4f6;
        }

        .michatbot-typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #9ca3af;
          animation: michatbot-typing-bounce 1.4s infinite ease-in-out;
        }

        .michatbot-typing-dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .michatbot-typing-dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes michatbot-typing-bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Input area */
        .michatbot-input-area {
          padding: 20px 24px;
          background: white;
          border-top: 1px solid #e5e7eb;
        }

        .michatbot-input-wrapper {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .michatbot-input {
          flex: 1;
          border: 2px solid #e5e7eb;
          border-radius: 24px;
          padding: 12px 18px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
          background: #f9fafb;
          resize: none;
          min-height: 46px;
          max-height: 120px;
          font-family: inherit;
        }

        .michatbot-input:focus {
          border-color: ${this.config.primaryColor};
          background: white;
          box-shadow: 0 0 0 3px ${this.config.primaryColor}15;
        }

        .michatbot-send-btn {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
          flex-shrink: 0;
        }

        .michatbot-send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
        }

        .michatbot-send-btn:active:not(:disabled) {
          transform: scale(0.95);
        }

        .michatbot-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .michatbot-send-btn svg {
          width: 22px;
          height: 22px;
          fill: white;
        }

        /* Powered by */
        .michatbot-footer {
          padding: 12px 24px;
          text-align: center;
          font-size: 11px;
          color: #9ca3af;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }

        .michatbot-footer a {
          color: ${this.config.primaryColor};
          text-decoration: none;
          font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .michatbot-window {
            width: 100vw !important;
            height: 100vh !important;
            border-radius: 0 !important;
            ${this.config.position.includes('right') ? 'right: 0 !important;' : 'left: 0 !important;'}
            ${this.config.position.includes('bottom') ? 'bottom: 0 !important;' : 'top: 0 !important;'}
          }

          .michatbot-launcher {
            width: 56px;
            height: 56px;
          }

          .michatbot-launcher svg {
            width: 28px;
            height: 28px;
          }
        }
      `;

      const style = document.createElement('style');
      style.id = 'michatbot-styles';
      style.textContent = css;
      document.head.appendChild(style);
    }

    getPositionStyles() {
      const positions = {
        'bottom-right': 'bottom: 24px; right: 24px;',
        'bottom-left': 'bottom: 24px; left: 24px;',
        'top-right': 'top: 24px; right: 24px;',
        'top-left': 'top: 24px; left: 24px;'
      };
      return positions[this.config.position] || positions['bottom-right'];
    }

    createWidget() {
      const container = document.createElement('div');
      container.id = 'michatbot-container';
      container.innerHTML = `
        <button class="michatbot-launcher" id="michatbot-launcher" aria-label="Abrir chat">
          <svg viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        </button>

        <div class="michatbot-window" id="michatbot-window">
          <div class="michatbot-header">
            <div class="michatbot-header-content">
              <div class="michatbot-avatar">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div class="michatbot-info">
                <div class="michatbot-title">${this.config.storeName}</div>
                <div class="michatbot-status">En línea</div>
              </div>
            </div>
            <div class="michatbot-actions">
              <button class="michatbot-action-btn" id="michatbot-minimize" aria-label="Minimizar" title="Minimizar">
                <svg viewBox="0 0 24 24">
                  <path d="M19 13H5v-2h14v2z"/>
                </svg>
              </button>
              <button class="michatbot-action-btn" id="michatbot-close" aria-label="Cerrar" title="Cerrar">
                <svg viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="michatbot-messages" id="michatbot-messages"></div>
          
          <div class="michatbot-input-area">
            <div class="michatbot-input-wrapper">
              <textarea 
                class="michatbot-input" 
                id="michatbot-input" 
                placeholder="${this.config.placeholder}"
                rows="1"
                aria-label="Escribe tu mensaje"
              ></textarea>
              <button class="michatbot-send-btn" id="michatbot-send" aria-label="Enviar mensaje">
                <svg viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="michatbot-footer">
            Powered by <a href="#" target="_blank">MiChatbot</a>
          </div>
        </div>
      `;

      document.body.appendChild(container);
    }

    attachEventListeners() {
      const launcher = document.getElementById('michatbot-launcher');
      const closeBtn = document.getElementById('michatbot-close');
      const minimizeBtn = document.getElementById('michatbot-minimize');
      const sendBtn = document.getElementById('michatbot-send');
      const input = document.getElementById('michatbot-input');

      launcher.addEventListener('click', () => this.toggle());
      closeBtn.addEventListener('click', () => this.close());
      minimizeBtn.addEventListener('click', () => this.minimize());
      sendBtn.addEventListener('click', () => this.sendMessage());
      
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      input.addEventListener('input', () => this.autoResize(input));
    }

    autoResize(textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.isOpen = true;
      this.isMinimized = false;
      const window = document.getElementById('michatbot-window');
      const launcher = document.getElementById('michatbot-launcher');
      
      window.classList.add('open');
      window.classList.remove('minimized');
      launcher.classList.add('open');
      launcher.style.display = 'none';
      
      document.getElementById('michatbot-input').focus();
      
      if (this.messages.length === 0) {
        this.addBotMessage(this.config.welcomeMessage);
      }
    }

    close() {
      this.isOpen = false;
      const window = document.getElementById('michatbot-window');
      const launcher = document.getElementById('michatbot-launcher');
      
      window.classList.remove('open');
      launcher.classList.remove('open');
      launcher.style.display = 'flex';
    }

    minimize() {
      this.isMinimized = !this.isMinimized;
      const window = document.getElementById('michatbot-window');
      window.classList.toggle('minimized');
    }

    async sendMessage() {
      const input = document.getElementById('michatbot-input');
      const message = input.value.trim();
      
      if (!message) return;

      input.value = '';
      input.style.height = 'auto';
      this.addUserMessage(message);
      this.showTyping();

      try {
        const response = await fetch(`${this.config.apiUrl}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.config.apiKey
          },
          body: JSON.stringify({
            message: message,
            sessionId: this.sessionId,
            storeName: this.config.storeName,
            metadata: {
              url: window.location.href,
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString()
            }
          })
        });

        const data = await response.json();
        this.hideTyping();
        
        if (data.reply) {
          this.addBotMessage(data.reply);
        } else {
          throw new Error('No reply received');
        }
      } catch (error) {
        console.error('Error:', error);
        this.hideTyping();
        this.addBotMessage('Lo siento, ocurrió un error. Por favor intenta de nuevo.');
      }
    }

    addUserMessage(text) {
      this.addMessage(text, 'user');
    }

    addBotMessage(text) {
      this.addMessage(text, 'bot');
    }

    addMessage(text, sender) {
      const messagesContainer = document.getElementById('michatbot-messages');
      const messageEl = document.createElement('div');
      messageEl.className = `michatbot-message ${sender}`;
      
      const bubble = document.createElement('div');
      bubble.className = 'michatbot-message-bubble';
      bubble.textContent = text;
      
      if (this.config.showTimestamp) {
        const time = document.createElement('div');
        time.className = 'michatbot-message-time';
        time.textContent = new Date().toLocaleTimeString('es-PE', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        bubble.appendChild(time);
      }
      
      messageEl.appendChild(bubble);
      messagesContainer.appendChild(messageEl);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      this.messages.push({ text, sender, timestamp: new Date() });
    }

    showTyping() {
      this.isTyping = true;
      const messagesContainer = document.getElementById('michatbot-messages');
      const typingEl = document.createElement('div');
      typingEl.className = 'michatbot-message bot';
      typingEl.id = 'michatbot-typing-indicator';
      typingEl.innerHTML = `
        <div class="michatbot-typing">
          <div class="michatbot-typing-dot"></div>
          <div class="michatbot-typing-dot"></div>
          <div class="michatbot-typing-dot"></div>
        </div>
      `;
      messagesContainer.appendChild(typingEl);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTyping() {
      this.isTyping = false;
      const typingEl = document.getElementById('michatbot-typing-indicator');
      if (typingEl) typingEl.remove();
    }
  }

  // Exponer globalmente
  window.MiChatbot = MiChatbot;

  // Auto-inicialización si existe configuración
  if (window.chatbotConfig) {
    new MiChatbot(window.chatbotConfig);
  }
})();