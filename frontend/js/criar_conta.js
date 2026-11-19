// O navegador conversa somente com a FastAPI local[cite: 37]
const API_URL = 'http://127.0.0.1:8000/usuarios';

const formulario = document.querySelector('#form-usuario');
const campoId = document.querySelector('#id-usuario');
const campoNome = document.querySelector('#nome-usuario');
const campoEmail = document.querySelector('#email-usuario');
const campoCpf = document.querySelector('#cpf-usuario');
const campoTelefone = document.querySelector('#telefone-usuario');
const campoData = document.querySelector('#data-nascimento');
const campoSenha = document.querySelector('#senha-usuario');

const lista = document.querySelector('#lista-usuarios');
const mensagem = document.querySelector('#mensagem');
const botaoSalvar = document.querySelector('#botao-salvar');
const buscaId = document.querySelector('#busca-id');

// Exibe mensagens de sucesso ou erro na tela[cite: 38]
function mostrarMensagem(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.className = erro ? 'mensagem erro' : 'mensagem';
    mensagem.hidden = false;
}

// Restaura o formulário para o estado inicial de cadastro[cite: 39]
function limparFormulario() {
    formulario.reset();
    campoId.value = '';
    campoData.type = 'text';
    campoSenha.required = true;
    campoSenha.placeholder = 'Senha';
    document.querySelector('#titulo-cadastro').textContent = 'Cadastro de usuário';
    botaoSalvar.textContent = 'Cadastrar';
}

// Centraliza o envio e leitura das respostas da API (CRUD + CORS)[cite: 40]
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
        throw new Error('Não foi possível acessar a API. Confira o backend e a configuração de CORS.');
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

// Renderiza as linhas e botões da tabela de usuários[cite: 41]
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
        const dataFormatada = data ? (data.includes('-') ? data.split('-').reverse().join('/') : data) : 'Não informada';

        const valores = [
            usuario.id_usuario,
            usuario.nome_usuario,
            usuario.email_usuario || '-',
            usuario.cpf_usuario || '-',
            usuario.telefone_usuario || '-',
            dataFormatada
        ];

        for (const valor of valores) {
            linha.insertCell().textContent = valor;
        }

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

// Consulta todos os usuários na API[cite: 42]
async function listarUsuarios() {
    const usuarios = await requisicao();
    exibirUsuarios(usuarios);
}

// Preenche o formulário para edição de um registro existente[cite: 42]
function editarUsuario(usuario) {
    campoId.value = usuario.id_usuario;
    campoNome.value = usuario.nome_usuario;
    campoEmail.value = usuario.email_usuario || '';
    campoCpf.value = usuario.cpf_usuario || '';
    campoTelefone.value = usuario.telefone_usuario || '';

    if (usuario.data_nascimento) {
        campoData.type = 'date';
        campoData.value = usuario.data_nascimento;
    }

    campoSenha.value = '';
    campoSenha.required = false;
    campoSenha.placeholder = 'Nova senha (opcional)';

    document.querySelector('#titulo-cadastro').textContent = `Editar usuário #${usuario.id_usuario}`;
    botaoSalvar.textContent = 'Salvar alterações';
    campoNome.focus();
}

// Exclui um usuário com confirmação[cite: 43]
async function excluirUsuario(usuario, botao) {
    if (!confirm(`Excluir o usuário ${usuario.nome_usuario}?`)) return;

    botao.disabled = true;
    try {
        await requisicao(`/${usuario.id_usuario}`, 'DELETE');
        if (campoId.value === String(usuario.id_usuario)) limparFormulario();
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

// Envio do formulário (POST para criar ou PUT para editar)[cite: 44]
formulario.addEventListener('submit', async evento => {
    evento.preventDefault();

    const nome = campoNome.value.trim();
    if (!nome) {
        mostrarMensagem('Informe o nome do usuário.', true);
        campoNome.focus();
        return;
    }

    const id = campoId.value;
    const dados = {
        nome_usuario: nome,
        email_usuario: campoEmail.value.trim(),
        cpf_usuario: campoCpf.value.trim(),
        telefone_usuario: campoTelefone.value.trim(),
        data_nascimento: campoData.value
    };

    const senha = campoSenha.value.trim();
    if (!id || senha) {
        dados.senha_usuario = senha;
    }

    botaoSalvar.disabled = true;

    try {
        await requisicao(id ? `/${id}` : '', id ? 'PUT' : 'POST', dados);
        limparFormulario();
        mostrarMensagem(id ? 'Usuário atualizado com sucesso.' : 'Usuário cadastrado com sucesso.');
        try {
            await listarUsuarios();
        } catch (erro) {
            mostrarMensagem(`Usuário salvo, mas a lista não foi atualizada: ${erro.message}`, true);
        }
    } catch (erro) {
        mostrarMensagem(erro.message, true);
    } finally {
        botaoSalvar.disabled = false;
    }
});

// Consulta por ID[cite: 45]
document.querySelector('#form-busca').addEventListener('submit', async evento => {
    evento.preventDefault();
    try {
        const usuario = await requisicao(`/${buscaId.value}`);
        exibirUsuarios([usuario]);
        mostrarMensagem('Usuário encontrado.');
    } catch (erro) {
        mostrarMensagem(erro.message, true);
    }
});

// Botões de limpar e atualizar lista[cite: 45]
document.querySelector('#botao-limpar').addEventListener('click', () => {
    limparFormulario();
    mensagem.hidden = true;
});

document.querySelector('#botao-listar').addEventListener('click', async () => {
    try {
        await listarUsuarios();
        buscaId.value = '';
        mostrarMensagem('Lista atualizada.');
    } catch (erro) {
        mostrarMensagem(erro.message, true);
    }
});

// Carregamento inicial da tela[cite: 45]
listarUsuarios().catch(erro => {
    exibirUsuarios([]);
    mostrarMensagem(erro.message, true);
});