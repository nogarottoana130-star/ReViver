// URL apontando para o endpoint de clínicas da FastAPI local
const API_URL = 'http://127.0.0.1:8000/clinicas';

// Mapeamento dos elementos da página
const lista = document.querySelector('#lista-clinicas');
const mensagem = document.querySelector('#mensagem');
const formBusca = document.querySelector('#form-busca');
const buscaId = document.querySelector('#busca-id');
const botaoListar = document.querySelector('#botao-listar');

// Exibe a caixa de mensagens informativas ou de erro
function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.className = erro ? 'mensagem erro' : 'mensagem';
  mensagem.hidden = false;
}

// Centraliza chamadas Fetch para comunicação via REST API
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
    throw new Error('Não foi possível acessar a API. Confira a execução do backend e as permissões de CORS.');
  }

  // 204 No Content indica exclusão efetuada
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

// Desenha a tabela com os registros recebidos da API
function exibirClinicas(clinicas) {
  lista.replaceChildren();
  document.querySelector('#total-clinicas').textContent = `${clinicas.length} registro(s) exibido(s)`;

  if (clinicas.length === 0) {
    const linha = lista.insertRow();
    const celula = linha.insertCell();
    celula.colSpan = 7;
    celula.className = 'vazio';
    celula.textContent = 'Nenhuma clínica encontrada.';
    return;
  }

  for (const clinica of clinicas) {
    const linha = lista.insertRow();

    // Colunas da tabela em conformidade com o modelo do banco e esboço
    const cId = linha.insertCell();
    cId.textContent = clinica.id_clinica;

    const cNome = linha.insertCell();
    cNome.textContent = clinica.nome;

    const cEndereco = linha.insertCell();
    cEndereco.className = 'multilinha';
    cEndereco.textContent = clinica.endereco;

    const cCidade = linha.insertCell();
    cCidade.textContent = clinica.cidade;

    const cTelefone = linha.insertCell();
    cTelefone.textContent = clinica.telefone;

    const cVagas = linha.insertCell();
    cVagas.textContent = clinica.vagas_disponiveis;

    // Coluna com ações de alteração e exclusão
    const acoes = linha.insertCell();

    const editar = document.createElement('button');
    editar.type = 'button';
    editar.className = 'botao botao-principal';
    editar.textContent = 'Editar';
    editar.addEventListener('click', () => editarClinica(clinica));

    const excluir = document.createElement('button');
    excluir.type = 'button';
    excluir.className = 'botao botao-secundario';
    excluir.textContent = 'Excluir';
    excluir.addEventListener('click', () => excluirClinica(clinica, excluir));

    acoes.append(editar, excluir);
  }
}

// Busca todos os registros de clínicas
async function listarClinicas() {
  const clinicas = await requisicao();
  exibirClinicas(clinicas);
}

// Preenche ou redireciona a clínica selecionada para alteração
function editarClinica(clinica) {
  mostrarMensagem(`Editar clínica #${clinica.id_clinica}: redirecionando para formulário de edição.`);
  // Futuro redirecionamento para o formulário preenchido:
  // window.location.href = `conta_clinicas.html?id=${clinica.id_clinica}`;
}

// Remove o registro após confirmação do usuário
async function excluirClinica(clinica, botao) {
  if (!confirm(`Excluir a clínica ${clinica.nome}?`)) return;

  botao.disabled = true;

  try {
    await requisicao(`/${clinica.id_clinica}`, 'DELETE');
    mostrarMensagem('Clínica excluída com sucesso.');
    try {
      await listarClinicas();
    } catch (erro) {
      mostrarMensagem(`Clínica excluída, mas a lista não foi atualizada: ${erro.message}`, true);
    }
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  } finally {
    botao.disabled = false;
  }
}

// Evento de submissão da busca individual por ID
formBusca.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  try {
    const clinica = await requisicao(`/${buscaId.value}`);
    exibirClinicas([clinica]);
    mostrarMensagem('Clínica encontrada.');
  } catch (erro) {_clinica
    mostrarMensagem(erro.message, true);
  }
});

// Evento do botão "Atualizar lista"
botaoListar.addEventListener('click', async () => {
  try {
    await listarClinicas();
    buscaId.value = '';
    mostrarMensagem('Lista atualizada.');
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
});

// Carregamento automático dos dados ao abrir a tela
listarClinicas().catch(erro => {
  exibirClinicas([]);
  mostrarMensagem(erro.message, true);
});