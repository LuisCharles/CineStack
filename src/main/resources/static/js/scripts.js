const API_BASE = "https://cinestack.onrender.com/filmes";
const API_AUTH = "https://cinestack.onrender.com/auth";
const CAPA_PADRAO = "https://placehold.co/400x600/12101f/a855f7?text=CineStack";

let filmesDoUsuario = [];
let modoCadastro = false;

// === AUTENTICAÇÃO ===
function mostrarErro(msg) {
    const alerta = document.getElementById('alerta-auth');
    alerta.innerText = msg; alerta.style.display = 'block';
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
    const payload = modoCadastro ? { username: user, senha: pass, nomeReal: nome } : { username: user, senha: pass };

    try {
        const res = await fetch(`${API_AUTH}${endpoint}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('nomeUsuario', data.nomeReal || user);
            localStorage.setItem('usuarioId', data.id); 
            mostrarApp();
        } else {
            mostrarErro(modoCadastro ? "Usuário já existe!" : "Usuário ou senha inválidos!");
        }
    } catch (e) { mostrarErro("Erro de conexão. Servidor Java online?"); }
}

function mostrarApp() {
    document.getElementById('tela-login').classList.remove('d-flex');
    document.getElementById('tela-login').style.display = 'none';
    document.getElementById('app-catalogo').style.display = 'block';
    listar(); 
}

function logout() { localStorage.clear(); location.reload(); }

// === CONTROLE DE ABAS ===
function mudarAba(abaDestino) {
    document.getElementById('btn-aba-biblioteca').classList.remove('active');
    document.getElementById('btn-aba-descobrir').classList.remove('active');
    document.getElementById(`btn-aba-${abaDestino}`).classList.add('active');

    if (abaDestino === 'biblioteca') {
        document.getElementById('secao-descobrir').style.display = 'none';
        document.getElementById('secao-biblioteca').style.display = 'block';
        listar(); 
    } else {
        document.getElementById('secao-biblioteca').style.display = 'none';
        document.getElementById('secao-descobrir').style.display = 'block';
        carregarDescobrir('popular', 1); 
    }
}

// === MINHA BIBLIOTECA ===
async function listar() {
    const userId = localStorage.getItem('usuarioId');
    if(!userId) { logout(); return; }

    const res = await fetch(`${API_BASE}/usuario/${userId}`);
    filmesDoUsuario = await res.json();
    
    const header = document.getElementById('header-dynamic');
    const barraFiltros = document.getElementById('barra-filtros');
    const nomeLogado = localStorage.getItem('nomeUsuario') || "Visitante";

    if (filmesDoUsuario.length === 0) {
        barraFiltros.style.display = 'none';
        header.innerHTML = `
            <div class="mb-5">
                <h1 class="hero-title text-white">Olá, <span class="text-purple-gradient">${nomeLogado}</span>!</h1>
                <h1 class="hero-title">Sua Biblioteca <span class="text-purple-gradient">Cinematográfica</span></h1>
                <p class="text-white fs-5 opacity-75">Sua coleção está vazia. Explore a aba Descobrir para começar!</p>
            </div>`;
    } else {
        barraFiltros.style.display = 'flex';
        document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.filter-pill').classList.add('active'); 
        header.innerHTML = `
            <div class="mb-5 border-start border-4 border-purple ps-4">
                <h1 class="fw-bold display-4 hero-title text-white">Olá, <span class="text-purple-gradient">${nomeLogado}</span>!</h1>
                <p class="text-white opacity-75">Gerencie seus títulos favoritos abaixo.</p>
            </div>`;
    }
    renderizarGrid();
}

async function aplicarFiltro(tipo, elementoBotao) {
    const userId = localStorage.getItem('usuarioId');
    document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
    elementoBotao.classList.add('active');
    
    let endpoint = `${API_BASE}/usuario/${userId}`;
    if (tipo === 'recentes') endpoint += `/recentes`;
    if (tipo === 'favoritos') endpoint += `/favoritos`;
    if (tipo === 'vistos') endpoint += `/vistos`;
    if (tipo === 'nao-vistos') endpoint += `/nao-vistos`;

    const res = await fetch(endpoint);
    filmesDoUsuario = await res.json();
    renderizarGrid();
}

function renderizarGrid() {
    const grid = document.getElementById("gridFilmes");
    grid.innerHTML = filmesDoUsuario.map(f => `
        <div class="movie-card shadow-lg" onclick="abrirModal('${f.titulo.replace(/'/g, "\\'")}')">
            <div class="favorite-btn ${f.favorito ? 'active' : ''}" onclick="favoritar(event, ${f.id}, this)" title="Favoritar">
                <i class="fas fa-star"></i>
            </div>
            <div class="seen-btn ${f.visto ? 'active' : ''}" onclick="marcarVisto(event, ${f.id}, this)" title="Marcar como Visto">
                <i class="fas fa-eye"></i>
            </div>
            <div class="poster-wrapper"><img src="${f.urlCapa}" class="movie-poster" onerror="this.src='${CAPA_PADRAO}'"></div>
            <div class="card-info p-3">
                <div class="card-title fw-bold text-white text-truncate">${f.titulo}</div>
                <div class="text-white small">⭐ ${f.nota} • ${f.anoLancamento}</div>
            </div>
        </div>`).join("");
}

async function favoritar(event, filmeId, elemento) {
    event.stopPropagation(); 
    elemento.classList.toggle('active');
    try { await fetch(`${API_BASE}/${filmeId}/favorito`, { method: 'PATCH' }); } 
    catch (erro) { elemento.classList.toggle('active'); }
}

async function marcarVisto(event, filmeId, elemento) {
    event.stopPropagation(); 
    elemento.classList.toggle('active'); 
    try { await fetch(`${API_BASE}/${filmeId}/visto`, { method: 'PATCH' }); } 
    catch (erro) { elemento.classList.toggle('active'); }
}

// === ABA DESCOBRIR ===
let categoriaAtualDescobrir = 'popular';
let paginaAtualDescobrir = 1;

async function carregarDescobrir(categoria, pagina = 1) {
    categoriaAtualDescobrir = categoria;
    paginaAtualDescobrir = pagina;
    const res = await fetch(`${API_BASE}/descobrir/${categoria}?page=${pagina}`);
    const data = await res.json();
    renderizarGridDescobrir(data.results);
    renderizarPaginacao(data.total_pages);
}

function aplicarFiltroDescobrir(categoria, elementoBotao) {
    document.querySelectorAll('.filter-pill-descobrir').forEach(btn => btn.classList.remove('active'));
    elementoBotao.classList.add('active');
    carregarDescobrir(categoria, 1); 
}

function renderizarGridDescobrir(filmesTmdb) {
    const grid = document.getElementById("gridDescobrir");
    grid.innerHTML = filmesTmdb.map(f => {
        const img = f.poster_path ? `https://image.tmdb.org/t/p/w500${f.poster_path}` : CAPA_PADRAO;
        const ano = f.release_date ? f.release_date.substring(0,4) : 'N/A';
        const nota = f.vote_average ? f.vote_average.toFixed(1) : '0.0';
        return `
        <div class="movie-card shadow-lg" onclick="abrirModal('${f.title.replace(/'/g, "\\'")}', true, '${f.id}')">
            <div class="poster-wrapper"><img src="${img}" class="movie-poster"></div>
            <div class="card-info p-3">
                <div class="card-title fw-bold text-white text-truncate">${f.title}</div>
                <div class="text-white small">⭐ ${nota} • ${ano}</div>
            </div>
        </div>`
    }).join("");
}

