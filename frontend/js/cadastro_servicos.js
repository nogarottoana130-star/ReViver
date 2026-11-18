// Endereço do endpoint de serviços na API FastAPI local
const API_URL = 'http://127.0.0.1:8000/servicos';

// Seleção de elementos do DOM
const lista = document.querySelector('#lista-servicos');
const mensagem = document.querySelector('#mensagem');
const formBusca = document.querySelector('#form-busca');
const buscaId = document.querySelector('#busca-id');
const botaoListar = document.querySelector('#botao-listar');

// Exibe mensagens de feedback ao usuário
function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.className = erro ? 'mensagem erro' : 'mensagem';
  mensagem.hidden = false;
}

// Função utilitária centralizada de requisição HTTP (Fetch)
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

  // HTTP 204 indica resposta sem corpo (exclusão realizada)
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

// Renderiza a lista de serviços na tabela conforme os registros do banco ou da imagem
function exibirServicos(servicos) {
  lista.replaceChildren();
  document.querySelector('#total-servicos').textContent = `${servicos.length} registro(s) exibido(s)`;

  if (servicos.length === 0) {
    const linha = lista.insertRow();
    const celula = linha.insertCell();
    celula.colSpan = 4;
    celula.className = 'vazio';
    celula.textContent = 'Nenhum serviço encontrado.';
    return;
  }

  for (const servico of servicos) {
    const linha = lista.insertRow();

    // Colunas da tabela: ID, Serviço (Categoria) e Nome do serviço
    const cId = linha.insertCell();
    cId.textContent = servico.id_servico;

    const cServico = linha.insertCell();
    cServico.textContent = servico.tipo_servico || servico.servico;

    const cNomeServico = linha.insertCell();
    cNomeServico.textContent = servico.nome_servico;



    // Coluna de ações (Editar e Excluir)
    const acoes = linha.insertCell();

    const editar = document.createElement('button');
    editar.type = 'button';
    editar.className = 'botao botao-principal';
    editar.textContent = 'Editar';
    editar.addEventListener('click', () => editarServico(servico));

    const excluir = document.createElement('button');
    excluir.type = 'button';
    excluir.className = 'botao botao-secundario';
    excluir.textContent = 'Excluir';
    excluir.addEventListener('click', () => excluirServico(servico, excluir));

    acoes.append(editar, excluir);
  }
}

// Busca todos os serviços cadastrados na API
async function listarServicos() {
  const servicos = await requisicao();
  exibirServicos(servicos);
}

// Preenche dados do serviço para edição
function editarServico(servico) {
  mostrarMensagem(`Editar serviço #${servico.id_servico}: redirecionando para o formulário.`);
  // Exemplo de redirecionamento futuro:
  // window.location.href = `conta_servicos.html?id=${servico.id_servico}`;
}

// Executa a exclusão após confirmação
async function excluirServico(servico, botao) {
  if (!confirm(`Excluir o serviço "${servico.nome_servico}"?`)) return;

  botao.disabled = true;

  try {
    await requisicao(`/${servico.id_servico}`, 'DELETE');
    mostrarMensagem('Serviço excluído com sucesso.');
    try {
      await listarServicos();
    } catch (erro) {
      mostrarMensagem(`Serviço excluído, mas a lista não foi atualizada: ${erro.message}`, true);
    }
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  } finally {
    botao.disabled = false;
  }
}

// Evento de envio para consulta por ID
formBusca.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  try {
    const servico = await requisicao(`/${buscaId.value}`);
    exibirServicos([servico]);
    mostrarMensagem('Serviço encontrado.');
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
});

// Evento do botão "Atualizar lista"
botaoListar.addEventListener('click', async () => {
  try {
    await listarServicos();
    buscaId.value = '';
    mostrarMensagem('Lista atualizada.');
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
});

// Inicialização automática ao carregar a tela
listarServicos().catch(erro => {
  exibirServicos([]);
  mostrarMensagem(erro.message, true);
});