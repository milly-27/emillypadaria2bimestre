// Lista de cupons válidos e seus respectivos descontos
const cuponsValidos = {
  'DELFINS10': 0.10, // 10% de desconto
  'AMOPINKDELFINS': 0.20, // 20% de desconto
  'DELFINS5': 0.05 // 5% de desconto
};

// Mensagens que serão exibidas ao aplicar um cupom
const mensagensCupons = {
  'DELFINS10': 'Você ganhou 10% de desconto!',
  'AMOPINKDELFINS': 'Você ganhou 20% de desconto!',
  'DELFINS5': 'Você ganhou 5% de desconto!'
};

// Recupera o carrinho do localStorage ou inicializa como vazio
const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Função para validar número de cartão de crédito usando o algoritmo de Luhn
function validarCartao(numero) {
  // Remove caracteres não numéricos, inverte e converte em array de números
  const digits = numero.replace(/\D/g, '').split('').reverse().map(d => parseInt(d, 10));
  let soma = 0;
  // Itera pelos dígitos aplicando as regras do algoritmo
  digits.forEach((d, i) => {
    if (i % 2 === 1) { // Dobra os dígitos das posições ímpares
      d *= 2;
      if (d > 9) d -= 9; // Se o resultado for maior que 9, subtrai 9
    }
    soma += d; // Soma acumulada
  });
  return soma % 10 === 0; // Validação final (deve ser múltiplo de 10)
}

// Função para calcular o valor total com ou sem desconto aplicado
function calcularValores() {
  let valorOriginal = 0;
  // Soma o preço de todos os itens do carrinho
  carrinho.forEach(item => {
    valorOriginal += item.preco * item.quantidade;
  });

  // Recupera o cupom usado e verifica se é válido
  const cupomUsado = localStorage.getItem('cupomUsado');
  const descontoCupom = (cupomUsado && cuponsValidos[cupomUsado]) ? cuponsValidos[cupomUsado] : 0;

  // Calcula valor final aplicando o desconto
  const valorFinal = valorOriginal * (1 - descontoCupom);
  window.valorFinalCalculado = valorFinal; // Armazena para uso futuro

  // Exibe o valor final na interface, se o elemento existir
  const valorFinalSpan = document.getElementById('valor-final-span');
  if (valorFinalSpan) {
    valorFinalSpan.textContent = valorFinal.toFixed(2); // Formata para 2 casas decimais
  }
}

// Função de pagamento com cartão
function pagarCartao() {
  const numero = prompt('Insira o número do seu cartão (só números):');
  if (!numero || !validarCartao(numero)) {
    alert('Número do cartão inválido. Tente novamente.');
    return;
  }
  alert('Cartão válido! Prosseguindo para confirmação.');
  document.getElementById('qrcode-area').style.display = 'none'; // Esconde QR Code (caso visível)
}

// NOVA FUNÇÃO PIX REAL
function pagarPIX() {
  calcularValores(); // Garante que o valor final esteja atualizado

  const valor = window.valorFinalCalculado.toFixed(2); // Valor em string com 2 casas
  const chavePix = '02964990999'; // Chave Pix do recebedor
  const nomeRecebedor = 'Celso Mainko'; // Nome do recebedor
  const cidade = 'SAO PAULO'; // Cidade do recebedor
  const descricao = 'Pagamento Doceria Pink Delfins'; // Descrição da transação

  // Função auxiliar para formatar campos do payload Pix
  function formatField(id, value) {
    const length = value.length.toString().padStart(2, '0'); // Comprimento em 2 dígitos
    return id + length + value; // Concatena campo ID, tamanho e valor
  }

  // Constrói o payload Pix sem o CRC ainda
  let payloadSemCRC =
    formatField("00", "01") +
    formatField("26",
      formatField("00", "BR.GOV.BCB.PIX") +
      formatField("01", chavePix) +
      formatField("02", descricao)
    ) +
    formatField("52", "0000") + // Código de categoria (sem categoria)
    formatField("53", "986") + // Código da moeda (BRL)
    formatField("54", valor) + // Valor da transação
    formatField("58", "BR") + // País
    formatField("59", nomeRecebedor) + // Nome do recebedor
    formatField("60", cidade) + // Cidade do recebedor
    formatField("62", formatField("05", "***")) + // Identificador adicional (***)
    "6304"; // Início do campo de CRC

  // Função para gerar o código CRC16 do payload Pix
  function crc16(str) {
    let crc = 0xFFFF;
    for (let c = 0; c < str.length; c++) {
      crc ^= str.charCodeAt(c) << 8;
      for (let i = 0; i < 8; i++) {
        if ((crc & 0x8000) !== 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc <<= 1;
        }
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0'); // Retorna em hexadecimal com 4 dígitos
  }

  const crc = crc16(payloadSemCRC); // Calcula o CRC
  const payloadFinal = payloadSemCRC + crc; // Adiciona CRC ao payload

  const qrCodeDiv = document.getElementById('qrcode');
  qrCodeDiv.innerHTML = ''; // Limpa conteúdo anterior do QR code
  document.getElementById('qrcode-area').style.display = 'block'; // Mostra a área do QR code

  // Gera o QR code usando a biblioteca QRCode.js
  new QRCode(qrCodeDiv, {
    text: payloadFinal, // Texto do QR Code (payload Pix)
    width: 250,
    height: 250,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });

  // Cria e adiciona um elemento com informações do pagamento abaixo do QR code
  const info = document.createElement('div');
  info.className = 'nome-valor';
  info.innerHTML = `
    <p><strong>Nome:</strong> ${nomeRecebedor}</p>
    <p><strong>CPF (PIX):</strong> ${chavePix}</p>
    <p><strong>Valor:</strong> R$ ${valor}</p>
  `;
  qrCodeDiv.appendChild(info);
}

// Função chamada ao confirmar o pagamento
function confirmarPagamento() {
  confettiAnimation(); // Animação de confete
  setTimeout(() => {
    alert('Pagamento confirmado com sucesso! 🎉');
    localStorage.removeItem('carrinho'); // Limpa carrinho
    localStorage.removeItem('cupomUsado'); // Limpa cupom
    window.location.href = '../principal/index.html'; // Redireciona para página inicial
  }, 2000);
}

// Voltar para página principal
function voltar() {
  window.location.href = '../principal/index.html';
}

// Animação de confete (usando biblioteca externa)
function confettiAnimation() {
  const duration = 2000; // Duração da animação
  const end = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
  const interval = setInterval(() => {
    const timeLeft = end - Date.now();
    if (timeLeft <= 0) return clearInterval(interval); // Encerra a animação após o tempo
    confetti({
      particleCount: 50, // Número de partículas por vez
      origin: { x: Math.random(), y: Math.random() - 0.2 }, // Posição aleatória
      ...defaults
    });
  }, 200);
}

// Executa a função de cálculo de valores ao carregar a página
window.onload = calcularValores;
