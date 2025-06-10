function mostrarSenha(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

function senhaForte(senha) {
  // Mínimo 8 caracteres, pelo menos uma letra maiúscula, um número e um símbolo
  return senha.length >= 8
    && /[A-Z]/.test(senha)
    && /[0-9]/.test(senha)
    && /[\W_]/.test(senha);
}

function cadastrar() {
  const usuario = document.getElementById("usuario").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const msg = document.getElementById("mensagem");

  if (!usuario || !email || !senha) {
    msg.textContent = "Preencha todos os campos.";
    return;
  }

  if (!senhaForte(senha)) {
    msg.textContent = "Senha fraca! Use ao menos 8 caracteres, letra maiúscula, número e símbolo.";
    return;
  }

  let dados = JSON.parse(localStorage.getItem("usuarios")) || [];

  if (dados.some(u => u.email === email)) {
    msg.textContent = "E-mail já cadastrado. Use outro.";
    return;
  }

  // Adiciona o tipo como cliente
  dados.push({ usuario, email, senha, tipo: "cliente" });
  localStorage.setItem("usuarios", JSON.stringify(dados));

  msg.style.color = "green";
  msg.textContent = "Cadastro realizado com sucesso! Voltando ao login...";

  setTimeout(() => {
    window.location.href = "../login/login.html";
  }, 2000);
}
