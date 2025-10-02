(function () {
  const style = document.createElement('style')
  style.innerHTML = `
    #fake-chatbot {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 350px;
      height: 500px;
      background: #fff;
      border-radius: 12px;
      border: 1px solid #ddd;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: Arial, sans-serif;
    }
    #fake-chatbot header {
      background: #4A90E2;
      color: #fff;
      padding: 10px;
      font-weight: bold;
    }
    #fake-chatbot .content {
      flex: 1;
      padding: 10px;
      overflow-y: auto;
    }
  `
  document.head.appendChild(style)

  const el = document.createElement('div')
  el.id = 'fake-chatbot'
  el.innerHTML = `
    <header>🤖 Chatbot</header>
    <div class="content">
      <p>Hola, soy tu asistente virtual 👋</p>
    </div>
  `
  document.body.appendChild(el)
})()