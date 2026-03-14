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

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function obterPrecoAplicado(produto) {
    const preco = Number(produto.preco || 0);
    const promo = Number(produto.precoPromocional || 0);
    if (produto.emPromocao && promo > 0 && promo < preco) {
        return promo;
    }
    return preco;
}

function montarItemCarrinho(produto) {
    return {
        ...produto,
        precoBase: Number(produto.preco || 0),
        precoPromocional: produto.precoPromocional ? Number(produto.precoPromocional) : null,
        emPromocao: !!produto.emPromocao,
        pratoDoDia: !!produto.pratoDoDia,
        descontoSemana: !!produto.descontoSemana,
        preco: obterPrecoAplicado(produto),
        quantidade: 1
    };
}

function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function atualizarResumoCarrinho(total, qtd) {
    const subtotalEl = document.getElementById('subtotal-carrinho');
    const totalEl = document.getElementById('total-carrinho');
    const qtdEl = document.getElementById('itens-carrinho-resumo');
    const btnProsseguir = document.querySelector('.btn-prosseguir');

    if (subtotalEl) subtotalEl.innerText = formatarMoeda(total);
    if (totalEl) totalEl.innerText = formatarMoeda(total);
    if (qtdEl) qtdEl.innerText = `${qtd} item(ns)`;
    if (btnProsseguir) {
        if (qtd === 0) {
            btnProsseguir.classList.add('desabilitado');
            btnProsseguir.setAttribute('aria-disabled', 'true');
        } else {
            btnProsseguir.classList.remove('desabilitado');
            btnProsseguir.removeAttribute('aria-disabled');
        }
    }
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
}, (error) => {
    console.error("Erro ao buscar cardápio:", error);
});

window.renderizarMenu = function(filtro = 'todos') {
    const container = document.getElementById('itens-cardapio');
    if (!container) return;

    container.innerHTML = '';

    const listaBase = filtro === 'todos' ? menuGlobal : menuGlobal.filter(p => p.categoria === filtro);
    const lista = [...listaBase].sort((a, b) => Number(!!b.pratoDoDia) - Number(!!a.pratoDoDia));

    if (lista.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#666;">Nenhum item nesta categoria.</div>';
        return;
    }

    lista.forEach(item => {
        const img = item.imagem ? item.imagem : "https://via.placeholder.com/150";
        const desc = item.descricao ? item.descricao : '';
        const emPromocao = item.emPromocao && Number(item.precoPromocional) > 0 && Number(item.precoPromocional) < Number(item.preco);
        const blocoPreco = emPromocao
            ? `<div class="box-preco"><span class="price-old">${formatarMoeda(item.preco)}</span><p class="price promo">${formatarMoeda(item.precoPromocional)}</p></div>`
            : `<p class="price">${formatarMoeda(item.preco)}</p>`;

        const badges = [];
        if (item.pratoDoDia) badges.push('<span class="badge-extra-card badge-dia">Prato do dia</span>');
        if (item.descontoSemana) badges.push('<span class="badge-extra-card badge-semana">Desconto da semana</span>');
        if (emPromocao) badges.push('<span class="badge-extra-card badge-promo-card">Promoção</span>');
        const badgesHtml = badges.length ? `<div class="badges-produto">${badges.join('')}</div>` : '';
        
        container.innerHTML += `
            <div class="card-produto ${item.pratoDoDia ? 'card-destaque' : ''}">
                <div class="img-wrapper">
                    <img src="${img}" alt="${item.nome}" loading="lazy">
                </div>
                <div class="info-wrapper">
                    <div>
                        ${badgesHtml}
                        <h3>${item.nome}</h3>
                        <p class="desc">${desc}</p>
                    </div>
                    <div>
                        ${blocoPreco}
                        <button class="btn-add" onclick="adicionarAoCarrinho('${item.id}')">
                            Adicionar
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

window.adicionarAoCarrinho = function(id) {
    const produto = menuGlobal.find(p => p.id == id);

    if (produto) {
        const itemNoCarrinho = carrinho.find(item => item.id == id);
        
        if (itemNoCarrinho) {
            itemNoCarrinho.quantidade = Number(itemNoCarrinho.quantidade) + 1;
            msgSucesso(`+1 ${produto.nome}`);
        } else {
            carrinho.push(montarItemCarrinho(produto));
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

    atualizarResumoCarrinho(total, qtd);
    salvarCarrinho();

    if (containerCarrinho) {
        renderizarListaCarrinho(containerCarrinho);
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
        const emPromocao = item.emPromocao && Number(item.precoPromocional) > 0 && Number(item.precoPromocional) < Number(item.precoBase || item.preco);
        const subtotalItem = (Number(item.preco) || 0) * (Number(item.quantidade) || 1);
        const precoHtml = emPromocao
            ? `<p class="price"><span style="text-decoration:line-through; opacity:.7; font-size:13px; margin-right:6px;">${formatarMoeda(item.precoBase)}</span>${formatarMoeda(item.preco)}</p>`
            : `<p class="price">${formatarMoeda(item.preco)}</p>`;
        
        container.innerHTML += `
            <div class="card-carrinho">
                <div class="img-carrinho"><img src="${img}" alt="${item.nome}"></div>
                <div class="info-carrinho">
                    <div>
                        <h3>${item.nome}</h3>
                        ${precoHtml}
                        <div class="subtotal-item">Subtotal: ${formatarMoeda(subtotalItem)}</div>
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
    if (confirm("Tirar este item da sacola?")) {
        carrinho = carrinho.filter(item => item.id != id);
        atualizarInterface();
    }
}

window.limparCarrinho = function() {
    if (!carrinho.length) return;
    if (confirm('Limpar toda a sacola?')) {
        carrinho = [];
        atualizarInterface();
        msgSucesso('Sacola limpa com sucesso!');
    }
}

function msgSucesso(texto) {
    if (typeof Toastify === 'function') {
        Toastify({
            text: texto, duration: 3000, gravity: "top", position: "center",
            style: { background: "#00C851", borderRadius: "10px", fontWeight: "bold" }
        }).showToast();
    }
}

atualizarInterface();

function verificarHorario() {
    const agora = new Date();
    const hora = agora.getHours();
    const horarioAbertura = 16;
    const horarioFechamento = 23;

    const estaAberto = hora >= horarioAbertura && hora < horarioFechamento;
    const badge = document.querySelector('.status-badge');
    const botoes = document.querySelectorAll('.btn-add');

    if (badge) {
        if (estaAberto) {
            badge.innerHTML = '<span class="pulsar"></span> Estamos Abertos';
            badge.style.background = '#e6f4ea';
            badge.style.color = '#00C851';
            badge.style.borderColor = '#00C851';
            
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

            botoes.forEach(btn => {
                btn.disabled = true;
                btn.innerText = 'Fechado';
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            });
        }
    }
}

setInterval(verificarHorario, 60000);
const originalRender = window.renderizarMenu;
window.renderizarMenu = function(filtro) {
    originalRender(filtro);
    setTimeout(verificarHorario, 100);
};
