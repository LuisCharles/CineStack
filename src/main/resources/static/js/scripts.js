const API_BASE = "http://localhost:8082/filmes";
const API_AUTH = "http://localhost:8082/auth";
const CAPA_PADRAO = "https://placehold.co/400x600/12101f/a855f7?text=CineStack";

let filmesDoUsuario = [];
let modoCadastro = false;

// === AUTENTICAÇÃO E TROCA DE TELA ===

function mostrarErro(msg) {
    const alerta = document.getElementById('alerta-auth');
    alerta.innerText = msg;
    alerta.style.display = 'block';
    setTimeout(() => { alerta.style.display = 'none'; }, 4000);
}

function alternarModoAuth() {
    modoCadastro = !modoCadastro;
    document.getElementById('campo-nome-real').style.display = modoCadastro ? 'block' : 'none';
    document.getElementById('auth-titulo').innerText = modoCadastro ? 'Criar Nova Conta' : 'Acessar Biblioteca';
    document.getElementById('btn-auth').innerText = modoCadastro ? 'CADASTRAR' : 'ENTRAR';
    document.getElementById('auth-link').innerText = modoCadastro ? 'Faça Login' : 'Cadastre-se';
}

async function autenticar() {
    const user = document.getElementById('userAuth').value;
    const pass = document.getElementById('passAuth').value;
    const nome = document.getElementById('regNomeReal').value;

    const endpoint = modoCadastro ? "/registrar" : "/login";
    const payload = modoCadastro 
        ? { username: user, senha: pass, nomeReal: nome }
        : { username: user, senha: pass };

    try {
        const res = await fetch(`${API_AUTH}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();
            // Salva e entra no App
            localStorage.setItem('nomeUsuario', data.nomeReal);
            mostrarApp();
        } else {
            mostrarErro(modoCadastro ? "Usuário já existe!" : "Usuário ou senha inválidos!");
        }
    } catch (e) {
        mostrarErro("Erro de conexão (CORS). Verifique o Java!");
    }
}

function mostrarApp() {
    // ESCONDE O LOGIN E MOSTRA O CATALOGO (NAVBAR VEM JUNTO)
    document.getElementById('tela-login').style.display = 'none';
    document.getElementById('app-catalogo').style.display = 'block';
    listar(); 
}

function logout() {
    localStorage.clear();
    location.reload();
}

// === GERENCIAMENTO DE FILMES ===

async function listar() {
    const res = await fetch(API_BASE);
    filmesDoUsuario = await res.json();
    
    const header = document.getElementById('header-dynamic');
    const nomeLogado = localStorage.getItem('nomeUsuario') || "Visitante";

    if (filmesDoUsuario.length === 0) {
        header.innerHTML = `
            <div class="mb-5">
                <h1 class="hero-title text-white">Olá, ${nomeLogado}!</h1>
                <h1 class="hero-title"><span class="text-purple-gradient">Sua Biblioteca Cinematográfica</span></h1>
                <p class="text-white fs-5">Sua coleção está vazia. Pesquise filmes acima para começar!</p>
            </div>`;
    } else {
        header.innerHTML = `
            <div class="mb-5 border-start border-4 border-purple ps-4">
                <h1 class="fw-bold display-4 hero-title text-white">Olá, ${nomeLogado}!<span>.</span></h1>
                <p class="text-white">Gerencie seus títulos favoritos abaixo.</p>
            </div>`;
    }
    renderizarGrid();
}

function renderizarGrid() {
    const grid = document.getElementById("gridFilmes");
    grid.innerHTML = filmesDoUsuario.map(f => `
        <div class="movie-card shadow-lg" onclick="abrirModal('${f.titulo.replace(/'/g, "\\'")}')">
            <div class="poster-wrapper">
                <img src="${f.urlCapa}" class="movie-poster" onerror="this.src='${CAPA_PADRAO}'">
            </div>
            <div class="card-info p-3">
                <div class="card-title fw-bold text-white text-truncate">${f.titulo}</div>
                <div class="text-white small">⭐ ${f.nota} • ${f.anoLancamento}</div>
            </div>
        </div>`).join("");
}

// === BUSCA E MODAL (PROXYS PRO JAVA) ===
async function buscarNoJava() {
    const termo = document.getElementById('searchInput').value;
    const lista = document.getElementById('listaResultados');
    if (termo.length < 3) { lista.style.display = 'none'; return; }

    const res = await fetch(`${API_BASE}/search-tmdb?query=${termo}`);
    const data = await res.json();
    
    lista.innerHTML = data.results.slice(0, 5).map(f => {
        const img = f.poster_path ? `https://image.tmdb.org/t/p/w92${f.poster_path}` : CAPA_PADRAO;
        return `
            <li onclick="abrirModal('${f.title.replace(/'/g, "\\'")}', true, '${f.id}')">
                <img src="${img}" style="width: 40px; border-radius: 4px;">
                <div>
                    <strong class="text-white">${f.title}</strong><br>
                    <small style="color: white;">${f.release_date ? f.release_date.substring(0,4) : 'N/A'}</small>
                </div>
            </li>`;
    }).join("");
    lista.style.display = 'block';
}

