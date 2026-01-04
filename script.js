// VARIÁVEIS GLOBAIS
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let menuGlobal = []; 

// FUNÇÃO DE MENSAGEM (TOAST)
function msgSucesso(texto) {
    Toastify({
        text: texto,
        duration: 3000,
        gravity: "top", // top ou bottom
        position: "center", // left, center, right
        style: {
            background: "#00C851", // Verde Sucesso
            borderRadius: "10px",
            fontWeight: "bold"
        }
    }).showToast();
}

function msgErro(texto) {
    Toastify({
        text: texto,
        duration: 3000,
        gravity: "top",
        position: "center",
        style: {
            background: "#ff4444", // Vermelho Erro
            borderRadius: "10px",
            fontWeight: "bold"
        }
    }).showToast();
}

// 1. CALCULA E ATUALIZA TELA
function atualizarInterface() {
    const labelQtd = document.querySelector('.qtd-itens');
    const labelTotal = document.querySelector('.total-valor');
    const labelTotalSacola = document.querySelector('.valor-sacola');
    const labelQtdSacola = document.querySelector('.texto-sacola');
    const containerCarrinho = document.getElementById('lista-carrinho');

    let qtd = 0;
    let total = 0;

    carrinho.forEach(item => {
        let quantidade = Number(item.quantidade) || 1;
        let preco = Number(item.preco) || 0;
        
        qtd += quantidade;
        total += preco * quantidade;
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

    // Se estiver na página do carrinho, redesenha
    if(containerCarrinho) {
        renderizarListaCarrinho(containerCarrinho);
    }
}

// 2. ADICIONAR (Tela Inicial)
window.adicionarAoCarrinho = function(id) {
    const produto = menuGlobal.find(p => p.id == id);

    if (produto) {
        const itemNoCarrinho = carrinho.find(item => item.id == id);
        if (itemNoCarrinho) {
            itemNoCarrinho.quantidade = Number(itemNoCarrinho.quantidade) + 1;
            msgSucesso(`+1 ${produto.nome} adicionado!`);
        } else {
            carrinho.push({ ...produto, quantidade: 1 });
            msgSucesso(`${produto.nome} foi para a sacola! 👜`);
        }
        atualizarInterface();
    } else {
        msgErro("Erro ao adicionar produto.");
    }
}

// 3. DESENHAR CARRINHO (Tela Carrinho)
function renderizarListaCarrinho(container) {
    container.innerHTML = '';

    if (carrinho.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:50px; color:#666;"><i class="fa-solid fa-basket-shopping" style="font-size:40px; margin-bottom:10px;"></i><p>Sua sacola está vazia.</p></div>';
        return;
    }

    carrinho.forEach(item => {
        const img = item.imagem || "https://via.placeholder.com/150";
        const qtdItem = item.quantidade || 1;

        container.innerHTML += `
            <div class="card-carrinho">
                <div class="img-carrinho">
                    <img src="${img}">
                </div>
                <div class="info-carrinho">
                    <div>
                        <h3>${item.nome}</h3>
                        <p class="price">R$ ${Number(item.preco).toFixed(2).replace('.', ',')}</p>
                    </div>
                    
                    <div class="controles-carrinho">
                        <button class="btn-qtd" onclick="alterarQtd('${item.id}', -1)">-</button>
                        <span class="qtd-numero">${qtdItem}</span>
                        <button class="btn-qtd" onclick="alterarQtd('${item.id}', 1)">+</button>
                    </div>

                    <i class="fa-solid fa-trash btn-lixo" onclick="removerItem('${item.id}')"></i>
                </div>
            </div>
        `;
    });
}

// 4. MUDAR QUANTIDADE (+ e -)
window.alterarQtd = function(id, mudanca) {
    const item = carrinho.find(i => i.id == id);
    if (item) {
        item.quantidade = Number(item.quantidade) + mudanca;
        
        if (item.quantidade <= 0) {
            removerItem(id); 
        } else {
            atualizarInterface();
        }
    }
}

// 5. REMOVER
window.removerItem = function(id) {
    // Aqui ainda mantive o confirm padrão pois é mais seguro para deletar
    if(confirm("Deseja remover este item da sacola?")) {
        carrinho = carrinho.filter(item => item.id != id);
        atualizarInterface();
        msgErro("Item removido.");
    }
}

// 6. RENDERIZAR MENU (Tela Inicial)
window.renderizarMenu = function(filtro = 'todos') {
    const container = document.getElementById('itens-cardapio');
    if (!container) return;
    container.innerHTML = '';

    const lista = filtro === 'todos' ? menuGlobal : menuGlobal.filter(p => p.categoria === filtro);
    
    const loading = document.querySelector('.loading-area');
    if(loading) loading.remove();

    if (lista.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:30px; color:#5A3E34;">Nenhum item nesta categoria.</p>';
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
                        <p class="price">R$ ${Number(item.preco).toFixed(2).replace('.', ',')}</p>
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