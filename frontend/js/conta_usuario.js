// A página se conecta com a rota de usuários da API FastAPI local
const API_URL = 'http://127.0.0.1:8000/usuarios';

// Seleção de elementos do DOM
const formulario = document.querySelector('#form-conta-usuario');
const campoNome = document.querySelector('#nome');
const campoEmail = document.querySelector('#email');
const campoSenha = document.querySelector("#senha");
const campoCpf = document.querySelector('#cpf');
const campoTelefone = document.querySelector('#telefone');
const campoDataNascimento = document.querySelector('#data_nascimento');
const mensagem = document.querySelector('#mensagem');
const botaoCadastrar = document.querySelector('#botao-cadastrar');

// Função auxiliar para exibição de mensagens ao usuário
function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.className = erro ? 'mensagem erro' : 'mensagem';
  mensagem.hidden = false;
}

// Função para resetar os campos do formulário
function limparFormulario() {
  formulario.reset();
}

// Função centralizada para requisições assíncronas com a API
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
    throw new Error('Não foi possível conectar à API. Verifique a execução do backend e as permissões de CORS.');
  }

  if (resposta.status === 204) return null;

  const conteudo = await resposta.json();

  if (!resposta.ok) {
    let detalhe = conteudo.detail;
    if (Array.isArray(detalhe)) {
      detalhe = detalhe.map(item => `${item.loc.join('.')}: ${item.msg}`).join(' | ');
    }
    throw new Error(detalhe || 'Não foi possível concluir a operação de cadastro.');
  }

  return conteudo;
}

// Evento de envio do formulário de cadastro de usuário
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const nome = campoNome.value.trim();
  const email = campoEmail.value.trim();
  const cpf = campoCpf.value.trim();
  const telefone = campoTelefone.value.trim();
  const dataNascimento = campoDataNascimento.value;
  const senha = campoSenha.value.trim();

  // Validação simples no frontend
  if (!nome || !email || !cpf || !telefone || !dataNascimento || !senha) {
    mostrarMensagem('Preencha todos os campos do formulário.', true);
    return;
  }

  const dadosUsuario = {
    nome: nome,
    email: email,
    cpf: cpf,
    telefone: telefone,
    data_nascimento: dataNascimento,
    senha: senha
  };

  botaoCadastrar.disabled = true;

  try {
    // Envio POST para criação da conta na FastAPI
    await requisicao('', 'POST', dadosUsuario);
    mostrarMensagem('Conta criada com sucesso! Redirecionando...');
    limparFormulario();

    // Redirecionamento após o cadastro bem-sucedido
    setTimeout(() => {
      window.location.href = 'cadastro_usuario.html';
    }, 2000);
    
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  } finally {
    botaoCadastrar.disabled = false;
  }
});