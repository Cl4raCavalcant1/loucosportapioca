// VARIÁVEIS GLOBAIS
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
const containerProdutos = document.getElementById('itens-cardapio');
let menuGlobal = []; // Guarda os dados do Firebase

// 1. ATUALIZAR BARRA INFERIOR
function atualizarBarraInferior() {
    const labelQtd = document.querySelector('.qtd-itens');
    const labelTotal = document.querySelector('.total-valor');
    
    if(!labelQtd || !labelTotal) return;

    const qtd = carrinho.length;
    const total = carrinho.reduce((soma, item) => soma + item.preco, 0);

    labelQtd.innerText = `${qtd} Produtos`;
    labelTotal.innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// 2. FUNÇÃO ADICIONAR (GLOBAL)
// O HTML chama onclick="adicionarAoCarrinho(id)"
window.adicionarAoCarrinho = function(id) {
    // Procura no menu que veio do Firebase
    const produto = menuGlobal.find(p => p.id === id);

    if (produto) {
        carrinho.push(produto);
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        atualizarBarraInferior();
        alert(`😋 ${produto.nome} adicionado!`);
    } else {
        console.error("Produto não encontrado ID:", id);
    }
}

// 3. RENDERIZAR CARDÁPIO NA TELA
window.renderizarMenu = function(filtro = 'todos') {
    if (!containerProdutos) return;
    containerProdutos.innerHTML = '';

    const lista = filtro === 'todos' ? menuGlobal : menuGlobal.filter(p => p.categoria === filtro);

    if (lista.length === 0) {
        containerProdutos.innerHTML = '<p style="text-align:center; padding:20px;">Nada por aqui...</p>';
        return;
    }

    lista.forEach(item => {
        // Se não tiver imagem, usa placeholder
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

// Inicializa a barra ao abrir
atualizarBarraInferior();