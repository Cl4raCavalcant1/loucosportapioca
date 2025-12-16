// --- CONFIGURAÇÃO DA LOJA ---
const phoneStore = '5581991243260'; // Seu WhatsApp
const horarioFuncionamento = { inicio: 10, fim: 23 }; // Horário
const TAXA_ENTREGA = 5.00;

// --- DADOS DOS PRODUTOS ---
const produtos = [
  // MAIS PEDIDOS
  {
    id: 1,
    categoria: 'mais_pedidos',
    nome: 'Tapioca de Charque',
    descricao: 'Charque desfiada acebolada com queijo coalho.',
    preco: 13.50,
    img: 'https://images.unsplash.com/photo-1604908177522-0409c6d10c88?w=500&q=80'
  },
  {
    id: 2,
    categoria: 'mais_pedidos',
    nome: 'Tapioca de Frango',
    descricao: 'Frango cremoso com catupiry original.',
    preco: 12.50,
    img: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&q=80'
  },
  
  // PRATOS
  {
    id: 3,
    categoria: 'pratos',
    nome: 'Pão com Ovo',
    descricao: 'Pão carioca fresquinho com ovos mexidos.',
    preco: 11.00,
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80'
  },
  {
    id: 4,
    categoria: 'pratos',
    nome: 'Cuscuz Completo',
    descricao: 'Cuscuz nordestino, carne de sol e queijo.',
    preco: 15.00,
    img: 'https://images.unsplash.com/photo-1586548480309-34b8c0a87754?w=500&q=80'
  },

  // BEBIDAS
  {
    id: 5,
    categoria: 'bebidas',
    nome: 'Coca-Cola Lata',
    descricao: '350ml, bem gelada.',
    preco: 6.00,
    img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80'
  },
  {
    id: 6,
    categoria: 'bebidas',
    nome: 'Suco de Laranja',
    descricao: 'Natural da fruta, 500ml.',
    preco: 8.00,
    img: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&q=80'
  }
];

// --- ESTADO GLOBAL ---
let carrinho = [];
let categoriaAtual = 'mais_pedidos';
let lojaAberta = true;
let termoBusca = '';

// --- INICIALIZAÇÃO ---
window.onload = function() {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  
  verificarHorario();
  injetarBarraPesquisa();
  carregarCarrinho();
  configurarAbas();
  renderProdutos();
  injetarModalCarrinho(); // Cria a estrutura do carrinho (agora corrigida)
};

// --- NAVEGAÇÃO E EXIBIÇÃO ---
function configurarAbas() {
  const botoes = document.querySelectorAll('nav button');
  const categorias = ['mais_pedidos', 'pratos', 'bebidas'];

  botoes.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      botoes.forEach(b => {
        b.className = 'text-gray-400 font-medium hover:text-brand-brown pb-2 px-2 transition-colors';
      });
      btn.className = 'text-brand-brown font-bold border-b-2 border-brand-yellow pb-2 px-2 transition-colors';
      
      categoriaAtual = categorias[index];
      termoBusca = '';
      const inputBusca = document.getElementById('input-busca');
      if(inputBusca) inputBusca.value = '';
      renderProdutos();
    });
  });
}

function injetarBarraPesquisa() {
  const nav = document.querySelector('nav');
  if (!nav) return; // Segurança
  
  const divBusca = document.createElement('div');
  divBusca.className = 'max-w-md mx-auto px-4 mt-4 mb-2';
  divBusca.innerHTML = `
    <div class="relative">
      <input type="text" id="input-busca" placeholder="O que você procura hoje?" 
        class="w-full pl-10 pr-4 py-3 rounded-full bg-white border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent text-sm"
        onkeyup="filtrarProdutos(this.value)">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  `;
  nav.parentNode.insertBefore(divBusca, nav);
}

function filtrarProdutos(valor) {
  termoBusca = valor.toLowerCase();
  renderProdutos();
}

