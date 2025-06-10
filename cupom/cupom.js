function loadCupons() {
  fetch('http://localhost:3000/cupons.csv')
      .then(response => response.text())
      .then(csvText => {
          const cupons = parseCSV(csvText);
          cuponsTable.innerHTML = '';
          cupons.forEach(cupom => {
              addCupomToTable(cupom);
          });
      })
      .catch(error => console.error('Erro ao carregar cupons:', error));
}

function verificarCupom() {
  // Obtém o valor digitado no campo de cupom, remove espaços e converte para letras maiúsculas
  const input = document.getElementById('input-cupom').value.trim().toUpperCase();

  // Seleciona o elemento onde será exibida a mensagem de validação do cupom
  const mensagem = document.getElementById('mensagem-cupom');

  // Verifica se o campo não está vazio e se o cupom digitado existe no objeto 'cuponsValidos'
  if (input !== "" && cuponsValidos.hasOwnProperty(input)) {
    mensagem.style.color = 'green';
    mensagem.textContent = cuponsValidos[input];
    // Armazena no localStorage o nome do cupom usado
    localStorage.setItem('cupomUsado', input);
    // Armazena no localStorage o valor do desconto correspondente ao cupom
    localStorage.setItem('descontoCupom', valoresDesconto[input]);
  } else {
    // Define a cor da mensagem como vermelha (cupom inválido)
    mensagem.style.color = 'red';
    // Define o texto da mensagem informando que o cupom é inválido
    mensagem.textContent = 'Cupom inválido! 😢';
    // Remove o nome do cupom do localStorage (caso exista)
    localStorage.removeItem('cupomUsado');
    // Remove o valor do desconto do localStorage (caso exista)
    localStorage.removeItem('descontoCupom');
  }
}

function voltar() {
  window.location.href = "../principal/index.html";
}

function pagar() {
  window.location.href = "../pagamento/pagamento.html";
}
