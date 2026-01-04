// VARIÁVEIS GLOBAIS
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let menuGlobal = []; 

// 1. ATUALIZAR INTERFACE (Calcula Totais)
function atualizarInterface() {
    const labelQtd = document.querySelector('.qtd-itens');
    const labelTotal = document.querySelector('.total-valor');
    const labelTotalSacola = document.querySelector('.valor-sacola');
    const labelQtdSacola = document.querySelector('.texto-sacola');
    const containerCarrinho = document.getElementById('lista-carrinho');

    let qtd = 0;
    let total = 0;

    carrinho.forEach(item => {
        // Garante que quantidade e preço sejam números
        let q = Number(item.quantidade) || 1;
        let p = Number(item.preco) || 0;
        
        qtd += q;
        total += p * q;
    });

    const totalFormatado = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Atualiza barra do Index
    if(labelQtd && labelTotal) {
        labelQtd.innerText = `${qtd} Produtos`;
        labelTotal.innerText = totalFormatado;
    }

    // Atualiza cabeçalho do Carrinho
    if(labelTotalSacola && labelQtdSacola) {
        labelTotalSacola.innerText = totalFormatado;
        labelQtdSacola.innerText = `${qtd} itens na sacola`;
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    // Se estiver na página do carrinho, redesenha a lista
    if(containerCarrinho) {
        renderizarListaCarrinho(containerCarrinho);
    }
}

// 2. ADICIONAR (Do Cardápio)
window.adicionarAoCarrinho = function(id) {
    const produto = menuGlobal.find(p => p.id == id); // Usa == para evitar erro de tipo

    if (produto) {
        const itemNoCarrinho = carrinho.find(item => item.id == id);
        if (itemNoCarrinho) {
            itemNoCarrinho.quantidade = (itemNoCarrinho.quantidade || 1) + 1;
        } else {
            carrinho.push({ ...produto, quantidade: 1 });
        }
        atualizarInterface();
        // Feedback visual simples ou alert
        alert(`👍 ${produto.nome} adicionado!`);
    }
}

// 3. DESENHAR CARRINHO (Com Botões + e -)
function renderizarListaCarrinho(container) {
    container.innerHTML = '';

    if (carrinho.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#666;"><i class="fa-solid fa-basket-shopping" style="font-size:40px; margin-bottom:10px;"></i><p>Sua sacola está vazia...</p></div>';
        return;
    }

    carrinho.forEach(item => {
        const img = item.imagem || "https://via.placeholder.com/150";
        // Garante quantidade para exibição
        const qtdAtual = item.quantidade || 1;

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
                        <span class="qtd-numero">${qtdAtual}</span>
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
    const item = carrinho.find(i => i.id == id);
    if (item) {
        if(typeof item.quantidade !== 'number') item.quantidade = 1;
        item.quantidade += mudanca;
        
        if (item.quantidade <= 0) {
            removerItem(id);
        } else {
            atualizarInterface();
        }
    }
}

// 5. REMOVER
window.removerItem = function(id) {
    if(confirm("Remover este item?")) {
        carrinho = carrinho.filter(item => item.id != id);
        atualizarInterface();
    }
}

// 6. RENDERIZAR MENU (Index)
window.renderizarMenu = function(filtro = 'todos') {
    const container = document.getElementById('itens-cardapio');
    if (!container) return;
    container.innerHTML = '';

    const lista = filtro === 'todos' ? menuGlobal : menuGlobal.filter(p => p.categoria === filtro);
    
    // Remove loading
    const loading = document.querySelector('.loading-area');
    if(loading) loading.remove();

    if (lista.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px; color:#666;">Nenhum item encontrado.</p>';
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

// Inicializa
atualizarInterface();