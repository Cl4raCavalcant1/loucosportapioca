// ==============================================================
// 1. CONFIGURAÇÃO DO FIREBASE (BANCO DE DADOS)
// ==============================================================
const firebaseConfig = {
    apiKey: "AlzaSyBp32ijeLw2LvNwKur5EaUj7B9WZ1G-AW0",
    authDomain: "loucosportapioca-57964.firebaseapp.com",
    projectId: "loucosportapioca-57964",
    storageBucket: "loucosportapioca-57964.firebasestorage.app",
    messagingSenderId: "371332659198",
    appId: "1:371332659198:web:330626357653acc00772af"
};

// Inicializa o Firebase apenas se ainda não estiver iniciado
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// ==============================================================
// 2. VARIÁVEIS GLOBAIS
// ==============================================================
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let menuGlobal = []; 

// ==============================================================
// 3. BUSCAR PRODUTOS NO BANCO (AQUI ESTAVA O ERRO)
// ==============================================================
// Essa função fica "escutando" o banco. Se você mudar algo no Admin,
// muda aqui na hora, sem precisar recarregar a página.
db.collection("produtos").onSnapshot((querySnapshot) => {
    menuGlobal = []; // Limpa a memória
    const container = document.getElementById('itens-cardapio');
    const loading = document.querySelector('.loading-area');

    // Se estiver vazio
    if (querySnapshot.empty) {
        if(container) container.innerHTML = '<p style="text-align:center; padding:40px; color:#666;">Nenhum produto cadastrado ainda.</p>';
        if(loading) loading.style.display = 'none';
        return;
    }

    // Preenche a lista global
    querySnapshot.forEach((doc) => {
        const item = doc.data();
        item.id = doc.id; // Importante: Salva o ID do Firebase
        menuGlobal.push(item);
    });

    // Esconde o "Carregando..."
    if(loading) loading.style.display = 'none';

    // Desenha o menu na tela (Filtro 'todos' por padrão)
    renderizarMenu('todos');

}, (error) => {
    console.error("Erro ao buscar produtos:", error);
    // Não usamos alert aqui para não assustar o cliente se a net oscilar
});

// ==============================================================
// 4. FUNÇÕES DE RENDERIZAÇÃO (MOSTRAR NA TELA)
// ==============================================================

// Desenha os cards do cardápio
window.renderizarMenu = function(filtro = 'todos') {
    const container = document.getElementById('itens-cardapio');
    if (!container) return; // Se não estiver na tela inicial, para.

    container.innerHTML = '';

    // Aplica o filtro (Pratos, Tapiocas, Bebidas...)
    const lista = filtro === 'todos' ? menuGlobal : menuGlobal.filter(p => p.categoria === filtro);

    if (lista.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#666;">Nenhum item nesta categoria.</div>';
        return;
    }

    lista.forEach(item => {
        // Se não tiver foto, usa uma padrão cinza
        const img = item.imagem ? item.imagem : "https://via.placeholder.com/150";
        const desc = item.descricao ? item.descricao : ''; // Evita 'undefined'
        
        container.innerHTML += `
            <div class="card-produto">
                <div class="img-wrapper">
                    <img src="${img}" alt="${item.nome}" loading="lazy">
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

// ==============================================================
// 5. FUNÇÕES DO CARRINHO
// ==============================================================

window.adicionarAoCarrinho = function(id) {
    // Procura o produto na lista que baixamos do Firebase
    const produto = menuGlobal.find(p => p.id == id);

    if (produto) {
        const itemNoCarrinho = carrinho.find(item => item.id == id);
        
        if (itemNoCarrinho) {
            itemNoCarrinho.quantidade = Number(itemNoCarrinho.quantidade) + 1;
            msgSucesso(`+1 ${produto.nome}`);
        } else {
            carrinho.push({ ...produto, quantidade: 1 });
            msgSucesso(`${produto.nome} na sacola!`);
        }
        
        atualizarInterface(); // Atualiza os números no topo
    }
}

// Atualiza o total e os contadores na tela
function atualizarInterface() {
    const labelQtd = document.querySelector('.qtd-itens');
    const labelTotal = document.querySelector('.total-valor');
    const labelTotalSacola = document.querySelector('.valor-sacola'); // No carrinho.html
    const labelQtdSacola = document.querySelector('.texto-sacola');   // No carrinho.html
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

    // Atualiza Header da Home
    if(labelQtd && labelTotal) {
        labelQtd.innerText = `${qtd} Produtos`;
        labelTotal.innerText = totalFormatado;
    }

    // Atualiza Header do Carrinho
    if(labelTotalSacola && labelQtdSacola) {
        labelTotalSacola.innerText = totalFormatado;
        labelQtdSacola.innerText = `${qtd} itens na sacola`;
    }

    // Salva no celular do cliente
    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    // Se estiver na tela do carrinho, redesenha a lista
    if(containerCarrinho) {
        renderizarListaCarrinho(containerCarrinho);
    }
}

// Desenha a lista dentro do carrinho.html
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

// Botões + e -
window.alterarQtd = function(id, mudanca) {
    const item = carrinho.find(i => i.id == id);
    if (item) {
        item.quantidade += mudanca;
        
        if (item.quantidade <= 0) {
            removerItem(id); // Se zerar, remove
        } else {
            atualizarInterface();
        }
    }
}

// Remover item (Lixeira)
window.removerItem = function(id) {
    if(confirm("Tirar este item da sacola?")) {
        carrinho = carrinho.filter(item => item.id != id);
        atualizarInterface();
    }
}

// ==============================================================
// 6. UTILITÁRIOS (TOASTS DE MENSAGEM)
// ==============================================================
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

// Executa ao abrir o site para carregar números do carrinho
atualizarInterface();