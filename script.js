// --- CONFIGURAÇÃO DA LOJA ---
const phoneStore = '5581999999999'; // Seu WhatsApp
const horarioFuncionamento = { inicio: 10, fim: 23 }; // Horário de abertura/fechamento
const TAXA_ENTREGA = 5.00; // Valor da taxa de entrega

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
let lojaAberta = true; // Controle de estado da loja

// --- INICIALIZAÇÃO ---
window.onload = function() {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  
  verificarHorario(); // Verifica primeiro para bloquear botões se necessário
  carregarCarrinho();
  configurarAbas();
  renderProdutos();
  injetarModalCarrinho();
};

// --- NAVEGAÇÃO E EXIBIÇÃO ---
function configurarAbas() {
  const botoes = document.querySelectorAll('nav button');
  const categorias = ['mais_pedidos', 'pratos', 'bebidas'];

  botoes.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      // Remove classe ativa de todos
      botoes.forEach(b => {
        b.className = 'text-gray-400 font-medium hover:text-brand-brown pb-2 px-2 transition-colors';
      });
      // Adiciona classe ativa no clicado
      btn.className = 'text-brand-brown font-bold border-b-2 border-brand-yellow pb-2 px-2 transition-colors';
      
      categoriaAtual = categorias[index];
      renderProdutos();
    });
  });
}

function renderProdutos() {
  const container = document.getElementById('produtos-lista');
  if (!container) return;
  
  container.innerHTML = '';
  const produtosFiltrados = produtos.filter(p => p.categoria === categoriaAtual);

  if (produtosFiltrados.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-400 mt-10">Nenhum produto nesta categoria.</p>';
    return;
  }

  produtosFiltrados.forEach(produto => {
    // Se loja fechada, desabilita botão e input
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
  renderizarItensModal(); // Re-renderiza para atualizar totais
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

  // Animação visual na barra
  if (cartBar) {
    cartBar.classList.add('bg-yellow-50');
    setTimeout(() => cartBar.classList.remove('bg-yellow-50'), 200);
  }
}

// --- MODAL, CHECKOUT E LÓGICA FINANCEIRA ---

// Controla visibilidade de campos e recalcula total
window.atualizarModalState = function() {
  const tipoEntrega = document.querySelector('input[name="tipoEntrega"]:checked').value;
  const formaPagamento = document.getElementById('cliente-pagamento').value;
  
  const divEndereco = document.getElementById('div-endereco');
  const divTroco = document.getElementById('div-troco');
  
  // 1. Endereço
  if (tipoEntrega === 'Entrega') {
    divEndereco.classList.remove('hidden');
  } else {
    divEndereco.classList.add('hidden');
  }

  // 2. Troco
  if (formaPagamento === 'Dinheiro') {
    divTroco.classList.remove('hidden');
  } else {
    divTroco.classList.add('hidden');
  }

  // 3. Recalcular Totais
  atualizarTotaisModal();
}

function atualizarTotaisModal() {
  const subtotal = carrinho.reduce((acc, item) => acc + item.preco, 0);
  const tipoEntrega = document.querySelector('input[name="tipoEntrega"]:checked').value;
  
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

function injetarModalCarrinho() {
  const modalHTML = `
    <div id="modal-carrinho" class="fixed inset-0 z-[60] hidden font-sans">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onclick="fecharModal()"></div>
      
      <div class="absolute bottom-0 sm:top-1/2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[450px] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col h-[90vh] sm:h-auto sm:max-h-[90vh]">
        
        <!-- Cabeçalho -->
        <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h2 class="font-bold text-lg text-gray-800">Seu Pedido</h2>
          <button onclick="fecharModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 font-bold transition-colors">✕</button>
        </div>

        <!-- Lista de Itens -->
        <div id="modal-lista-itens" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
          <!-- JS injeta itens aqui -->
        </div>

        <!-- Formulário de Checkout -->
        <div class="p-4 bg-white border-t border-gray-100 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-10 overflow-y-auto max-h-[45vh]">
          
          <div class="space-y-3 mb-4">
            
            <!-- Tipo de Entrega -->
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

            <!-- Dados Pessoais -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Seu Nome *</label>
              <input type="text" id="cliente-nome" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow" placeholder="Seu nome">
            </div>

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
            <span>Enviar Pedido</span>
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
  modal.classList.remove('hidden');
  renderizarItensModal();
  atualizarModalState(); // Garante estado inicial correto
}

function fecharModal() {
  document.getElementById('modal-carrinho').classList.add('hidden');
}

function renderizarItensModal() {
  const container = document.getElementById('modal-lista-itens');
  
  if(carrinho.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-40 text-gray-400">
        <p>Seu carrinho está vazio 😢</p>
        <button onclick="fecharModal()" class="text-brand-brown text-sm font-bold mt-2 underline">Voltar ao cardápio</button>
      </div>`;
    atualizarTotaisModal();
    return;
  }

  let html = '';
  carrinho.forEach(item => {
    html += `
      <div class="flex justify-between items-start bg-white p-3 rounded-lg border border-gray-100 shadow-sm relative pr-8">
        <div class="flex-1">
          <h4 class="font-bold text-sm text-gray-800">${item.nome}</h4>
          ${item.observacao ? `<p class="text-xs text-brand-yellow font-medium mt-0.5">📝 ${item.observacao}</p>` : ''}
          <p class="text-xs text-gray-500 mt-1">${formatarMoeda(item.preco)}</p>
        </div>
        <button onclick="removerDoCarrinho(${item.uniqueId})" class="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1 transition-colors" title="Remover item">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
  atualizarTotaisModal();
}

function enviarWhatsApp() {
  const nome = document.getElementById('cliente-nome').value.trim();
  const pagamento = document.getElementById('cliente-pagamento').value;
  const tipoEntrega = document.querySelector('input[name="tipoEntrega"]:checked').value;
  const enderecoInput = document.getElementById('cliente-endereco');
  const endereco = enderecoInput.value.trim();
  const trocoInput = document.getElementById('cliente-troco');
  const troco = trocoInput.value.trim();

  // VALIDAÇÕES
  if (!nome) { alert('Informe seu Nome!'); return; }
  if (tipoEntrega === 'Entrega' && !endereco) { alert('Informe o Endereço!'); return; }
  if (pagamento === 'Dinheiro' && !troco) { alert('Informe para quanto é o troco (ou digite "sem troco")!'); return; }

  // MENSAGEM WHATSAPP
  let mensagem = `🍽 *PEDIDO - LOUCOS POR TAPIOCA*\n`;
  mensagem += `--------------------------------\n`;

  let subtotal = 0;
  carrinho.forEach((item, index) => {
    subtotal += item.preco;
    mensagem += `*${index + 1}x ${item.nome}*\n`;
    if (item.observacao) mensagem += `   📝 _${item.observacao}_\n`;
    mensagem += `   💲 ${formatarMoeda(item.preco)}\n`;
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
  // Se hora atual for menor que inicio OU maior/igual ao fim
  if (hora < horarioFuncionamento.inicio || hora >= horarioFuncionamento.fim) {
    lojaAberta = false;
    mostrarToast(`Loja Fechada! Horário: ${horarioFuncionamento.inicio}h às ${horarioFuncionamento.fim}h`, true);
  } else {
    lojaAberta = true;
  }
}