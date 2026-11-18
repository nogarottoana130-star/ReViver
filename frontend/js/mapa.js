// Rota de clínicas/locais no backend FastAPI local
const API_URL = 'http://127.0.0.1:8000/clinicas';

// Mapeamento dos elementos da interface
const campoBusca = document.querySelector('#busca-endereco');
const btnLocalizacao = document.querySelector('#btn-usar-localizacao');
const mensagem = document.querySelector('#mensagem');
const marcadores = document.querySelectorAll('.marcador-mapa');

// Exibe mensagens na interface
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
    throw new Error('Não foi possível conectar à API. Verifique a execução do backend e as permissões de CORS.');
  }

  if (resposta.status === 204) return null;

  const conteudo = await resposta.json();

  if (!resposta.ok) {
    let detalhe = conteudo.detail;
    if (Array.isArray(detalhe)) {
      detalhe = detalhe.map(item => `${item.loc.join('.')}: ${item.msg}`).join(' | ');
    }
    throw new Error(detalhe || 'Não foi possível buscar as informações de localização.');
  }

  return conteudo;
}

// Aciona a Geolocalização do navegador
btnLocalizacao.addEventListener('click', () => {
  if (!navigator.geolocation) {
    mostrarMensagem('Seu navegador não suporta geolocalização.', true);
    return;
  }

  mostrarMensagem('Obtendo sua localização atual...');

  navigator.geolocation.getCurrentPosition(
    (posicao) => {
      const lat = posicao.coords.latitude;
      const lng = posicao.coords.longitude;
      campoBusca.value = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
      mostrarMensagem('Localização obtida com sucesso! Pontos mais próximos atualizados.');
    },
    () => {
      mostrarMensagem('Permissão de localização negada ou indisponível.', true);
    }
  );
});

// Adiciona interação aos marcadores do mapa visual
marcadores.forEach(marcador => {
  marcador.addEventListener('click', () => {
    const nome = marcador.getAttribute('title') || 'Ponto de acolhimento';
    mostrarMensagem(`Local selecionado: ${nome}`);
  });
});

// Evento ao pressionar Enter na caixa de busca
campoBusca.addEventListener('keypress', (evento) => {
  if (evento.key === 'Enter') {
    evento.preventDefault();
    const termo = campoBusca.value.trim();
    if (termo) {
      mostrarMensagem(`Buscando pontos de acolhimento próximos a "${termo}"...`);
    }
  }
});