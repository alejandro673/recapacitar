const form = document.getElementById('loginForm');
const messageBox = document.getElementById('message');

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
}

function getUsers() {
  const users = localStorage.getItem('usuariosRecapacitar');
  return users ? JSON.parse(users) : [];
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    showMessage('Escribe email y contraseña.', 'error');
    return;
  }

  const users = getUsers();
  const user = users.find((item) => item.email === email && item.password === password);

  if (!user) {
    showMessage('Credenciales incorrectas.', 'error');
    return;
  }

  showMessage('Login correcto. Redirigiendo...', 'success');
  localStorage.setItem('usuarioActual', JSON.stringify(user));

  setTimeout(() => {
    window.location.href = '../index.html';
  }, 800);
});