async function abrirModal(titulo, isNovo = false, idTmdb = null) {
    document.getElementById('listaResultados').style.display = 'none';
    const rota = isNovo ? `details-tmdb/${idTmdb}` : `search-tmdb?query=${encodeURIComponent(titulo)}`;
    const res = await fetch(`${API_BASE}/${rota}`);
    const f = isNovo ? await res.json() : (await res.json()).results[0];

    const resDet = await fetch(`${API_BASE}/details-tmdb/${f.id}`);
    const det = await resDet.json();
    const elenco = det.credits ? det.credits.cast.slice(0, 6) : [];

    document.getElementById('modal-titulo').innerText = f.title;
    document.getElementById('modal-foto').src = `https://image.tmdb.org/t/p/w500${f.poster_path}`;
    document.getElementById('modal-sinopse').innerText = f.overview || "Sem sinopse.";
    document.getElementById('modal-ano').innerText = f.release_date ? f.release_date.substring(0,4) : "----";
    document.getElementById('modal-nota').innerText = `⭐ ${f.vote_average.toFixed(1)}`;
    document.getElementById('modal-tomato').innerText = `${(f.vote_average * 10 - 4).toFixed(0)}%`;
    document.getElementById('modal-elenco').innerHTML = elenco.map(a => `<div class="cast-pill" style="background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.2); padding: 4px 12px; border-radius: 50px; font-size: 0.8rem; color: white;">${a.name}</div>`).join("");

    const footer = document.getElementById('modal-footer-actions');
    const salvo = filmesDoUsuario.find(item => item.titulo === f.title);
    footer.innerHTML = salvo 
        ? `<button class="btn-action-remove w-100" onclick="remover(${salvo.id})">REMOVER DA BIBLIOTECA</button>` 
        : `<button class="btn-action-add w-100" onclick="salvar('${f.id}')">ADICIONAR À BIBLIOTECA</button>`;

    new bootstrap.Modal(document.getElementById('modalFilme')).show();
}

async function salvar(idTmdb) {
    const res = await fetch(`${API_BASE}/details-tmdb/${idTmdb}`);
    const f = await res.json();
    const filme = {
        titulo: f.title,
        urlCapa: `https://image.tmdb.org/t/p/w500${f.poster_path}`,
        anoLancamento: parseInt(f.release_date ? f.release_date.substring(0,4) : 0),
        nota: parseFloat(f.vote_average.toFixed(1)),
        sinopse: f.overview
    };
    await fetch(API_BASE, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(filme)});
    location.reload();
}

async function remover(id) {
    if(confirm("Deseja remover este filme?")) {
        await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        location.reload();
    }
}

function favoritar(event, el) {
    event.stopPropagation();
    el.classList.toggle('active');
}

window.onload = () => { if(localStorage.getItem('nomeUsuario')) mostrarApp(); };