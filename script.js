// VARIÁVEIS GLOBAIS
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let menuGlobal = []; // Guarda os dados do Firebase

// 1. ATUALIZAR TUDO (Barrinha e Página Carrinho)
function atualizarInterface() {
    const labelQtd = document.querySelector('.qtd-itens');
    const labelTotal = document.querySelector('.total-valor');
    const labelTotalSacola = document.querySelector('.valor-sacola');
    const labelQtdSacola = document.querySelector('.texto-sacola');
    const containerCarrinho = document.getElementById('lista-carrinho');

    let qtd = 0;
    let total = 0;

    carrinho.forEach(item => {
        qtd += item.quantidade;
        total += item.preco * item.quantidade;
    });

    const totalFormatado = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Atualiza a barrinha fixa do Index
    if(labelQtd && labelTotal) {
        labelQtd.innerText = `${qtd} Produtos`;
        labelTotal.innerText = totalFormatado;
    }

    // Atualiza o cabeçalho do Carrinho
    if(labelTotalSacola && labelQtdSacola) {
        labelTotalSacola.innerText = totalFormatado;
        labelQtdSacola.innerText = `${qtd} itens na sacola`;
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    // Se estivermos na página do carrinho, desenhamos a lista com os botões +/-
    if(containerCarrinho) {
        renderizarListaCarrinho(containerCarrinho);
    }
}

// 2. FUNÇÃO ADICIONAR (Do Cardápio)
window.adicionarAoCarrinho = function(id) {
    const produto = menuGlobal.find(p => p.id === id);

    if (produto) {
        const itemNoCarrinho = carrinho.find(item => item.id === id);
        if (itemNoCarrinho) {
            itemNoCarrinho.quantidade += 1;
        } else {
            carrinho.push({ ...produto, quantidade: 1 });
        }
        atualizarInterface();
        alert(`😋 ${produto.nome} adicionado!`);
    }
}

// 3. FUNÇÃO DESENHAR O CARRINHO (Com + e -)
function renderizarListaCarrinho(container) {
    container.innerHTML = '';

    if (carrinho.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px; color:#666;">Sua sacola está vazia... Que fome! 😢</p>';
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

// 4. ALTERAR QUANTIDADE (+ ou -)
window.alterarQtd = function(id, mudanca) {
    const item = carrinho.find(i => i.id === id);
    if (item) {
        item.quantidade += mudanca;
        if (item.quantidade <= 0) {
            // Se zerar, pergunta se quer excluir
            removerItem(id);
        } else {
            atualizarInterface();
        }
    }
}

// 5. REMOVER ITEM
window.removerItem = function(id) {
    if(confirm("Tirar esse item da sacola?")) {
        carrinho = carrinho.filter(item => item.id !== id);
        atualizarInterface();
    }
}

// 6. RENDERIZAR CARDÁPIO (Index)
window.renderizarMenu = function(filtro = 'todos') {
    const container = document.getElementById('itens-cardapio');
    if (!container) return;
    container.innerHTML = '';

    const lista = filtro === 'todos' ? menuGlobal : menuGlobal.filter(p => p.categoria === filtro);
    
    // Remove loading se existir
    const loading = document.querySelector('.loading-area');
    if(loading) loading.remove();

    if (lista.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px; color: var(--marrom);">Nada por aqui nesta categoria... 😢</p>';
        return;
    }

    lista.forEach(item => {
        const img = item.imagem || "https://via.placeholder.com/150";
        container.innerHTML += `
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

// Inicializa ao carregar
atualizarInterface();