function mostrarSenha(id) {
  const input = document.getElementById(id);
  const btn = input.nextElementSibling;

  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈"; // olho fechado
    btn.setAttribute("aria-label", "Ocultar senha");
  } else {
    input.type = "password";
    btn.textContent = "👁️"; // olho aberto
    btn.setAttribute("aria-label", "Mostrar senha");
  }
}

function logar() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const msg = document.getElementById("mensagem");

  // Login administrador fixo
  if (email === "adm.padaria@gmail.com" && senha === "adm0000") {
    msg.style.color = "green";
    msg.textContent = "Login de administrador bem-sucedido! Redirecionando...";
    setTimeout(() => {
      window.location.href = "../admin/admin.html";
    }, 1000);
    return;
  }

  // Login usuário normal via localStorage
  const dados = JSON.parse(localStorage.getItem("usuarios")) || [];
  const user = dados.find(u => u.email === email);

  if (!user) {
    msg.style.color = "red";
    msg.textContent = "Email não cadastrado. Cadastre-se.";
    return;
  }

  if (user.senha !== senha) {
    msg.style.color = "red";
    msg.textContent = "Senha incorreta.";
    return;
  }

  msg.style.color = "green";
  msg.textContent = "Login bem-sucedido! Redirecionando...";

  setTimeout(() => {
    window.location.href = "../principal/index.html";
  }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  const btnCadastro = document.getElementById('btnCadastro');
  if (btnCadastro) {
    btnCadastro.addEventListener('click', () => {
      window.location.href = '../cadastro/cadastro.html';
    });
  }

  const btnRecuperar = document.getElementById('btnRecuperar');
  if (btnRecuperar) {
    btnRecuperar.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '../recuperar/recuperar.html';
    });
  }
});
