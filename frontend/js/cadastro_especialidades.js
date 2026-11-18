// URL da rota de especialidades na FastAPI local
const API_URL = 'http://127.0.0.1:8000/especialidades';

// Seleção dos elementos do DOM
const lista = document.querySelector('#lista-especialidades');
const mensagem = document.querySelector('#mensagem');
const formBusca = document.querySelector('#form-busca');
const buscaId = document.querySelector('#busca-id');
const botaoListar = document.querySelector('#botao-listar');

// Exibe caixas de mensagem com feedback ao usuário
function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.className = erro ? 'mensagem erro' : 'mensagem';
  mensagem.hidden = false;
}

// Requisições HTTP com suporte a JSON e tratamento de status 204
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

// Renderiza a lista de especialidades na tabela
function exibirEspecialidades(especialidades) {
  lista.replaceChildren();
  document.querySelector('#total-especialidades').textContent = `${especialidades.length} registro(s) exibido(s)`;

  if (especialidades.length === 0) {
    const linha = lista.insertRow();
    const celula = linha.insertCell();
    celula.colSpan = 4;
    celula.className = 'vazio';
    celula.textContent = 'Nenhuma especialidade encontrada.';
    return;
  }

  for (const item of especialidades) {
    const linha = lista.insertRow();

    // Colunas da tabela segundo a imagem fornecida: ID, Especialidade e Nome da especialidade
    const cId = linha.insertCell();
    cId.textContent = item.id_especialidade;

    const cEspecialidade = linha.insertCell();
    cEspecialidade.textContent = item.tipo_especialidade || item.especialidade;

    const cNomeEspecialidade = linha.insertCell();
    cNomeEspecialidade.textContent = item.nome_especialidade;

    // Coluna de Ações
    const acoes = linha.insertCell();

    const editar = document.createElement('button');
    editar.type = 'button';
    editar.className = 'botao botao-principal';
    editar.textContent = 'Editar';
    editar.addEventListener('click', () => editarEspecialidade(item));

    const excluir = document.createElement('button');
    excluir.type = 'button';
    excluir.className = 'botao botao-secundario';
    excluir.textContent = 'Excluir';
    excluir.addEventListener('click', () => excluirEspecialidade(item, excluir));

    acoes.append(editar, excluir);
  }
}

// Carrega todas as especialidades da API
async function listarEspecialidades() {
  const especialidades = await requisicao();
  exibirEspecialidades(especialidades);
}

// Redireciona ou seleciona o registro para edição
function editarEspecialidade(item) {
  mostrarMensagem(`Editar especialidade #${item.id_especialidade}: redirecionando para o formulário.`);
  // Futuro redirecionamento:
  // window.location.href = `conta_especialidades.html?id=${item.id_especialidade}`;
}

// Exclui a especialidade após confirmação
async function excluirEspecialidade(item, botao) {
  if (!confirm(`Excluir a especialidade "${item.nome_especialidade}"?`)) return;

  botao.disabled = true;

  try {
    await requisicao(`/${item.id_especialidade}`, 'DELETE');
    mostrarMensagem('Especialidade excluída com sucesso.');
    try {
      await listarEspecialidades();
    } catch (erro) {
      mostrarMensagem(`Registro excluído, mas a lista não foi atualizada: ${erro.message}`, true);
    }
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  } finally {
    botao.disabled = false;
  }
}

// Evento de submissão do formulário de busca por ID
formBusca.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  try {
    const item = await requisicao(`/${buscaId.value}`);
    exibirEspecialidades([item]);
    mostrarMensagem('Especialidade encontrada.');
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
});

// Evento do botão "Atualizar lista"
botaoListar.addEventListener('click', async () => {
  try {
    await listarEspecialidades();
    buscaId.value = '';
    mostrarMensagem('Lista atualizada.');
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
});

// Carregamento automático ao abrir a página
listarEspecialidades().catch(erro => {
  exibirEspecialidades([]);
  mostrarMensagem(erro.message, true);
});