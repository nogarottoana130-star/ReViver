// Rota de serviços na API FastAPI local
const API_URL = 'http://127.0.0.1:8000/servicos';

// Seleção de elementos da página
const formulario = document.querySelector('#form-conta-servico');
const campoTipo = document.querySelector('#tipo-servico');
const campoNome = document.querySelector('#nome-servico');
const mensagem = document.querySelector('#mensagem');
const botaoCadastrar = document.querySelector('#botao-cadastrar');

// Exibe caixas de mensagem com respostas de sucesso ou erro
function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.className = erro ? 'mensagem erro' : 'mensagem';
  mensagem.hidden = false;
}

// Reseta os campos do formulário
function limparFormulario() {
  formulario.reset();
}

// Função centralizada para requisições assíncronas à API
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
    throw new Error('Não foi possível conectar à API. Verifique se o backend está rodando e a configuração de CORS.');
  }

  if (resposta.status === 204) return null;

  const conteudo = await resposta.json();

  if (!resposta.ok) {
    let detalhe = conteudo.detail;
    if (Array.isArray(detalhe)) {
      detalhe = detalhe.map(item => `${item.loc.join('.')}: ${item.msg}`).join(' | ');
    }
    throw new Error(detalhe || 'Não foi possível concluir o cadastro do serviço.');
  }

  return conteudo;
}

// Listener do formulário para salvar o novo serviço
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const tipoServico = campoTipo.value.trim();
  const nomeServico = campoNome.value.trim();

  // Validação simples de campos obrigatórios
  if (!tipoServico || !nomeServico) {
    mostrarMensagem('Preencha todos os campos do formulário.', true);
    return;
  }

  const dadosServico = {
    tipo_servico: tipoServico,
    nome_servico: nomeServico
  };

  botaoCadastrar.disabled = true;

  try {
    await requisicao('', 'POST', dadosServico);
    mostrarMensagem('Serviço cadastrado com sucesso!');
    limparFormulario();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  } finally {
    botaoCadastrar.disabled = false;
  }
});