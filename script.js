// Inicializa os ícones do Lucide (se estiver usando a biblioteca externa)
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

// Dados dos Produtos (Facilita a manutenção e expansão)
const produtos = [
  {
    id: 1,
    nome: 'Tapioca de Charque',
    descricao: 'Charque desfiada acebolada com queijo coalho.',
    preco: 13.50,
    img: 'https://images.unsplash.com/photo-1604908177522-0409c6d10c88?w=500&q=80'
  },
  {
    id: 2,
    nome: 'Tapioca de Frango',
    descricao: 'Frango cremoso com catupiry original.',
    preco: 12.50,
    img: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&q=80'
  },
  {
    id: 3,
    nome: 'Pão com Ovo',
    descricao: 'Pão carioca fresquinho com ovos mexidos.',
    preco: 11.00,
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80'
  },
  {
    id: 4,
    nome: 'Cuscuz Completo',
    descricao: 'Cuscuz nordestino, carne de sol e queijo.',
    preco: 15.00,
    img: 'https://images.unsplash.com/photo-1586548480309-34b8c0a87754?w=500&q=80'
  }
];

let carrinho = [];
const phoneStore = '5581999999999'; // Substitua pelo seu número real

// Renderizar produtos na tela
function renderProdutos() {
  const container = document.getElementById('produtos-lista');
  // Verifica se o container existe para evitar erros
  if (!container) return;
  
  container.innerHTML = '';

  produtos.forEach(produto => {
    const card = document.createElement('div');
    // Classes do Tailwind para estilização do card
    card.className = 'bg-white rounded-xl shadow-md overflow-hidden flex flex-col sm:flex-row fade-in border border-gray-100';
    
    card.innerHTML = `
      <div class="sm:w-32 h-48 sm:h-auto relative">
        <img src="${produto.img}" alt="${produto.nome}" class="w-full h-full object-cover">
      </div>
      <div class="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-start mb-1">
            <h3 class="font-bold text-lg text-gray-800">${produto.nome}</h3>
            <span class="font-bold text-brand-brown">R$ ${produto.preco.toFixed(2).replace('.', ',')}</span>
          </div>
          <p class="text-xs text-gray-500 mb-3">${produto.descricao}</p>
        </div>

        <!-- Área de Personalização -->
        <div class="mt-2">
          <input type="text" id="obs-${produto.id}" placeholder="Alguma observação? (Ex: s/ cebola)" 
            class="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all">
          
          <button onclick="adicionarAoCarrinho(${produto.id})" 
            class="w-full bg-brand-yellow hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg shadow-sm active:scale-95 transition-all flex justify-center items-center gap-2">
            Adicionar
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Função Adicionar
function adicionarAoCarrinho(id) {
  const produto = produtos.find(p => p.id === id);
  const obsInput = document.getElementById(`obs-${id}`);
  const observacao = obsInput.value.trim();

  // Adiciona ao array do carrinho
  carrinho.push({
    ...produto,
    observacao: observacao,
    uniqueId: Date.now() // identificador único caso adicione o mesmo item 2x
  });

  // Feedback visual
  obsInput.value = ''; // Limpa o campo
  atualizarCarrinhoUI();
  mostrarToast(`+1 ${produto.nome}`);
}

// Atualiza a barra inferior
function atualizarCarrinhoUI() {
  const total = carrinho.reduce((acc, item) => acc + item.preco, 0);
  const qtd = carrinho.length;

  const totalDisplay = document.getElementById('total-display');
  const qtdDisplay = document.getElementById('qtd-display');

  if (totalDisplay) totalDisplay.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
  if (qtdDisplay) qtdDisplay.innerText = `${qtd} ${qtd === 1 ? 'item' : 'itens'}`;

  // Animação simples no contador
  const cartBar = document.getElementById('cart-bar');
  if (cartBar) {
    cartBar.classList.add('bg-gray-50');
    setTimeout(() => cartBar.classList.remove('bg-gray-50'), 200);
  }
}

// Enviar para WhatsApp
function finalizarPedido() {
  if (carrinho.length === 0) {
    mostrarToast('Seu carrinho está vazio!', true);
    return;
  }

  let mensagem = `🧾 *PEDIDO LOUCOS POR TAPIOCA*\n--------------------------------\n`;
  let total = 0;

  carrinho.forEach((item, index) => {
    total += item.preco;
    mensagem += `*${index + 1}. ${item.nome}*\n`;
    if (item.observacao) {
      mensagem += `   📝 _Obs: ${item.observacao}_\n`;
    }
    mensagem += `   💲 R$ ${item.preco.toFixed(2).replace('.', ',')}\n\n`;
  });

  mensagem += `--------------------------------\n`;
  mensagem += `💰 *TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n`;
  mensagem += `📍 *Endereço:* (Solicitar ao cliente)`;

  const url = `https://wa.me/${phoneStore}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
}

// Sistema de Notificação (Toast)
function mostrarToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  
  if (!toast || !toastMsg) return;
  
  toastMsg.innerText = msg;
  if(isError) {
    toast.classList.replace('bg-gray-800', 'bg-red-500');
  } else {
    toast.classList.replace('bg-red-500', 'bg-gray-800');
  }

  toast.classList.remove('opacity-0', 'translate-y-[-20px]', 'pointer-events-none');
  
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-[-20px]', 'pointer-events-none');
  }, 3000);
}

// Iniciar app quando a janela carregar
window.onload = function() {
  renderProdutos();
};