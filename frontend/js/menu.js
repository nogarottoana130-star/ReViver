const menu = document.getElementById('menu-principal');

if(menu){
    menu.innerHTML=`<a href="principal.html" class="link-nav">Início</a>
    <a href="chatbot.html" class="link-nav">Chatbot</a>
    <a href="mapa.html" class="link-nav">Mapa</a>
    <a href="meus_dados.html" class="link-nav" data-exige-login>Meus dados</a>
    <a href="cadastro_usuario.html" class="link-nav">Usuários</a>
    <a href="cadastro_clinicas.html" class="link-nav">Clínicas</a>
    <a href="cadastro_servicos.html" class="link-nav">Serviços</a>
    <a href="cadastro_especialidades.html" class="link-nav">Especialidades</a>
    <a href="#" id="menu-login" class="link-nav">Login</a>`;

    const paginaAtual=window.location.pathname.split("/").pop();

    if(paginaAtual === "cadastro_usuario.html"){
        menu.innerHTML =   
            `
            <a href="principal.html" class="link-nav">Início</a>
            <a href="conta_usuario.html" class="link-nav">Criar usuário</a>
            <a href="cadastro_usuario.html" class="link-nav ativo">Usuários cadastrados</a>
            `;
    }else if(paginaAtual === "cadastro_clinicas.html"){
            menu.innerHTML = `
            <a href="principal.html" class="link-nav">Início</a>
            <a href="conta_clinicas.html" class="link-nav">Criar clínica</a>
            <a href="cadastro_clinicas.html" class="link-nav ativo">Clínicas cadastradas</a>
            `;
    }else if(paginaAtual ==="conta_usuario.html"){
            menu.innerHTML = `
            <a href="principal.html" class="link-nav">Início</a>
            <a href="conta_usuario.html" class="link-nav ativo">Criar usuário</a>
            <a href="cadastro_usuario.html" class="link-nav ativo">Voltar</a>
            `;
    }else if (paginaAtual ==="chatbot.html"){
            menu.innerHTML =  `
            <a href="principal.html" class="link-nav">Início</a>
            <a href="chatbot.html" class="link-nav">Chatbot</a>
            `
    }else if (paginaAtual ==="mapa.html"){
            menu.innerHTML = `
            <a href="principal.html" class="link-nav">Início</a>
            <a href="mapa.html" class="link-nav">Mapa</a>
            `
    }

    menu.querySelectorAll("a").forEach((link)=>{
        if(link.href===window.location.href){
            link.classList.add("ativo");
        }
    });

    (() => {
        const linkLogin = document.getElementById('menu-login');
    
        if (!linkLogin) return;
    
        let usuario = null;
    
        try {
            usuario = JSON.parse(
                sessionStorage.getItem('reviver_usuario')
            );
        } catch {
            sessionStorage.removeItem('reviver_usuario');
        }
    
        const logado = Boolean(usuario?.id_usuario);
    
        linkLogin.textContent = logado ? 'Sair' : 'Login';
        linkLogin.href = 'index.html';
    
        linkLogin.addEventListener('click', () => {
            sessionStorage.removeItem('reviver_usuario');
            localStorage.removeItem('reviver_token');
        });
    })();
}