function renderizarPaginacao(totalPaginas) {
    const container = document.getElementById("paginacao-descobrir");
    let botoesHTML = "";
    const maxPaginas = Math.min(totalPaginas, 5); 
    for (let i = 1; i <= maxPaginas; i++) {
        const ativo = (i === paginaAtualDescobrir) ? "active" : "";
        botoesHTML += `<button class="page-btn ${ativo}" onclick="mudarPaginaDescobrir(${i})">${i}</button>`;
    }
    container.innerHTML = botoesHTML;
}

function mudarPaginaDescobrir(novaPagina) {
    carregarDescobrir(categoriaAtualDescobrir, novaPagina);
    document.getElementById('secao-descobrir').scrollIntoView({ behavior: 'smooth' });
}

// === BUSCA E MODAL ===
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
                <div><strong class="text-white">${f.title}</strong><br><small style="color: white;">${f.release_date ? f.release_date.substring(0,4) : 'N/A'}</small></div>
            </li>`;
    }).join("");
    lista.style.display = 'block';
}

async function abrirModal(titulo, isNovo = false, idTmdb = null) {
    document.getElementById('listaResultados').style.display = 'none';
    const rota = isNovo ? `details-tmdb/${idTmdb}` : `search-tmdb?query=${encodeURIComponent(titulo)}`;
    const res = await fetch(`${API_BASE}/${rota}`);
    const f = isNovo ? await res.json() : (await res.json()).results[0];

    // O Java devolve os detalhes, o elenco E os vídeos!
    const resDet = await fetch(`${API_BASE}/details-tmdb/${f.id}`);
    const det = await resDet.json();
    const elenco = det.credits ? det.credits.cast.slice(0, 6) : [];

    // Preenche os textos
    document.getElementById('modal-titulo').innerText = f.title;
    document.getElementById('modal-foto').src = `https://image.tmdb.org/t/p/w500${f.poster_path}`;
    document.getElementById('modal-sinopse').innerText = f.overview || "Sem sinopse.";
    document.getElementById('modal-ano').innerText = f.release_date ? f.release_date.substring(0,4) : "----";
    document.getElementById('modal-nota').innerText = `⭐ ${f.vote_average.toFixed(1)}`;
    document.getElementById('modal-tomato').innerText = `${(f.vote_average * 10 - 4).toFixed(0)}%`;
    document.getElementById('modal-elenco').innerHTML = elenco.map(a => `<div class="cast-pill" style="background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.2); padding: 4px 12px; border-radius: 50px; font-size: 0.8rem; color: white;">${a.name}</div>`).join("");

    // BOTÃO DE TRAILER (NOVO)
    const trailerBtn = document.getElementById('modal-trailer');
    let trailerOficial = null;

    // Procura na lista de vídeos se existe algum do YouTube do tipo "Trailer"
    if (det.videos && det.videos.results) {
        trailerOficial = det.videos.results.find(video => video.site === 'YouTube' && video.type === 'Trailer');
    }

    if (trailerOficial) {
        trailerBtn.href = `https://www.youtube.com/watch?v=${trailerOficial.key}`;
        trailerBtn.style.display = 'block';
    } else {
        // Se o TMDB não tiver trailer, esconde o botão ou linka para uma pesquisa geral
        trailerBtn.href = `https://www.youtube.com/results?search_query=Trailer+${f.title}+Legendado`;
        trailerBtn.style.display = 'block'; 
    }

    // Ações de Adicionar / Remover
    const footer = document.getElementById('modal-footer-actions');
    const salvo = filmesDoUsuario.find(item => item.titulo === f.title);
    footer.innerHTML = salvo 
        ? `<button class="btn-action-remove w-100" onclick="remover(${salvo.id})">REMOVER DA BIBLIOTECA</button>` 
        : `<button class="btn-action-add w-100" onclick="salvar('${f.id}')">ADICIONAR À BIBLIOTECA</button>`;

    new bootstrap.Modal(document.getElementById('modalFilme')).show();
}

async function salvar(idTmdb) {
    const userId = localStorage.getItem('usuarioId'); 
    const res = await fetch(`${API_BASE}/details-tmdb/${idTmdb}`);
    const f = await res.json();
    
    const filme = {
        titulo: f.title, urlCapa: `https://image.tmdb.org/t/p/w500${f.poster_path}`,
        anoLancamento: parseInt(f.release_date ? f.release_date.substring(0,4) : 0), nota: parseFloat(f.vote_average.toFixed(1)),
        sinopse: f.overview, usuario: { id: userId }, favorito: false, visto: false 
    };
    
    await fetch(API_BASE, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(filme)});
    bootstrap.Modal.getInstance(document.getElementById('modalFilme')).hide();
    
    await listar(); 
    mudarAba('biblioteca'); 
}

async function remover(id) {
    if(confirm("Deseja remover este filme da sua biblioteca?")) {
        await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        bootstrap.Modal.getInstance(document.getElementById('modalFilme')).hide();
        listar(); 
    }
}

window.onload = () => { if(localStorage.getItem('usuarioId')) mostrarApp(); };