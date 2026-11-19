// O navegador conversa somente com a FastAPI local
const API_BASE = 'http://127.0.0.1:8000';

const mensagem = document.querySelector('#mensagem');
const painelLogin = document.querySelector('#painel-login');
const formLogin = document.querySelector('#form-login');
const campoEmail = document.querySelector('#login-email');
const campoSenha = document.querySelector('#login-senha');
const botaoEntrar = document.querySelector('#botao-entrar');
const botaoCancelarLogin = document.querySelector('#botao-cancelar-login');
const botaoConfirmarLogin = document.querySelector('#botao-confirmar-login');
const botaoAnonimo = document.querySelector('#botao-anonimo');

// Elementos do Painel de Criar Conta
const painelCriar = document.querySelector('#painel-criar');
const formCriar = document.querySelector('#form-criar-conta');
const campoNomeCadastro = document.querySelector('#cadastro-nome');
const campoEmailCadastro = document.querySelector('#cadastro-email');
const campoCpfCadastro = document.querySelector('#cadastro-cpf');
const campoTelefoneCadastro = document.querySelector('#cadastro-telefone');
const campoNascimentoCadastro = document.querySelector('#cadastro-nascimento');
const campoSenhaCadastro = document.querySelector('#cadastro-senha');
const botaoCriar = document.querySelector('#botao-criar');
const botaoCancelarCriar = document.querySelector('#botao-cancelar-criar');
const botaoConfirmarCriar = document.querySelector('#botao-confirmar-criar');

// Exibe mensagens de retorno na tela
function mostrarMensagem(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.className = erro ? 'mensagem erro' : 'mensagem';
    mensagem.hidden = false;
}

