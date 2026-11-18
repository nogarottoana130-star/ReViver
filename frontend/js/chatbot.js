// Rota de atendimento/chatbot na API FastAPI local
const API_URL = 'http://127.0.0.1:8000/chatbot';

// Mapeamento dos elementos da interface
const formChat = document.querySelector('#form-chat');
const inputMensagem = document.querySelector('#chat-mensagem-input');
const historico = document.querySelector('#chat-historico');
const mensagem = document.querySelector('#mensagem');

// Exibe mensagens de alerta na interface
function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.className = erro ? 'mensagem erro' : 'mensagem';
  mensagem.hidden = false;
}

// Retorna o horário atual formatado (HH:MM)
function obterHorarioAtual() {
  const agora = new Date();
  const horas = String(agora.getHours()).padStart(2, '0');
  const minutos = String(agora.getMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}

// Rola o chat automaticamente para a última mensagem
function rolarParaOFim() {
  historico.scrollTop = historico.scrollHeight;
}

// Adiciona um novo balão de mensagem no histórico
function adicionarMensagemChat(texto, ehUsuario = false) {
  const divMensagem = document.createElement('div');
  divMensagem.className = `mensagem-chat ${ehUsuario ? 'usuario' : 'assistente'}`;

  const balao = document.createElement('div');
  balao.className = 'balao-chat';

  const p = document.createElement('p');
  p.textContent = texto;

  const spanHora = document.createElement('span');
  spanHora.className = 'chat-hora';
  spanHora.textContent = obterHorarioAtual();

  balao.append(p, spanHora);
  divMensagem.append(balao);
  historico.append(divMensagem);

  rolarParaOFim();
}

// Centraliza a comunicação HTTP via Fetch com tratamento de erros
async function enviarParaAPI(mensagemTexto) {
  try {
    const resposta = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem: mensagemTexto })
    });

    if (!resposta.ok) {
      throw new Error('Não foi possível obter resposta do assistente.');
    }

    const dados = await resposta.json();
    return dados.resposta || 'Estou aqui para apoiar você. Como posso ajudar agora?';

  } catch (erro) {
    // Resposta de suporte padrão caso o backend esteja temporariamente indisponível
    return 'Entendo a sua situação. Posso te direcionar para a nossa página de Mapa com os pontos de acolhimento mais próximos, ou te conectar com nossa equipe de suporte.';
  }
}

// Listener para envio de mensagens no formulário do chat
formChat.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const texto = inputMensagem.value.trim();
  if (!texto) return;

  // Adiciona a mensagem do usuário na tela
  adicionarMensagemChat(texto, true);
  inputMensagem.value = '';

  // Busca resposta do assistente
  const respostaAssistente = await enviarParaAPI(texto);
  adicionarMensagemChat(respostaAssistente, false);
});

// Garante rolar o histórico até o final ao carregar a página
rolarParaOFim();