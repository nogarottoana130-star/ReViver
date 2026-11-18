// URL base apontando para a API FastAPI local
const API_URL = 'http://127.0.0.1:8000/emergencias';

const lista = document.querySelector('#lista-emergencias');
const mensagem = document.querySelector('#mensagem');
const formBusca = document.querySelector('#form-busca');
const campoBusca = document.querySelector('#busca-termo');
const botaoListar = document.querySelector('#botao-listar');

// Lista consolidada com base no documento fornecido
const TELEFONES_PADRAO = [
    {
        numero: '192',
        servico: 'SAMU',
        descricao: 'Emergência médica, intoxicação, overdose, perda de consciência, convulsões, dificuldade para respirar ou outra situação grave. Funciona 24h e é gratuito.'
    },
    {
        numero: '136',
        servico: 'Disque Saúde / Ouvidoria do SUS',
        descricao: 'Informações e orientações relacionadas aos serviços de saúde do SUS.'
    },
    {
        numero: '188',
        servico: 'CVV - Centro de Valorização da Vida',
        descricao: 'Para conversar quando a pessoa estiver sofrendo emocionalmente, em crise ou com pensamentos de suicídio. É gratuito e funciona 24h.'
    },
    {
        numero: '190',
        servico: 'Polícia Militar',
        descricao: 'Situações de risco imediato envolvendo violência ou ameaça à segurança.'
    },
    {
        numero: '193',
        servico: 'Corpo de Bombeiros',
        descricao: 'Acidentes, incêndios, traumas e outras situações de emergência.'
    },
    {
        numero: '0800 722 6001',
        servico: 'Disque-Intoxicação',
        descricao: 'Para receber orientação em casos de intoxicação ou suspeita de intoxicação por substâncias. Atendimento gratuito, 24h.'
    }
];

let cacheEmergencias = [];

function mostrarMensagem(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.className = erro ? 'mensagem erro' : 'mensagem';
    mensagem.hidden = false;
}

// Requisição centralizada com tratamento de CORS
async function requisicao(caminho = '', metodo = 'GET') {
    let resposta;
    try {
        resposta = await fetch(API_URL + caminho, { method: metodo });
    } catch {
        throw new Error('Servidor local indisponível. Exibindo lista padrão de emergência.');
    }

    if (!resposta.ok) {
        throw new Error('Não foi possível carregar os contatos da API.');
    }

    return await resposta.json();
}

// Renderiza as linhas na tabela de telefones de emergência
function exibirEmergencias(itens) {
    lista.replaceChildren();
    document.querySelector('#total-emergencias').textContent = `${itens.length} serviço(s) disponível(is)`;

    if (itens.length === 0) {
        const linha = lista.insertRow();
        const celula = linha.insertCell();
        celula.colSpan = 4;
        celula.className = 'vazio';
        celula.textContent = 'Nenhum serviço encontrado para o filtro informado.';
        return;
    }

    for (const item of itens) {
        const linha = lista.insertRow();

        // Coluna Número
        const celulaNumero = linha.insertCell();
        celulaNumero.className = 'numero-destaque';
        celulaNumero.textContent = item.numero;

        // Coluna Serviço
        const celulaServico = linha.insertCell();
        celulaServico.className = 'servico-nome';
        celulaServico.textContent = item.servico;

        // Coluna Quando ligar
        const celulaDescricao = linha.insertCell();
        celulaDescricao.textContent = item.descricao;

        // Coluna Ação (Link tel: para discagem direta em dispositivos móveis)
        const celulaAcao = linha.insertCell();
        const linkLigar = document.createElement('a');
        const numeroLimpo = item.numero.replace(/\s+/g, '');
        linkLigar.href = `tel:${numeroLimpo}`;
        linkLigar.className = 'botao botao-ligar';
        linkLigar.textContent = `Ligar ${item.numero}`;
        celulaAcao.append(linkLigar);
    }
}

// Carrega os contatos da API ou utiliza os dados locais como fallback seguro
async function carregarEmergencias() {
    try {
        const dadosApi = await requisicao();
        cacheEmergencias = dadosApi;
        exibirEmergencias(cacheEmergencias);
    } catch {
        cacheEmergencias = TELEFONES_PADRAO;
        exibirEmergencias(cacheEmergencias);
    }
}

// Filtro local por número, nome do serviço ou situação
formBusca.addEventListener('submit', evento => {
    evento.preventDefault();
    const termo = campoBusca.value.trim().toLowerCase();

    if (!termo) {
        exibirEmergencias(cacheEmergencias);
        return;
    }

    const filtrados = cacheEmergencias.filter(item =>
        item.numero.toLowerCase().includes(termo) ||
        item.servico.toLowerCase().includes(termo) ||
        item.descricao.toLowerCase().includes(termo)
    );

    exibirEmergencias(filtrados);
    mostrarMensagem(`Filtro aplicado: ${filtrados.length} resultado(s).`);
});

// Restaura a visualização completa
botaoListar.addEventListener('click', () => {
    campoBusca.value = '';
    mensagem.hidden = true;
    exibirEmergencias(cacheEmergencias);
});

// Inicialização da tela
carregarEmergencias();