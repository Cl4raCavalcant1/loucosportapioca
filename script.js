const firebaseConfig = {
    apiKey: "AlzaSyBp32ijeLw2LvNwKur5EaUj7B9WZ1G-AW0",
    authDomain: "loucosportapioca-57964.firebaseapp.com",
    projectId: "loucosportapioca-57964",
    storageBucket: "loucosportapioca-57964.firebasestorage.app",
    messagingSenderId: "371332659198",
    appId: "1:371332659198:web:330626357653acc00772af"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let menuGlobal = [];

function obterPreco(item) {
    const promoValida = item.emPromocao && Number(item.precoPromocional) > 0 && Number(item.precoPromocional) < Number(item.preco);
    return promoValida ? Number(item.precoPromocional) : Number(item.preco || 0);
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

db.collection("produtos").onSnapshot((querySnapshot) => {
    menuGlobal = [];
    const container = document.getElementById('itens-cardapio');
    const loading = document.querySelector('.loading-area');

    if (querySnapshot.empty) {
        if (container) container.innerHTML = '<p style="text-align:center; padding:40px; color:#666;">Nenhum produto cadastrado.</p>';
        if (loading) loading.style.display = 'none';
        return;
    }

    querySnapshot.forEach((doc) => {
        const item = doc.data();
        item.id = doc.id;
        menuGlobal.push(item);
    });

    if (loading) loading.style.display = 'none';
    renderizarMenu('todos');
}, (error) => console.error("Erro ao buscar cardápio:", error));

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
        const precoBase = Number(item.preco || 0);
        const precoFinal = obterPreco(item);
        const emPromo = precoFinal < precoBase;
        const badges = [
            item.pratoDoDia ? '<span style="background:#5A3E34;color:#fff;padding:4px 8px;border-radius:999px;font-size:11px;font-weight:700;">Prato do dia</span>' : '',
            item.descontoSemana ? '<span style="background:#00C851;color:#fff;padding:4px 8px;border-radius:999px;font-size:11px;font-weight:700;">Desconto da semana</span>' : '',
        ].join(' ');

        container.innerHTML += `
            <div class="card-produto">
                <div class="img-wrapper">
                    <img src="${img}" alt="${item.nome}" loading="lazy">
                </div>
                <div class="info-wrapper">
                    <div>
                        <h3>${item.nome}</h3>
                        <p class="desc">${desc}</p>
                        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">${badges}</div>
                    </div>
                    <div>
                        ${
                            emPromo
                            ? `<p class="price" style="margin-bottom:2px;"><span style="text-decoration:line-through;opacity:.6;font-size:14px;">${formatarMoeda(precoBase)}</span><br><strong>${formatarMoeda(precoFinal)}</strong></p>`
                            : `<p class="price">${formatarMoeda(precoFinal)}</p>`
                        }
                        <button class="btn-add" onclick="adicionarAoCarrinho('${item.id}')">Adicionar</button>
                    </div>
                </div>
            </div>
        `;
    });
};

window.adicionarAoCarrinho = function(id) {
    const produto = menuGlobal.find(p => p.id == id);
    if (!produto) return;

    const precoAplicado = obterPreco(produto);
    const itemNoCarrinho = carrinho.find(item => item.id == id);

    if (itemNoCarrinho) {
        itemNoCarrinho.quantidade = Number(itemNoCarrinho.quantidade) + 1;
        itemNoCarrinho.preco = precoAplicado;
        msgSucesso(`+1 ${produto.nome}`);
    } else {
        carrinho.push({ ...produto, preco: precoAplicado, quantidade: 1 });
        msgSucesso(`${produto.nome} na sacola!`);
    }
    atualizarInterface();
};

function atualizarInterface() {
    const labelQtd = document.querySelector('.qtd-itens');
    const labelTotal = document.querySelector('.total-valor');
    const labelTotalSacola = document.querySelector('.valor-sacola');
    const labelQtdSacola = document.querySelector('.texto-sacola');
    const containerCarrinho = document.getElementById('lista-carrinho');
    const resumoCarrinho = document.getElementById('resumo-carrinho');

    let qtd = 0;
    let total = 0;

    carrinho.forEach(item => {
        const quantidade = Number(item.quantidade) || 1;
        const preco = Number(item.preco) || 0;
        qtd += quantidade;
        total += preco * quantidade;
    });

    const totalFormatado = formatarMoeda(total);

    if (labelQtd && labelTotal) {
        labelQtd.innerText = `${qtd} Produtos`;
        labelTotal.innerText = totalFormatado;
    }

    if (labelTotalSacola && labelQtdSacola) {
        labelTotalSacola.innerText = totalFormatado;
        labelQtdSacola.innerText = `${qtd} itens na sacola`;
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    if (containerCarrinho) renderizarListaCarrinho(containerCarrinho);
    if (resumoCarrinho) resumoCarrinho.innerHTML = `
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-top:1px solid #eee;">
            <strong>Total</strong><strong>${totalFormatado}</strong>
        </div>
    `;
}

function renderizarListaCarrinho(container) {
    container.innerHTML = '';

    if (carrinho.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:50px; color:#666;"><i class="fa-solid fa-basket-shopping" style="font-size:40px; margin-bottom:10px;"></i><p>Sua sacola está vazia.</p></div>';
        return;
    }

    carrinho.forEach(item => {
        const img = item.imagem || "https://via.placeholder.com/150";
        const subtotal = (Number(item.preco) || 0) * (Number(item.quantidade) || 1);

        container.innerHTML += `
            <div class="card-carrinho">
                <div class="img-carrinho"><img src="${img}" alt="${item.nome}"></div>
                <div class="info-carrinho">
                    <div>
                        <h3>${item.nome}</h3>
                        <p class="price">${formatarMoeda(item.preco)}</p>
                        <small style="opacity:.85;">Subtotal: ${formatarMoeda(subtotal)}</small>
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
    if (!item) return;
    item.quantidade += mudanca;
    if (item.quantidade <= 0) {
        carrinho = carrinho.filter(i => i.id != id);
    }
    atualizarInterface();
};

window.removerItem = function(id) {
    if (confirm("Tirar este item da sacola?")) {
        carrinho = carrinho.filter(item => item.id != id);
        atualizarInterface();
    }
};

window.limparCarrinho = function() {
    if (confirm("Limpar toda a sacola?")) {
        carrinho = [];
        localStorage.removeItem('carrinho');
        atualizarInterface();
    }
};

function msgSucesso(texto) {
    if (typeof Toastify !== 'undefined') {
        Toastify({
            text: texto,
            duration: 2500,
            gravity: "top",
            position: "center",
            style: { background: "#00C851", borderRadius: "10px", fontWeight: "bold" }
        }).showToast();
    }
}

atualizarInterface();
