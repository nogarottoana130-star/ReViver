// URL base da API FastAPI local
const API_URL = 'http://127.0.0.1:8000';

// Mapeamento dos elementos da página
const mensagem = document.querySelector('#mensagem');
const cardChatbot = document.querySelector('#card-chatbot');
const cardMapa = document.querySelector('#card-mapa');
const cardInformacoes = document.querySelector('#card-informacoes');
const cardDados = document.querySelector('#card-dados');
const btnPedirAjuda = document.querySelector('#btn-pedir-ajuda');

// Exibe mensagens na interface
function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.className = erro ? 'mensagem erro' : 'mensagem';
  mensagem.hidden = false;
}

// Centraliza a comunicação HTTP via Fetch
async function requisicao(caminho = '', metodo = 'GET', dados = null) {
  const opcoes = { method: metodo };

  if (dados !== null) {
    opcoes.headers = { 'Content-Type': 'application/json' };
    opcoes.body = JSON.stringify(dados);
  }

  let resposta;
  try {
    resposta = await fetch(API_URL + caminho, opcoes);
  } catch (erro) {
    throw new Error('Não foi possível conectar à API. Verifique a execução do backend e a permissão CORS.');
  }

  if (resposta.status === 204) return null;

  const conteudo = await resposta.json();

  if (!resposta.ok) {
    let detalhe = conteudo.detail;
    if (Array.isArray(detalhe)) {
      detalhe = detalhe.map(item => `${item.loc.join('.')}: ${item.msg}`).join(' | ');
    }
    throw new Error(detalhe || 'Não foi possível concluir a operação.');
  }

  return conteudo;
}

// Eventos de clique para navegação dos cards da página principal
cardChatbot.addEventListener('click', () => {
  mostrarMensagem('Abrindo assistente virtual (Chatbot)...');
  // Futuro redirecionamento ou abertura do modal do chatbot
});

cardMapa.addEventListener('click', () => {
  mostrarMensagem('Carregando mapa de pontos de acolhimento próximos...');
  // Futuro redirecionamento para a tela do mapa
});

cardInformacoes.addEventListener('click', () => {
  mostrarMensagem('Redirecionando para a central de informações e prevenção...');
  // Futuro redirecionamento
});

cardDados.addEventListener('click', () => {
  mostrarMensagem('Redirecionando para a gestão dos seus dados...');
  window.location.href = 'suas_informacoes.html';
});

btnPedirAjuda.addEventListener('click', async () => {
  try {
    mostrarMensagem('Conectando ao canal de ajuda de emergência...');
    // Exemplo de integração futura com a API
    // await requisicao('/emergencia', 'POST');
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
});