// Função centralizada de requisição HTTP com tratamento de CORS
async function requisicao(caminho = '', metodo = 'POST', dados = null) {
    const opcoes = { method: metodo };
    if (dados !== null) {
        opcoes.headers = { 'Content-Type': 'application/json' };
        opcoes.body = JSON.stringify(dados);
    }

    let resposta;
    try {
        resposta = await fetch(API_BASE + caminho, opcoes);
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

// Abre o painel de login ao clicar em "Entrar" e fecha o de criar conta
botaoEntrar.addEventListener('click', () => {
    painelCriar.hidden = true;
    painelLogin.hidden = false;
    mensagem.hidden = true;
    painelLogin.scrollIntoView({ behavior: 'smooth' });
    campoEmail.focus();
});

// Abre o painel de criar conta ao clicar em "Criar conta" e fecha o de login
botaoCriar.addEventListener('click', () => {
    painelLogin.hidden = true;
    painelCriar.hidden = false;
    mensagem.hidden = true;
    painelCriar.scrollIntoView({ behavior: 'smooth' });
    campoNomeCadastro.focus();
});

// Fecha o painel de login
botaoCancelarLogin.addEventListener('click', () => {
    formLogin.reset();
    painelLogin.hidden = true;
    mensagem.hidden = true;
});

// Fecha o painel de criar conta
botaoCancelarCriar.addEventListener('click', () => {
    formCriar.reset();
    painelCriar.hidden = true;
    mensagem.hidden = true;
});

// Envia credenciais de login para a FastAPI
formLogin.addEventListener('submit', async evento => {
    evento.preventDefault();

    const email = campoEmail.value.trim();
    const senha = campoSenha.value.trim();

    if (!email || !senha) {
        mostrarMensagem('Informe seu email e senha para entrar.', true);
        return;
    }

    botaoConfirmarLogin.disabled = true;

    try {
        const resultado = await requisicao('/auth/login', 'POST', { email, senha });
        // if (resultado && resultado.token) {
        //     localStorage.setItem('reviver_token', resultado.token);
        // }
        
        sessionStorage.setItem(
            "reviver_usuario",
            JSON.stringify(resultado.usuario)
        );

        mostrarMensagem('Acesso autorizado! Redirecionando...');
        setTimeout(() => {
            window.location.href = 'principal.html';
        }, 1000);
    } catch (erro) {
        mostrarMensagem(erro.message, true);
    } finally {
        botaoConfirmarLogin.disabled = false;
    }
});

// Envia os dados de cadastro de novo usuário para a FastAPI
formCriar.addEventListener('submit', async evento => {
    evento.preventDefault();

    const nome = campoNomeCadastro.value.trim();
    if (!nome) {
        mostrarMensagem('Informe o nome do usuário.', true);
        campoNomeCadastro.focus();
        return;
    }

    const dados = {
        nome: nome,
        email: campoEmailCadastro.value.trim(),
        cpf: campoCpfCadastro.value.trim(),
        telefone: campoTelefoneCadastro.value.trim(),
        data_nascimento: campoNascimentoCadastro.value,
        senha: campoSenhaCadastro.value
    };

    botaoConfirmarCriar.disabled = true;

    try {
        await requisicao('/usuarios', 'POST', dados);
        formCriar.reset();
        painelCriar.hidden = true;
        painelLogin.hidden = false;
        campoEmail.value = dados.email;
        mostrarMensagem('Conta criada com sucesso! Agora você já pode entrar.');
        campoSenha.focus();
    } catch (erro) {
        mostrarMensagem(erro.message, true);
    } finally {
        botaoConfirmarCriar.disabled = false;
    }
});


// // O navegador conversa somente com a FastAPI local[cite: 37]
// const API_URL = 'http://127.0.0.1:8000/auth';

// const mensagem = document.querySelector('#mensagem');
// const painelLogin = document.querySelector('#painel-login');
// const formLogin = document.querySelector('#form-login');
// const campoEmail = document.querySelector('#login-email');
// const campoSenha = document.querySelector('#login-senha');
// const botaoEntrar = document.querySelector('#botao-entrar');
// const botaoCancelarLogin = document.querySelector('#botao-cancelar-login');
// const botaoConfirmarLogin = document.querySelector('#botao-confirmar-login');
// const botaoAnonimo = document.querySelector('#botao-anonimo');

// // Elementos do Painel de Criar Conta
// const painelCriar = document.querySelector('#painel-criar');
// const formCriar = document.querySelector('#form-criar-conta');
// const campoNomeCadastro = document.querySelector('#cadastro-nome');
// const campoEmailCadastro = document.querySelector('#cadastro-email');
// const campoCpfCadastro = document.querySelector('#cadastro-cpf');
// const campoTelefoneCadastro = document.querySelector('#cadastro-telefone');
// const campoNascimentoCadastro = document.querySelector('#cadastro-nascimento');
// const campoSenhaCadastro = document.querySelector('#cadastro-senha');
// const botaoCriar = document.querySelector('#botao-criar');
// const botaoCancelarCriar = document.querySelector('#botao-cancelar-criar');
// const botaoConfirmarCriar = document.querySelector('#botao-confirmar-criar');

// // Exibe mensagens de retorno na tela[cite: 38]
// function mostrarMensagem(texto, erro = false) {
//     mensagem.textContent = texto;
//     mensagem.className = erro ? 'mensagem erro' : 'mensagem';
//     mensagem.hidden = false;
// }

// // Função centralizada de requisição HTTP com tratamento de CORS[cite: 40]
// async function requisicao(caminho = '', metodo = 'POST', dados = null) {
//     const opcoes = { method: metodo };
//     if (dados !== null) {
//         opcoes.headers = { 'Content-Type': 'application/json' };
//         opcoes.body = JSON.stringify(dados);
//     }

//     let resposta;
//     try {
//         resposta = await fetch(API_URL + caminho, opcoes);
//     } catch {
//         throw new Error('Não foi possível acessar a API. Confira o backend e a configuração de CORS.');
//     }

//     if (resposta.status === 204) return null;

//     const conteudo = await resposta.json();
//     if (!resposta.ok) {
//         let detalhe = conteudo.detail;
//         if (Array.isArray(detalhe)) {
//             detalhe = detalhe.map(item => `${item.loc.join('.')}: ${item.msg}`).join(' | ');
//         }
//         throw new Error(detalhe || 'Não foi possível concluir a operação.');
//     }

//     return conteudo;
// }

// // Abre o painel de login ao clicar em "Entrar"
// botaoEntrar.addEventListener('click', () => {
//     painelLogin.hidden = false;
//     mensagem.hidden = true;
//     campoEmail.focus();
// });

// // Fecha o painel de login
// botaoCancelarLogin.addEventListener('click', () => {
//     formLogin.reset();
//     painelLogin.hidden = true;
//     mensagem.hidden = true;
// });

// // Envia credenciais de login para a FastAPI
// formLogin.addEventListener('submit', async evento => {
//     evento.preventDefault();

//     const email = campoEmail.value.trim();
//     const senha = campoSenha.value.trim();

//     if (!email || !senha) {
//         mostrarMensagem('Informe seu email e senha para entrar.', true);
//         return;
//     }

//     botaoConfirmarLogin.disabled = true;

//     try {
//         const resultado = await requisicao('/login', 'POST', { email, senha });
//         if (resultado && resultado.token) {
//             localStorage.setItem('reviver_token', resultado.token);
//         }
//         mostrarMensagem('Acesso autorizado! Redirecionando...');
//         setTimeout(() => {
//             window.location.href = 'principal.html';
//         }, 1000);
//     } catch (erro) {
//         mostrarMensagem(erro.message, true);
//     } finally {
//         botaoConfirmarLogin.disabled = false;
//     }
// });

// // Acesso em modo anônimo
// botaoAnonimo.addEventListener('click', async () => {
//     botaoAnonimo.disabled = true;

//     try {
//         const resultado = await requisicao('/anonimo', 'POST', { anonimo: true });
//         if (resultado && resultado.token) {
//             localStorage.setItem('reviver_token', resultado.token);
//         }
//         mostrarMensagem('Acesso anônimo iniciado. Redirecionando...');
//         setTimeout(() => {
//             window.location.href = 'principal.html';
//         }, 1000);
//     } catch {
//         // Fallback caso o endpoint anônimo ainda não esteja ativo no backend
//         localStorage.setItem('reviver_modo', 'anonimo');
//         mostrarMensagem('Entrando em modo anônimo...');
//         setTimeout(() => {
//             window.location.href = 'principal.html';
//         }, 1000);
//     } finally {
//         botaoAnonimo.disabled = false;
//     }
// });

botaoAnonimo.addEventListener("click", () => {
    sessionStorage.removeItem("reviver_usuario");
    localStorage.removeItem("reviver_token");

    window.location.href = "principal.html";
});


