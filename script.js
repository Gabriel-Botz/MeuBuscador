let cardContainer = document.querySelector("#card-grid");
let loadMoreBtn = null; // Será inicializado no window.onload

// Armazena todos os dados carregados do JSON para evitar múltiplas buscas na rede
let dados = [];
// Armazena os dados que correspondem aos filtros e busca atuais
let dadosFiltrados = [];

let filtroCategoriaAtual = 'todos';
let termoBuscaAtual = '';

// Variáveis para controlar a paginação
let indiceAtual = 0;
const CARDS_POR_PAGINA = 12;

// Função para carregar os dados e renderizar todos os cards na primeira vez
async function carregarDados() {
    if (dados.length === 0) { // Carrega os dados apenas se ainda não foram carregados
        let resposta = await fetch("data.json");
        dados = await resposta.json();
    }
    // Renderiza todos os cards assim que os dados são carregados
    aplicarFiltrosEBusca();
}

// Nova função para filtrar os dados com base na categoria clicada
function filtrarPorCategoria(categoria) {
    filtroCategoriaAtual = categoria;
    // Remove a classe 'ativo' de todos os botões e a adiciona ao clicado
    document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('ativo'));
    document.querySelector(`[onclick="filtrarPorCategoria('${categoria}')"]`).classList.add('ativo');
    aplicarFiltrosEBusca();
}

// Função chamada pelo botão "Buscar"
function iniciarBusca () {
    termoBuscaAtual = document.getElementById("input-busca").value.toLowerCase();
    aplicarFiltrosEBusca();
}

// Função central que aplica tanto o filtro de categoria quanto a busca por texto
function aplicarFiltrosEBusca() {
    let dadosProcessados = dados;

    // 1. Aplica o filtro de categoria
    if (filtroCategoriaAtual !== 'todos') {
        if (['linguagem', 'framework'].includes(filtroCategoriaAtual)) {
            dadosProcessados = dadosProcessados.filter(dado => dado.tipo === filtroCategoriaAtual);
        } else {
            dadosProcessados = dadosProcessados.filter(dado => dado.categoria === filtroCategoriaAtual);
        }
    }

    // 2. Aplica a busca por texto sobre o resultado do filtro
    if (termoBuscaAtual) {
        dadosProcessados = dadosProcessados.filter(dado => 
            dado.nome.toLowerCase().includes(termoBuscaAtual) ||
            dado.Descricao.toLowerCase().includes(termoBuscaAtual) ||
            (dado.linguagem_mae && dado.linguagem_mae.toLowerCase().includes(termoBuscaAtual))
        );
    }

    // 3. Armazena o resultado final e reinicia a renderização
    dadosFiltrados = dadosProcessados;
    renderizarCards();
}

/**
 * Reinicia a visualização: limpa os cards existentes e renderiza o primeiro lote.
 * Esta função não recebe mais argumentos, ela usa a variável global `dadosFiltrados`.
 */
function renderizarCards (){
    cardContainer.innerHTML = "";
    indiceAtual = 0; // Reseta o índice

    // Se não houver dados filtrados, mostra uma mensagem
    if (dadosFiltrados.length === 0) {
        cardContainer.innerHTML = `<p class="sem-resultados">Nenhum resultado encontrado para sua busca.</p>`;
        loadMoreBtn.style.display = 'none'; // Esconde o botão
        return; // Encerra a função
    }

    // Renderiza o primeiro lote de cards
    renderizarMaisCards();
}

/**
 * Renderiza o próximo lote de cards (12 por vez) e gerencia a visibilidade do botão "Carregar Mais".
 */
function renderizarMaisCards() {
    const loteParaRenderizar = dadosFiltrados.slice(indiceAtual, indiceAtual + CARDS_POR_PAGINA);

    loteParaRenderizar.forEach((dado) => {
        let article = document.createElement("article");
        // Adiciona uma classe para inverter a cor da imagem no modo escuro, se necessário
        const imgClass = `card-imagem ${dado.invert_in_dark ? 'invert-in-dark' : ''}`;
        // Adicionada a tag <img> e uma div para agrupar o conteúdo de texto
        article.innerHTML = `
        <img src="${dado.imagem}" alt="Logo ${dado.nome}" class="${imgClass}">
        <div class="card-conteudo">
            <h2>${dado.nome}</h2>
            <p><strong>Ano:</strong> ${dado.Ano} | <strong>Criador:</strong> ${dado.Criador}</p>
            <p>${dado.Descricao}</p>
            <a href="${dado.link}" target="_blank">Leia mais</a>
        </div>
        `

        cardContainer.appendChild(article);

        // Adiciona a classe 'visivel' com um pequeno atraso para criar a animação escalonada
        setTimeout(() => {
            article.classList.add('visivel');
        }, 100); // Um pequeno atraso para a animação funcionar
    });

    // Atualiza o índice para o próximo lote
    indiceAtual += CARDS_POR_PAGINA;

    // Verifica se ainda há mais cards para mostrar
    if (indiceAtual < dadosFiltrados.length) {
        loadMoreBtn.style.display = 'block'; // Mostra o botão
    } else {
        loadMoreBtn.style.display = 'none'; // Esconde o botão
    }
}

// Chama a função para carregar os dados assim que a página for carregada
window.onload = () => {
    loadMoreBtn = document.getElementById('load-more-btn'); // Pega o botão
    carregarDados(); // Carrega e renderiza os dados iniciais

    // Adiciona um "ouvinte" para a tecla "Enter" no campo de busca
    const inputBusca = document.getElementById("input-busca");
    inputBusca.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            iniciarBusca();
        }
    });

    // Adiciona o ouvinte para o botão "Carregar Mais"
    loadMoreBtn.addEventListener('click', renderizarMaisCards);

    // Lógica do Chaveador de Tema (Dark/Light Mode)
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Função para aplicar o tema salvo
    const aplicarTemaSalvo = () => {
        const temaSalvo = localStorage.getItem('theme');
        if (temaSalvo === 'light') {
            body.classList.add('light-mode');
            themeToggle.checked = true;
        } else {
            body.classList.remove('light-mode');
            themeToggle.checked = false;
        }
    };

    // Adiciona o ouvinte para o clique no interruptor
    themeToggle.addEventListener('change', () => {
        body.classList.toggle('light-mode');
        // Salva a preferência no localStorage
        localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
    });

    // Aplica o tema salvo assim que a página carrega
    aplicarTemaSalvo();
};