function renderProdutos() {
  const container = document.getElementById('produtos-lista');
  if (!container) return;
  
  container.innerHTML = '';
  
  let produtosFiltrados = produtos.filter(p => {
    const correspondeCategoria = termoBusca ? true : p.categoria === categoriaAtual;
    const correspondeBusca = p.nome.toLowerCase().includes(termoBusca) || p.descricao.toLowerCase().includes(termoBusca);
    return correspondeCategoria && correspondeBusca;
  });

  if (produtosFiltrados.length === 0) {
    container.innerHTML = `
      <div class="text-center text-gray-400 mt-10 flex flex-col items-center">
        <p>Nenhum produto encontrado.</p>
        ${termoBusca ? '<button onclick="limparBusca()" class="text-brand-brown underline text-sm mt-2">Limpar busca</button>' : ''}
      </div>`;
    return;
  }

  produtosFiltrados.forEach(produto => {
    const disabledAttr = !lojaAberta ? 'disabled' : '';
    const btnClass = lojaAberta 
      ? 'bg-brand-yellow hover:bg-yellow-500 text-white active:scale-95' 
      : 'bg-gray-300 text-gray-500 cursor-not-allowed';
    const btnText = lojaAberta ? 'Adicionar' : 'Fechado';

    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-md overflow-hidden flex flex-col sm:flex-row fade-in border border-gray-100 mb-4';
    
    card.innerHTML = `
      <div class="sm:w-32 h-48 sm:h-auto relative group">
        <img src="${produto.img}" alt="${produto.nome}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale-0 ${!lojaAberta ? 'grayscale' : ''}">
      </div>
      <div class="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-start mb-1">
            <h3 class="font-bold text-lg text-gray-800">${produto.nome}</h3>
            <span class="font-bold text-brand-brown">${formatarMoeda(produto.preco)}</span>
          </div>
          <p class="text-xs text-gray-500 mb-3">${produto.descricao}</p>
        </div>

        <div class="mt-2">
          <input type="text" id="obs-${produto.id}" placeholder="Observação? (Ex: s/ cebola)" ${disabledAttr}
            class="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all disabled:bg-gray-100">
          
          <button onclick="adicionarAoCarrinho(${produto.id})" ${disabledAttr}
            class="w-full font-bold py-2 px-4 rounded-lg shadow-sm transition-all flex justify-center items-center gap-2 ${btnClass}">
            ${btnText}
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function limparBusca() {
  termoBusca = '';
  const input = document.getElementById('input-busca');
  if(input) input.value = '';
  renderProdutos();
}

// --- LÓGICA DO CARRINHO ---
function adicionarAoCarrinho(id) {
  if (!lojaAberta) {
    mostrarToast('A loja está fechada no momento!', true);
    return;
  }

  const produto = produtos.find(p => p.id === id);
  const obsInput = document.getElementById(`obs-${id}`);
  const observacao = obsInput.value.trim();

  carrinho.push({
    ...produto,
    observacao: observacao,
    uniqueId: Date.now()
  });

  obsInput.value = ''; 
  salvarCarrinho();
  mostrarToast(`+1 ${produto.nome}`);
}

function removerDoCarrinho(uniqueId) {
  carrinho = carrinho.filter(item => item.uniqueId !== uniqueId);
  salvarCarrinho();
  renderizarItensModal(); 
}

function limparCarrinho() {
  if(confirm('Tem certeza que deseja limpar todo o carrinho?')) {
    carrinho = [];
    salvarCarrinho();
    fecharModal();
    mostrarToast('Carrinho limpo!');
  }
}

function salvarCarrinho() {
  localStorage.setItem('carrinho_tapioca', JSON.stringify(carrinho));
  atualizarCarrinhoUI();
}

function carregarCarrinho() {
  const salvo = localStorage.getItem('carrinho_tapioca');
  if (salvo) {
    carrinho = JSON.parse(salvo);
    atualizarCarrinhoUI();
  }
}

function atualizarCarrinhoUI() {
  const total = carrinho.reduce((acc, item) => acc + item.preco, 0);
  const qtd = carrinho.length;

  const totalDisplay = document.getElementById('total-display');
  const qtdDisplay = document.getElementById('qtd-display');
  const cartBar = document.getElementById('cart-bar');

  if (totalDisplay) totalDisplay.innerText = formatarMoeda(total);
  if (qtdDisplay) qtdDisplay.innerText = `${qtd} ${qtd === 1 ? 'item' : 'itens'}`;

  if (cartBar) {
    cartBar.classList.add('bg-yellow-50');
    setTimeout(() => cartBar.classList.remove('bg-yellow-50'), 200);
  }
}

// --- MODAL, CHECKOUT E LÓGICA FINANCEIRA ---

function agruparItensCarrinho() {
  const grupos = {};
  carrinho.forEach(item => {
    const chave = `${item.id}-${item.observacao || ''}`;
    if (!grupos[chave]) {
      grupos[chave] = {
        ...item,
        quantidade: 0,
        idsRemocao: [] 
      };
    }
    grupos[chave].quantidade += 1;
    grupos[chave].idsRemocao.push(item.uniqueId);
  });
  return Object.values(grupos);
}

function salvarDadosCliente() {
  const nomeInput = document.getElementById('cliente-nome');
  const endInput = document.getElementById('cliente-endereco');
  if(nomeInput && nomeInput.value) localStorage.setItem('cliente_nome', nomeInput.value);
  if(endInput && endInput.value) localStorage.setItem('cliente_endereco', endInput.value);
}

function preencherDadosCliente() {
  const nomeSalvo = localStorage.getItem('cliente_nome');
  const enderecoSalvo = localStorage.getItem('cliente_endereco');
  const nomeInput = document.getElementById('cliente-nome');
  const endInput = document.getElementById('cliente-endereco');
  
  if (nomeSalvo && nomeInput) nomeInput.value = nomeSalvo;
  if (enderecoSalvo && endInput) endInput.value = enderecoSalvo;
}

window.atualizarModalState = function() {
  const tipoEntregaEl = document.querySelector('input[name="tipoEntrega"]:checked');
  const formaPagamentoEl = document.getElementById('cliente-pagamento');
  
  if(!tipoEntregaEl || !formaPagamentoEl) return;

  const tipoEntrega = tipoEntregaEl.value;
  const formaPagamento = formaPagamentoEl.value;
  
  const divEndereco = document.getElementById('div-endereco');
  const divTroco = document.getElementById('div-troco');
  
  if (tipoEntrega === 'Entrega') {
    divEndereco.classList.remove('hidden');
  } else {
    divEndereco.classList.add('hidden');
  }

  if (formaPagamento === 'Dinheiro') {
    divTroco.classList.remove('hidden');
  } else {
    divTroco.classList.add('hidden');
  }

  atualizarTotaisModal();
}

function atualizarTotaisModal() {
  const subtotal = carrinho.reduce((acc, item) => acc + item.preco, 0);
  const tipoEntregaEl = document.querySelector('input[name="tipoEntrega"]:checked');
  if(!tipoEntregaEl) return;

  const tipoEntrega = tipoEntregaEl.value;
  
  const spanSubtotal = document.getElementById('resumo-subtotal');
  const divTaxa = document.getElementById('resumo-taxa');
  const spanTotalFinal = document.getElementById('resumo-total-final');

  if (!spanSubtotal) return;

  let totalFinal = subtotal;

  spanSubtotal.innerText = formatarMoeda(subtotal);

  if (tipoEntrega === 'Entrega') {
    divTaxa.classList.remove('hidden');
    divTaxa.querySelector('span:last-child').innerText = formatarMoeda(TAXA_ENTREGA);
    totalFinal += TAXA_ENTREGA;
  } else {
    divTaxa.classList.add('hidden');
  }

  spanTotalFinal.innerText = formatarMoeda(totalFinal);
}

// INJETAR MODAL CORRIGIDO
function injetarModalCarrinho() {
  // Evita criar modal duplicado se já existir
  if (document.getElementById('modal-carrinho')) return;

  const modalHTML = `
    <div id="modal-carrinho" class="fixed inset-0 z-[60] hidden font-sans">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onclick="fecharModal()"></div>
      
      <div class="absolute bottom-0 sm:top-1/2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[450px] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col h-[90vh] sm:h-auto sm:max-h-[90vh]">
        
        <!-- Cabeçalho (Fixo) -->
        <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl flex-none">
          <h2 class="font-bold text-lg text-gray-800">Seu Pedido</h2>
          <div class="flex gap-2">
            <button onclick="limparCarrinho()" class="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors" title="Limpar tudo">Limpar</button>
            <button onclick="fecharModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 font-bold transition-colors">✕</button>
          </div>
        </div>

        <!-- Lista de Itens (Flexível - Ocupa o espaço que sobra) -->
        <div id="modal-lista-itens" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
          <!-- JS injeta itens aqui -->
        </div>

        <!-- Formulário (Fixo no fundo - flex-none para não sumir) -->
        <div class="flex-none p-4 bg-white border-t border-gray-100 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-10 overflow-y-auto max-h-[50vh]">
          <div class="space-y-3 mb-4">
            
            <!-- Tipo Entrega -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo de Entrega</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer border border-gray-200 p-2 rounded-lg flex-1 hover:bg-gray-50 has-[:checked]:border-brand-yellow has-[:checked]:bg-yellow-50 transition-colors">
                  <input type="radio" name="tipoEntrega" value="Entrega" checked onchange="atualizarModalState()" class="accent-brand-yellow">
                  <span class="text-sm font-medium">🛵 Entrega</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer border border-gray-200 p-2 rounded-lg flex-1 hover:bg-gray-50 has-[:checked]:border-brand-yellow has-[:checked]:bg-yellow-50 transition-colors">
                  <input type="radio" name="tipoEntrega" value="Retirada" onchange="atualizarModalState()" class="accent-brand-yellow">
                  <span class="text-sm font-medium">🛍️ Retirada</span>
                </label>
              </div>
            </div>

            <!-- Nome (SEMPRE VISÍVEL) -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Seu Nome *</label>
              <input type="text" id="cliente-nome" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow" placeholder="Digite seu nome">
            </div>

            <!-- Endereço (Condicional) -->
            <div id="div-endereco">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Endereço de Entrega *</label>
              <input type="text" id="cliente-endereco" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow" placeholder="Rua, Número, Bairro...">
            </div>

            <!-- Pagamento e Troco -->
            <div class="flex gap-3">
              <div class="flex-1">
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Pagamento *</label>
                <select id="cliente-pagamento" onchange="atualizarModalState()" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow appearance-none cursor-pointer">
                  <option value="Pix">📱 Pix</option>
                  <option value="Cartão">💳 Cartão</option>
                  <option value="Dinheiro">💵 Dinheiro</option>
                </select>
              </div>
              
              <div id="div-troco" class="hidden w-1/3">
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Troco p/</label>
                <input type="text" id="cliente-troco" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow" placeholder="R$ 50">
              </div>
            </div>
          </div>

          <!-- Resumo Financeiro -->
          <div class="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 text-sm space-y-1">
            <div class="flex justify-between text-gray-500">
              <span>Subtotal:</span>
              <span id="resumo-subtotal">R$ 0,00</span>
            </div>
            <div id="resumo-taxa" class="flex justify-between text-gray-500">
              <span>Taxa de Entrega:</span>
              <span>R$ 0,00</span>
            </div>
            <div class="flex justify-between font-bold text-brand-brown text-base pt-1 border-t border-gray-200 mt-1">
              <span>Total Final:</span>
              <span id="resumo-total-final">R$ 0,00</span>
            </div>
          </div>
          
          <button onclick="enviarWhatsApp()" class="w-full bg-brand-green hover:bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-500/20 flex justify-center items-center gap-2 transition-all active:scale-95">
            <span>Enviar Pedido no Zap</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function finalizarPedido() {
  if (carrinho.length === 0) {
    mostrarToast('Seu carrinho está vazio!', true);
    return;
  }
  
  const modal = document.getElementById('modal-carrinho');
  if(modal) {
    modal.classList.remove('hidden');
    renderizarItensModal();
    preencherDadosCliente();
    atualizarModalState();
  } else {
    // Caso de emergência: recria o modal se ele sumiu
    injetarModalCarrinho();
    finalizarPedido();
  }
}

function fecharModal() {
  const modal = document.getElementById('modal-carrinho');
  if(modal) modal.classList.add('hidden');
}

function renderizarItensModal() {
  const container = document.getElementById('modal-lista-itens');
  if(!container) return;

  if(carrinho.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-40 text-gray-400">
        <p>Seu carrinho está vazio 😢</p>
        <button onclick="fecharModal()" class="text-brand-brown text-sm font-bold mt-2 underline">Voltar ao cardápio</button>
      </div>`;
    atualizarTotaisModal();
    return;
  }

  const itensAgrupados = agruparItensCarrinho();
  
  let html = '';
  itensAgrupados.forEach(grupo => {
    const idParaRemover = grupo.idsRemocao[grupo.idsRemocao.length - 1];
    
    html += `
      <div class="flex justify-between items-start bg-white p-3 rounded-lg border border-gray-100 shadow-sm relative pr-8">
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded">${grupo.quantidade}x</span>
            <h4 class="font-bold text-sm text-gray-800">${grupo.nome}</h4>
          </div>
          ${grupo.observacao ? `<p class="text-xs text-brand-yellow font-medium mt-0.5 ml-8">📝 ${grupo.observacao}</p>` : ''}
          <p class="text-xs text-gray-500 mt-1 ml-8">${formatarMoeda(grupo.preco * grupo.quantidade)}</p>
        </div>
        <button onclick="removerDoCarrinho(${idParaRemover})" class="absolute top-3 right-2 text-gray-300 hover:text-red-500 p-1 transition-colors" title="Remover 1 unidade">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
  atualizarTotaisModal();
}

function enviarWhatsApp() {
  const nomeEl = document.getElementById('cliente-nome');
  const pagEl = document.getElementById('cliente-pagamento');
  const tipoEntregaEl = document.querySelector('input[name="tipoEntrega"]:checked');
  const endEl = document.getElementById('cliente-endereco');
  const trocoEl = document.getElementById('cliente-troco');

  if(!nomeEl || !pagEl || !tipoEntregaEl) return;

  const nome = nomeEl.value.trim();
  const pagamento = pagEl.value;
  const tipoEntrega = tipoEntregaEl.value;
  const endereco = endEl ? endEl.value.trim() : '';
  const troco = trocoEl ? trocoEl.value.trim() : '';

  if (!nome) { alert('Informe seu Nome!'); return; }
  if (tipoEntrega === 'Entrega' && !endereco) { alert('Informe o Endereço!'); return; }
  if (pagamento === 'Dinheiro' && !troco) { alert('Informe para quanto é o troco!'); return; }

  salvarDadosCliente(); 

  let mensagem = `🍽 *PEDIDO - LOUCOS POR TAPIOCA*\n`;
  mensagem += `--------------------------------\n`;

  const itensAgrupados = agruparItensCarrinho();
  let subtotal = 0;

  itensAgrupados.forEach(grupo => {
    const totalItem = grupo.preco * grupo.quantidade;
    subtotal += totalItem;
    
    mensagem += `*${grupo.quantidade}x ${grupo.nome}*\n`;
    if (grupo.observacao) mensagem += `   📝 _${grupo.observacao}_\n`;
    mensagem += `   💲 ${formatarMoeda(totalItem)}\n`;
  });

  let totalFinal = subtotal;
  mensagem += `--------------------------------\n`;
  mensagem += `🛒 Subtotal: ${formatarMoeda(subtotal)}\n`;
  
  if (tipoEntrega === 'Entrega') {
    mensagem += `🛵 Taxa Entrega: ${formatarMoeda(TAXA_ENTREGA)}\n`;
    totalFinal += TAXA_ENTREGA;
  }
  
  mensagem += `💰 *TOTAL FINAL: ${formatarMoeda(totalFinal)}*\n\n`;
  mensagem += `👤 *Cliente:* ${nome}\n`;
  
  if (tipoEntrega === 'Entrega') {
    mensagem += `📍 *Entrega:* ${endereco}\n`;
  } else {
    mensagem += `🛍️ *Retirada no Balcão*\n`;
  }
  
  mensagem += `💳 *Pagamento:* ${pagamento}\n`;
  if (pagamento === 'Dinheiro') {
    mensagem += `💵 *Troco para:* ${troco}\n`;
  }

  const url = `https://wa.me/${phoneStore}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
}

// --- UTILITÁRIOS ---
function mostrarToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast) return;

  toastMsg.innerText = msg;
  toast.className = `fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-xl z-[70] transition-all duration-300 flex items-center gap-2 ${isError ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'}`;

  toast.classList.remove('opacity-0', 'translate-y-[-20px]', 'pointer-events-none');
  
  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-[-20px]', 'pointer-events-none');
  }, 3000);
}

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function verificarHorario() {
  const agora = new Date();
  const hora = agora.getHours();
  if (hora < horarioFuncionamento.inicio || hora >= horarioFuncionamento.fim) {
    lojaAberta = false;
    mostrarToast(`Loja Fechada! Horário: ${horarioFuncionamento.inicio}h às ${horarioFuncionamento.fim}h`, true);
  } else {
    lojaAberta = true;
  }
}