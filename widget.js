(function () {
  const el = document.createElement('div')
  el.id = 'fake-chatbot'
  el.style.position = 'fixed'
  el.style.bottom = '20px'
  el.style.right = '20px'
  el.style.width = '300px'
  el.style.height = '400px'
  el.style.background = '#fff'
  el.style.border = '1px solid #ccc'
  el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'
  el.innerHTML = "<p style='padding:10px'>🤖 Chatbot de prueba</p>"
  document.body.appendChild(el)
})()