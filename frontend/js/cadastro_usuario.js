// Endereço da rota de usuários na API FastAPI local
const API_URL = 'http://127.0.0.1:8000/usuarios';

// Mapeamento de elementos do DOM
const lista = document.querySelector('#lista-usuarios');
const mensagem = document.querySelector('#mensagem');
const formBusca = document.querySelector('#form-busca');
const buscaId = document.querySelector('#busca-id');
const botaoListar = document.querySelector('#botao-listar');

// Função utilitária para exibir mensagens de retorno
function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.className = erro ? 'mensagem erro' : 'mensagem';
  mensagem.hidden = false;
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
    throw new Error('Não foi possível acessar a API. Confira a execução do backend e a configuração de CORS.');
  }

  // Tratamento de exclusão (HTTP 204 No Content)
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

// Renderiza as linhas de usuários na tabela
function exibirUsuarios(usuarios) {
  lista.replaceChildren();
  document.querySelector('#total-usuarios').textContent = `${usuarios.length} registro(s) exibido(s)`;

  if (usuarios.length === 0) {
    const linha = lista.insertRow();
    const celula = linha.insertCell();
    celula.colSpan = 7;
    celula.className = 'vazio';
    celula.textContent = 'Nenhum usuário encontrado.';
    return;
  }

  for (const usuario of usuarios) {
    const linha = lista.insertRow();
    const data = usuario.data_nascimento;

    const valores = [
      usuario.id_usuario,
      usuario.nome,
      usuario.email,
      usuario.cpf,
      usuario.telefone,
      data ? data.split('-').reverse().join('/') : 'Não informada'
    ];

    for (const valor of valores) {
      linha.insertCell().textContent = valor;
    }

    // Coluna de ações (Editar e Excluir)
    const acoes = linha.insertCell();

    const editar = document.createElement('button');
    editar.type = 'button';
    editar.className = 'botao botao-principal';
    editar.textContent = 'Editar';
    editar.addEventListener('click', () => editarUsuario(usuario));

    const excluir = document.createElement('button');
    excluir.type = 'button';
    excluir.className = 'botao botao-secundario';
    excluir.textContent = 'Excluir';
    excluir.addEventListener('click', () => excluirUsuario(usuario, excluir));

    acoes.append(editar, excluir);
  }
}

// Carrega todos os usuários cadastrados
async function listarUsuarios() {
  const usuarios = await requisicao();
  exibirUsuarios(usuarios);
}

// Redireciona ou carrega o usuário para edição no formulário
function editarUsuario(usuario) {
  mostrarMensagem(`Editar usuário #${usuario.id_usuario}: redirecionando para a tela de edição.`);
  // Exemplo de redirecionamento futuro com parâmetros:
  // window.location.href = `conta_usuario.html?id=${usuario.id_usuario}`;
}

// Exclui um usuário após confirmação explícita do operador
async function excluirUsuario(usuario, botao) {
  if (!confirm(`Excluir o usuário ${usuario.nome}?`)) return;

  botao.disabled = true;

  try {
    await requisicao(`/${usuario.id_usuario}`, 'DELETE');
    mostrarMensagem('Usuário excluído com sucesso.');
    try {
      await listarUsuarios();
    } catch (erro) {
      mostrarMensagem(`Usuário excluído, mas a lista não foi atualizada: ${erro.message}`, true);
    }
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  } finally {
    botao.disabled = false;
  }
}

// Evento de submissão da busca por ID
formBusca.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  try {
    const usuario = await requisicao(`/${buscaId.value}`);
    exibirUsuarios([usuario]);
    mostrarMensagem('Usuário encontrado.');
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
});

// Evento do botão "Atualizar lista"
botaoListar.addEventListener('click', async () => {
  try {
    await listarUsuarios();
    buscaId.value = '';
    mostrarMensagem('Lista atualizada.');
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
});

// Inicialização automática ao carregar a página
listarUsuarios().catch(erro => {
  exibirUsuarios([]);
  mostrarMensagem(erro.message, true);
});