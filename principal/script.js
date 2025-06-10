// Declaração das categorias
let doces = [];
let salgados = [];
let bebidas = [];

function carregarProdutos() {
  fetch('http://localhost:3000/produtos') // Agora pega do backend em JSON
    .then(response => response.json())
    .then(dados => {
      console.log(dados); // Visualiza os produtos recebidos

      // Limpar arrays
      doces = [];
      salgados = [];
      bebidas = [];

      dados.forEach(produto => {
        const item = {
          nome: produto.name,
          preco: parseFloat(produto.price),
          imagem: produto.image || ''
        };

        if (produto.category === 'doce') {
          doces.push(item);
        } else if (produto.category === 'salgado') {
          salgados.push(item);
        } else if (produto.category === 'bebida') {
          bebidas.push(item);
        }
      });

      mostrarCategoria('doces'); // Categoria inicial
      mostrarDoces();
      mostrarSalgados();
      mostrarBebidas();
    })
    .catch(error => {
      console.error('Erro ao carregar produtos:', error);
    });
}

function mostrarCategoria(categoria) {
  document.getElementById('doces').style.display = 'none';
  document.getElementById('salgados').style.display = 'none';
  document.getElementById('bebidas').style.display = 'none';
  document.getElementById(categoria).style.display = 'flex';
}

function mostrarDoces() {
  let container = document.getElementById('doces');
  container.innerHTML = '';

  doces.forEach((item, index) => {
    let card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}">
      <h4>${item.nome}</h4>
      <p>R$ ${item.preco.toFixed(2)}</p>
      <button onclick="adicionarDoces(${index})">Adicionar</button>
    `;
    container.appendChild(card);
  });
}

function mostrarSalgados() {
  let container = document.getElementById('salgados');
  container.innerHTML = '';

  salgados.forEach((item, index) => {
    let card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}">
      <h4>${item.nome}</h4>
      <p>R$ ${item.preco.toFixed(2)}</p>
      <button onclick="adicionarSalgados(${index})">Adicionar</button>
    `;
    container.appendChild(card);
  });
}

function mostrarBebidas() {
  let container = document.getElementById('bebidas');
  container.innerHTML = '';

  bebidas.forEach((item, index) => {
    let card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}">
      <h4>${item.nome}</h4>
      <p>R$ ${item.preco.toFixed(2)}</p>
      <button onclick="adicionarBebidas(${index})">Adicionar</button>
    `;
    container.appendChild(card);
  });
}

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

function adicionarDoces(index) {
  let produto = doces[index];
  adicionarAoCarrinho(produto);
}

function adicionarSalgados(index) {
  let produto = salgados[index];
  adicionarAoCarrinho(produto);
}

function adicionarBebidas(index) {
  let produto = bebidas[index];
  adicionarAoCarrinho(produto);
}

function adicionarAoCarrinho(produto) {
  let existente = carrinho.find(item => item.nome === produto.nome);
  if (existente) {
    existente.quantidade++;
  } else {
    carrinho.push({ ...produto, quantidade: 1 });
  }
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  atualizarCarrinho();
}

function atualizarCarrinho() {
  let corpoCarrinho = document.getElementById('corpo-carrinho');
  let totalEl = document.getElementById('total');
  if (!corpoCarrinho || !totalEl) return; // Garante que elementos existem

  corpoCarrinho.innerHTML = '';
  let total = 0;

  carrinho.forEach((item, index) => {
    let subtotal = item.preco * item.quantidade;
    total += subtotal;

    let tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.nome}</td>
      <td>
        <input type="number" min="1" value="${item.quantidade}" onchange="atualizarQuantidadeDireta(${index}, this.value)">
      </td>
      <td>R$ ${item.preco.toFixed(2)}</td>
      <td>R$ ${subtotal.toFixed(2)}</td>
      <td>
        <button onclick="alterarQuantidade(${index}, -1)">-</button>
        <button onclick="alterarQuantidade(${index}, 1)">+</button>
      </td>
    `;
    corpoCarrinho.appendChild(tr);
  });

  totalEl.textContent = `Total: R$ ${total.toFixed(2)}`;
}

function alterarQuantidade(index, delta) {
  carrinho[index].quantidade += delta;
  if (carrinho[index].quantidade <= 0) {
    carrinho.splice(index, 1);
  }
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  atualizarCarrinho();
}

function atualizarQuantidadeDireta(index, valor) {
  let novaQuantidade = parseInt(valor);
  if (isNaN(novaQuantidade) || novaQuantidade < 1) {
    carrinho[index].quantidade = 1;
  } else {
    carrinho[index].quantidade = novaQuantidade;
  }
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  atualizarCarrinho();
}

function irParaCupom() {
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  window.location.href = '../cupom/cupom.html';
}

window.onload = () => {
  carregarProdutos();
  atualizarCarrinho();
};
