// script.js (ATUALIZAÇÃO DO FILTRO)

const containerProdutos = document.getElementById('itens-cardapio');

// Função Principal de Renderização
function renderizarMenu(filtro = 'todos') {
    if (!containerProdutos) return;

    containerProdutos.innerHTML = '';

    // Filtra a lista
    // Se for 'todos', usa a lista completa. Se não, filtra pela categoria.
    const listaFiltrada = filtro === 'todos' 
        ? menu 
        : menu.filter(item => item.categoria === filtro);

    // Se não achar nada naquela categoria
    if (listaFiltrada.length === 0) {
        containerProdutos.innerHTML = `
            <p style="text-align:center; color:#888; margin-top:20px;">
                Nenhum item encontrado nesta categoria 😕
            </p>`;
        return;
    }

    // Desenha os cards
    listaFiltrada.forEach(item => {
        containerProdutos.innerHTML += `
            <div class="card-produto">
                <div class="img-wrapper">
                    <img src="${item.imagem}" alt="${item.nome}">
                </div>
                <div class="info-wrapper">
                    <h3>${item.nome}</h3>
                    <p class="desc">${item.descricao}</p>
                    <p class="price">R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                    <button class="btn-add" onclick="adicionarAoCarrinho(${item.id})">
                        Adicionar ao carrinho
                    </button>
                </div>
            </div>
        `;
    });
}

// Função que gerencia o clique nos botões de categoria
function filtrar(categoria, elementoClicado) {
    // 1. Remove a classe 'ativo' de todos os links
    document.querySelectorAll('.categorias a').forEach(link => {
        link.classList.remove('ativo');
    });

    // 2. Adiciona a classe 'ativo' só no que foi clicado
    elementoClicado.classList.add('ativo');

    // 3. Renderiza o menu com o novo filtro
    renderizarMenu(categoria);
}

// Inicializa mostrando tudo
renderizarMenu('todos');

// ... (MANTENHA O RESTO DO CÓDIGO DO CARRINHO ABAIXO DAQUI) ...

// 2. Lógica do Carrinho
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
atualizarBarraInferior();

function adicionarAoCarrinho(idProduto) {
    // Procura o produto no "banco de dados" (menu) pelo ID
    const itemEncontrado = menu.find(produto => produto.id === idProduto);

    if (itemEncontrado) {
        carrinho.push(itemEncontrado);
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        atualizarBarraInferior();
        
        // Feedback visual simples (opcional)
        alert("Item adicionado: " + itemEncontrado.nome);
    }
}

function atualizarBarraInferior() {
    const labelQtd = document.querySelector('.qtd-itens');
    const labelTotal = document.querySelector('.total-valor');
    
    // Verifica se os elementos existem na página atual
    if(!labelQtd || !labelTotal) return;

    const qtd = carrinho.length;
    const total = carrinho.reduce((soma, item) => soma + item.preco, 0);

    labelQtd.innerText = `${qtd} Produtos`;
    labelTotal.innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}