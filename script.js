// --- 1. CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
    apiKey: "AlzaSyBp32ijeLw2LvNwKur5EaUj7B9WZ1G-AW0",
    authDomain: "loucosportapioca-57964.firebaseapp.com",
    projectId: "loucosportapioca-57964",
    storageBucket: "loucosportapioca-57964.firebasestorage.app",
    messagingSenderId: "371332659198",
    appId: "1:371332659198:web:330626357653acc00772af"
};

// Inicializa (Verifica se já existe para não dar erro)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// --- 2. VARIÁVEIS GLOBAIS ---
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let menuGlobal = []; 

// --- 3. BUSCAR PRODUTOS (A Mágica Acontece Aqui) ---
db.collection("produtos").onSnapshot((querySnapshot) => {
    menuGlobal = []; // Limpa lista antiga
    
    querySnapshot.forEach((doc) => {
        const item = doc.data();
        item.id = doc.id; // Salva o ID para usar no carrinho
        menuGlobal.push(item);
    });

    // Remove o aviso de "Carregando..."
    const loading = document.querySelector('.loading-area');
    if(loading) loading.style.display = 'none';

    // Desenha na tela
    renderizarMenu('todos');
}, (error) => {
    console.error("Erro ao buscar produtos:", error);
    alert("Erro ao carregar cardápio. Verifique sua conexão.");
});


// --- 4. FUNÇÕES DO CARRINHO E TELA ---

function msgSucesso(texto) {
    Toastify({
        text: texto, duration: 3000, gravity: "top", position: "center",
        style: { background: "#00C851", borderRadius: "10px", fontWeight: "bold" }
    }).showToast();
}

function msgErro(texto) {
    Toastify({
        text: texto, duration: 3000, gravity: "top", position: "center",
        style: { background: "#ff4444", borderRadius: "10px", fontWeight: "bold" }
    }).showToast();
}

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

    if(labelQtd && labelTotal) {
        labelQtd.innerText = `${qtd} Produtos`;
        labelTotal.innerText = totalFormatado;
    }
    if(labelTotalSacola && labelQtdSacola) {
        labelTotalSacola.innerText = totalFormatado;
        labelQtdSacola.innerText = `${qtd} itens na sacola`;
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    if(containerCarrinho) {
        renderizarListaCarrinho(containerCarrinho);
    }
}

window.adicionarAoCarrinho = function(id) {
    const produto = menuGlobal.find(p => p.id == id);
    if (produto) {
        const itemNoCarrinho = carrinho.find(item => item.id == id);
        if (itemNoCarrinho) {
            itemNoCarrinho.quantidade = Number(itemNoCarrinho.quantidade) + 1;
            msgSucesso(`+1 ${produto.nome}`);
        } else {
            carrinho.push({ ...produto, quantidade: 1 });
            msgSucesso(`${produto.nome} adicionado!`);
        }
        atualizarInterface();
    }
}

function renderizarListaCarrinho(container) {
    container.innerHTML = '';
    if (carrinho.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:50px; color:#666;"><i class="fa-solid fa-basket-shopping" style="font-size:40px; margin-bottom:10px;"></i><p>Sua sacola está vazia.</p></div>';
        return;
    }

    carrinho.forEach(item => {
        const img = item.imagem || "https://via.placeholder.com/150";
        container.innerHTML += `
            <div class="card-carrinho">
                <div class="img-carrinho"><img src="${img}"></div>
                <div class="info-carrinho">
                    <div>
                        <h3>${item.nome}</h3>
                        <p class="price">R$ ${Number(item.preco).toFixed(2).replace('.', ',')}</p>
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

window.alterarQtd = function(id, mudanca) {
    const item = carrinho.find(i => i.id == id);
    if (item) {
        item.quantidade += mudanca;
        if (item.quantidade <= 0) removerItem(id);
        else atualizarInterface();
    }
}

window.removerItem = function(id) {
    if(confirm("Remover este item?")) {
        carrinho = carrinho.filter(item => item.id != id);
        atualizarInterface();
    }
}

window.renderizarMenu = function(filtro = 'todos') {
    const container = document.getElementById('itens-cardapio');
    if (!container) return;
    container.innerHTML = '';

    const lista = filtro === 'todos' ? menuGlobal : menuGlobal.filter(p => p.categoria === filtro);

    if (lista.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px; color:#666;">Nenhum item encontrado nesta categoria.</p>';
        return;
    }

    lista.forEach(item => {
        const img = item.imagem ? item.imagem : "https://via.placeholder.com/150";
        // Previne erro se descrição estiver vazia
        const desc = item.descricao ? item.descricao : '';
        
        container.innerHTML += `
            <div class="card-produto">
                <div class="img-wrapper">
                    <img src="${img}" loading="lazy">
                </div>
                <div class="info-wrapper">
                    <div>
                        <h3>${item.nome}</h3>
                        <p class="desc">${desc}</p>
                    </div>
                    <div>
                        <p class="price">R$ ${Number(item.preco).toFixed(2).replace('.', ',')}</p>
                        <button class="btn-add" onclick="adicionarAoCarrinho('${item.id}')">
                            Adicionar
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

// Inicializa a interface (Total, Quantidade)
atualizarInterface();