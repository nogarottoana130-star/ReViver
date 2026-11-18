// O navegador conversa apenas com a API local FastAPI.
const API_URL = 'http://127.0.0.1:8000/informacoes';

// Seleção de elementos da interface
const formulario = document.querySelector('#form-informacoes');
const campoEmail = document.querySelector('#email-usuario');
const campoSenha = document.querySelector('#senha-usuario');
const campoTipo = document.querySelector('#tipo-ajuda');
const campoSituacao = document.querySelector('#situacao-usuario');
const mensagem = document.querySelector('#mensagem');
const botaoContinuar = document.querySelector('#botao-continuar');

// Função para exibir retornos (sucesso ou erro) ao usuário
function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.className = erro ? 'mensagem erro' : 'mensagem';
  mensagem.hidden = false;
}

// Função para limpar e resetar os campos do formulário
function limparFormulario() {
  formulario.reset();
}

// Função centralizada para envio de requisições assíncronas à API
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
    throw new Error('Não foi possível conectar à API. Verifique se o backend está ativo e a configuração de CORS.');
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

// Listener de evento de submissão do formulário
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const email = campoEmail.value.trim();
  const senha = campoSenha.value;
  const tipo = campoTipo.value;
  const situacao = campoSituacao.value.trim();

  // Validação frontend básica
  if (!email || !senha || !tipo || !situacao) {
    mostrarMensagem('Preencha todos os campos obrigatórios.', true);
    return;
  }

  const dadosFormulario = {
    email: email,
    senha: senha,
    tipo_ajuda: tipo,
    situacao: situacao
  };

  botaoContinuar.disabled = true;

  try {
    // Envio dos dados via POST para a API
    await requisicao('', 'POST', dadosFormulario);
    mostrarMensagem('Informações registradas com sucesso! Redirecionando...');
    limparFormulario();
    
    // Simulação do fluxo de continuidade para a próxima etapa
    setTimeout(() => {
      // window.location.href = 'proxima_etapa.html';
    }, 2000);

  } catch (erro) {
    mostrarMensagem(erro.message, true);
  } finally {
    botaoContinuar.disabled = false;
  }
});