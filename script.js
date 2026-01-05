// ==============================================================
// 1. CONFIGURAÇÃO DO FIREBASE (Essencial para baixar os produtos)
// ==============================================================
const firebaseConfig = {
    apiKey: "AlzaSyBp32ijeLw2LvNwKur5EaUj7B9WZ1G-AW0",
    authDomain: "loucosportapioca-57964.firebaseapp.com",
    projectId: "loucosportapioca-57964",
    storageBucket: "loucosportapioca-57964.firebasestorage.app",
    messagingSenderId: "371332659198",
    appId: "1:371332659198:web:330626357653acc00772af"
};

// Inicializa o Firebase se ainda não estiver rodando
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
// 3. BUSCAR PRODUTOS (A Mágica acontece aqui)
// ==============================================================
// O sistema fica "escutando" o banco de dados. 
// Assim que carregar, ele preenche o site.
db.collection("produtos").onSnapshot((querySnapshot) => {
    menuGlobal = []; // Limpa a lista para não duplicar
    const container = document.getElementById('itens-cardapio');
    const loading = document.querySelector('.loading-area');

    if (querySnapshot.empty) {
        if(container) container.innerHTML = '<p style="text-align:center; padding:40px; color:#666;">Nenhum produto cadastrado.</p>';
        if(loading) loading.style.display = 'none';
        return;
    }

    querySnapshot.forEach((doc) => {
        const item = doc.data();
        item.id = doc.id; // Guarda o ID para o carrinho saber qual produto é
        menuGlobal.push(item);
    });

    // Remove o aviso de "Carregando..."
    if(loading) loading.style.display = 'none';

    // Desenha os produtos na tela
    renderizarMenu('todos');

}, (error) => {
    console.error("Erro ao buscar cardápio:", error);
});

// ==============================================================
// 4. FUNÇÕES VISUAIS (Renderizar Menu)
// ==============================================================
window.renderizarMenu = function(filtro = 'todos') {
    const container = document.getElementById('itens-cardapio');
    if (!container) return; 

    container.innerHTML = '';

    const lista = filtro === 'todos' ? menuGlobal : menuGlobal.filter(p => p.categoria === filtro);

    if (lista.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#666;">Nenhum item nesta categoria.</div>';
        return;
    }

    lista.forEach(item => {
        const img = item.imagem ? item.imagem : "https://via.placeholder.com/150";
        const desc = item.descricao ? item.descricao : ''; 
        
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
        atualizarInterface();
    }
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

    // Atualiza barra inferior da Home
    if(labelQtd && labelTotal) {
        labelQtd.innerText = `${qtd} Produtos`;
        labelTotal.innerText = totalFormatado;
    }

    // Atualiza Header do Carrinho
    if(labelTotalSacola && labelQtdSacola) {
        labelTotalSacola.innerText = totalFormatado;
        labelQtdSacola.innerText = `${qtd} itens na sacola`;
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    if(containerCarrinho) {
        renderizarListaCarrinho(containerCarrinho);
    }
}
const obs = document.getElementById('obs-pedido').value;

// ... dentro do objeto pedido ...
const pedido = {
    // ... outros dados ...
    observacao: obs, // Adicione essa linha
    // ...
};
// Desenha a lista dentro da página carrinho.html
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
        if (item.quantidade <= 0) {
            removerItem(id);
        } else {
            atualizarInterface();
        }
    }
}

window.removerItem = function(id) {
    if(confirm("Tirar este item da sacola?")) {
        carrinho = carrinho.filter(item => item.id != id);
        atualizarInterface();
    }
}

// Utilitários de Mensagem
function msgSucesso(texto) {
    Toastify({
        text: texto, duration: 3000, gravity: "top", position: "center",
        style: { background: "#00C851", borderRadius: "10px", fontWeight: "bold" }
    }).showToast();
}
// ==============================================================
// 7. CONTROLE DE HORÁRIO DE FUNCIONAMENTO
// ==============================================================
function verificarHorario() {
    const agora = new Date();
    const hora = agora.getHours();
    const dia = agora.getDay(); // 0 = Domingo, 1 = Segunda...

    // ⚙️ CONFIGURAÇÃO: Mude seus horários aqui
    const horarioAbertura = 16; // 16:00
    const horarioFechamento = 23; // 23:00 (Para meia-noite use 24)

    // Lógica simples: Está entre 16h e 23h?
    let estaAberto = false;
    if (hora >= horarioAbertura && hora < horarioFechamento) {
        estaAberto = true;
    }

    // Atualiza a tela
    const badge = document.querySelector('.status-badge');
    const botoes = document.querySelectorAll('.btn-add');

    if (badge) {
        if (estaAberto) {
            badge.innerHTML = '<span class="pulsar"></span> Estamos Abertos';
            badge.style.background = '#e6f4ea';
            badge.style.color = '#00C851';
            badge.style.borderColor = '#00C851';
            
            // Libera os botões
            botoes.forEach(btn => {
                btn.disabled = false;
                btn.innerText = 'Adicionar';
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            });
        } else {
            badge.innerHTML = '<span class="pulsar" style="background:red"></span> Fechado Agora';
            badge.style.background = '#ffebee';
            badge.style.color = '#ff4444';
            badge.style.borderColor = '#ff4444';

            // Bloqueia os botões
            botoes.forEach(btn => {
                btn.disabled = true;
                btn.innerText = 'Fechado';
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            });
        }
    }
}

// Verifica assim que carrega e atualiza a cada minuto
setInterval(verificarHorario, 60000); 
// Precisamos chamar depois que o menu carregar, então vamos adicionar no renderizarMenu também
const originalRender = window.renderizarMenu;
window.renderizarMenu = function(filtro) {
    originalRender(filtro); // Chama a função original
    setTimeout(verificarHorario, 100); // Verifica o horário logo depois
};
// Inicia
atualizarInterface();