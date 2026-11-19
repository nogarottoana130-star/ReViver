(async () => {
  const mensagem = document.querySelector('#mensagem');

  function mostrarErro(texto) {
    mensagem.textContent = texto;
    mensagem.className = 'mensagem erro';
    mensagem.hidden = false;
  }

  let usuario;

  try {
    usuario = JSON.parse(
      sessionStorage.getItem('reviver_usuario')
    );
  } catch {
    sessionStorage.removeItem('reviver_usuario');
  }

  if (!usuario?.id_usuario) {
    window.location.replace('index.html');
    return;
  }

  function preencher(id, valor) {
    document.getElementById(id).textContent =
      valor || 'Não informado';
  }

  try {
    const resposta = await fetch(
      `http://127.0.0.1:8000/usuarios/${usuario.id_usuario}`
    );

    if (!resposta.ok) {
      throw new Error('Não foi possível carregar seus dados.');
    }

    const dados = await resposta.json();

    preencher('dado-nome', dados.nome);
    preencher('dado-email', dados.email);
    preencher('dado-cpf', dados.cpf);
    preencher('dado-telefone', dados.telefone);

    const nascimento = dados.data_nascimento;
    preencher(
      'dado-nascimento',
      nascimento ? nascimento.split('-').reverse().join('/') : ''
    );
  } catch (erro) {
    mostrarErro(erro.message);
  }
})();