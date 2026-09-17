const form = document.getElementById('registerForm');
const messageBox = document.getElementById('message');

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
}

function getUsers() {
  const users = localStorage.getItem('usuariosRecapacitar');
  return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
  localStorage.setItem('usuariosRecapacitar', JSON.stringify(users));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const apellidos = document.getElementById('apellidos').value.trim();
  const anioNacimiento = Number(document.getElementById('anio_nacimiento').value);
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value.trim();

  if (!nombre || !apellidos || !anioNacimiento || !email || !password) {
    showMessage('Completa todos los campos.', 'error');
    return;
  }

  const currentYear = new Date().getFullYear();
  if (anioNacimiento < 1900 || anioNacimiento > currentYear) {
    showMessage('El año de nacimiento no es válido.', 'error');
    return;
  }

  const users = getUsers();
  const usuarioExiste = users.some((user) => user.email === email);

  if (usuarioExiste) {
    showMessage('Ese correo ya está registrado.', 'error');
    return;
  }

  users.push({
    id: Date.now(),
    nombre,
    apellidos,
    anio_nacimiento: anioNacimiento,
    email,
    password
  });

  saveUsers(users);
  showMessage('Usuario registrado correctamente.', 'success');
  form.reset();
});
