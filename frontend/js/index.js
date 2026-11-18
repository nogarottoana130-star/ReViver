// O navegador conversa somente com a FastAPI local.
const API_URL = 'http://127.0.0.1:8000';

// Seleção de elementos da página
const mensagem = document.querySelector('#mensagem');
const btnEntrar = document.querySelector('#btn-entrar');
const btnCriarConta = document.querySelector('#btn-criar-conta');
const btnAnonimo = document.querySelector('#btn-anonimo');

// Função auxiliar para exibir mensagens de retorno
function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.className = erro ? 'mensagem erro' : 'mensagem';
  mensagem.hidden = false;
}

// Função utilitária centralizada de requisição
async function requisicao(caminho = '', metodo = 'GET', dados = null) {
  const opcoes = { method: metodo };

  if (dados !== null) {
    opcoes.headers = { 'Content-Type': 'application/json' };
    opcoes.body = JSON.stringify(dados);
  }

  let resposta;
  try {
    resposta = await fetch(API_URL + caminho, opcoes);
  } catch {
    throw new Error('Não foi possível acessar a API. Confira a execução do backend e as configurações de CORS.');
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

// Eventos de clique para os botões de ação
btnEntrar.addEventListener('click', () => {
  mostrarMensagem('Redirecionando para a tela de login...');
  // Futuro redirecionamento: window.location.href = 'login.html';
});

btnCriarConta.addEventListener('click', () => {
  mostrarMensagem('Redirecionando para o formulário de cadastro...');
  // Futuro redirecionamento: window.location.href = 'cadastro.html';
});

btnAnonimo.addEventListener('click', async () => {
  try {
    mostrarMensagem('Iniciando sessão anônima...');
    // Exemplo de integração futura com a API
    // await requisicao('/sessao-anonima', 'POST');
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
});