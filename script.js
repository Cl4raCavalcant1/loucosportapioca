// VARIÁVEIS GLOBAIS
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
const containerProdutos = document.getElementById('itens-cardapio');
let menuGlobal = []; // Guarda os dados do Firebase

// 1. ATUALIZAR BARRA INFERIOR E CARRINHO
function atualizarBarraInferior() {
    const labelQtd = document.querySelector('.qtd-itens');
    const labelTotal = document.querySelector('.total-valor');
    
    // Se estiver na página do carrinho, atualiza lá também
    const labelTotalSacola = document.querySelector('.valor-sacola');
    const labelQtdSacola = document.querySelector('.texto-sacola');

    let qtd = 0;
    let total = 0;

    carrinho.forEach(item => {
        qtd += item.quantidade;
        total += item.preco * item.quantidade;
    });

    const totalFormatado = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if(labelQtd && labelTotal) {
        labelQtd.innerText = `${qtd} Produtos`;
        labelTotal.innerText = totalFormatado;
    }
    if(labelTotalSacola && labelQtdSacola) {
        labelTotalSacola.innerText = totalFormatado;
        labelQtdSacola.innerText = `${qtd} itens na sacola`;
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    
    // Se estiver na página do carrinho, redesenha os itens
    if (window.location.pathname.includes('carrinho.html')) {
        renderizarCarrinho();
    }
}

// 2. FUNÇÃO ADICIONAR (Página Inicial)
window.adicionarAoCarrinho = function(id) {
    const produto = menuGlobal.find(p => p.id === id);

    if (produto) {
        const itemNoCarrinho = carrinho.find(item => item.id === id);
        if (itemNoCarrinho) {
            itemNoCarrinho.quantidade += 1;
        } else {
            carrinho.push({ ...produto, quantidade: 1 });
        }
        atualizarBarraInferior();
        alert(`😋 ${produto.nome} adicionado!`);
    }
}

// 3. RENDERIZAR CARDÁPIO (Página Inicial)
window.renderizarMenu = function(filtro = 'todos') {
    if (!containerProdutos) return;
    containerProdutos.innerHTML = '';

    const lista = filtro === 'todos' ? menuGlobal : menuGlobal.filter(p => p.categoria === filtro);
    document.querySelector('.loading-area')?.remove();

    if (lista.length === 0) {
        containerProdutos.innerHTML = '<p style="text-align:center; padding:40px; color: var(--marrom);">Nenhuma delícia encontrada nessa categoria... 😢</p>';
        return;
    }

    lista.forEach(item => {
        const img = item.imagem || "https://via.placeholder.com/150";
        containerProdutos.innerHTML += `
            <div class="card-produto">
                <div class="img-wrapper">
                    <img src="${img}" alt="${item.nome}">
                </div>
                <div class="info-wrapper">
                    <div>
                        <h3>${item.nome}</h3>
                        <p class="desc">${item.descricao || ''}</p>
                    </div>
                    <div>
                        <p class="price">R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                        <button class="btn-add" onclick="adicionarAoCarrinho('${item.id}')">
                            Adicionar ao carrinho
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

// =================================================================
// FUNÇÕES ESPECÍFICAS DA PÁGINA CARRINHO
// =================================================================

// Alterar Quantidade (+ e -)
window.alterarQtd = function(id, mudanca) {
    const item = carrinho.find(i => i.id === id);
    if (item) {
        item.quantidade += mudanca;
        if (item.quantidade <= 0) {
            removerItem(id); // Se zerar, remove
        } else {
            atualizarBarraInferior(); // Atualiza e redesenha
        }
    }
}

// Remover Item (Lixeira)
window.removerItem = function(id) {
    if(confirm("Quer mesmo tirar essa delícia da sacola? 🥺")) {
        carrinho = carrinho.filter(item => item.id !== id);
        atualizarBarraInferior();
    }
}

// Desenhar Itens no Carrinho HTML
function renderizarCarrinho() {
    const container = document.getElementById('lista-carrinho');
    if (!container) return;
    container.innerHTML = '';

    if (carrinho.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px; color:#666;">Sua sacola está vazia... Que fome! 😋</p>';
        return;
    }

    carrinho.forEach(item => {
        const img = item.imagem || "https://via.placeholder.com/150";
        container.innerHTML += `
            <div class="card-carrinho">
                <div class="img-carrinho">
                    <img src="${img}">
                </div>
                <div class="info-carrinho">
                    <div>
                        <h3>${item.nome}</h3>
                        <p class="price">R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                    </div>
                    
                    <div class="controles-carrinho">
                        <button class="btn-qtd" onclick="alterarQtd('${item.id}', -1)">-</button>
                        <span class="qtd-numero">${item.quantidade}</span>
                        <button class="btn-qtd" onclick="alterarQtd('${item.id}', 1)">+</button>
                    </div>

                    <i class="fa-solid fa-trash btn-lixo" onclick="removerItem('${item.id}')"></i>
                </div>
            </div>
        `;
    });
}

// Inicializa
atualizarBarraInferior();
// Se estiver na página do carrinho, já desenha os itens
if (window.location.pathname.includes('carrinho.html')) {
    renderizarCarrinho();
}