// Rota de clínicas na API FastAPI local
const API_URL = 'http://127.0.0.1:8000/clinicas';

// Mapeamento dos elementos do formulário
const formulario = document.querySelector('#form-conta-clinica');
const campoNome = document.querySelector('#nome-clinica');
const campoEndereco = document.querySelector('#endereco-clinica');
const campoCidade = document.querySelector('#cidade-clinica');
const campoTelefone = document.querySelector('#telefone-clinica');
const campoVagas = document.querySelector('#vagas-clinica');
const mensagem = document.querySelector('#mensagem');
const botaoCadastrar = document.querySelector('#botao-cadastrar');

// Exibe mensagens na interface
function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.className = erro ? 'mensagem erro' : 'mensagem';
  mensagem.hidden = false;
}

// Reseta os campos do formulário
function limparFormulario() {
  formulario.reset();
}

// Requisições HTTP centrais tratadas com try/catch e async/await
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

  const conteudo = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    let detalhe = conteudo.detail;
    if (Array.isArray(detalhe)) {
      detalhe = detalhe.map(item => `${item.loc.join('.')}: ${item.msg}`).join(' | ');
    }
    throw new Error(detalhe || 'Não foi possível concluir o cadastro da clínica.');
  }

  return conteudo;
}

// Submissão do cadastro da clínica
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const nome = campoNome.value.trim();
  const endereco = campoEndereco.value.trim();
  const cidade = campoCidade.value.trim();
  const telefone = campoTelefone.value.trim();
  const vagas = parseInt(campoVagas.value.trim(), 10);

  if (!nome || !endereco || !cidade || !telefone || isNaN(vagas) || vagas < 0) {
    mostrarMensagem('Preencha todos os campos do formulário corretamente.', true);
    return;
  }

  const dadosClinica = {
    nome: nome,
    endereco: endereco,
    cidade: cidade,
    telefone: telefone,
    vagas_disponiveis: vagas
  };

  botaoCadastrar.disabled = true;

  try {
    await requisicao('', 'POST', dadosClinica);
    mostrarMensagem('Clínica cadastrada com sucesso!');
    limparFormulario();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  } finally {
    botaoCadastrar.disabled = false;
  }
});