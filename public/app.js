const authView = document.querySelector('#auth-view');
const profileView = document.querySelector('#profile-view');
const authForm = document.querySelector('#auth-form');
const nameField = document.querySelector('#name-field');
const nameInput = document.querySelector('#name');
const passwordInput = document.querySelector('#password');
const formMessage = document.querySelector('#form-message');
const submitButton = document.querySelector('#submit-button');
const formSubtitle = document.querySelector('#form-subtitle');
let mode = 'login';

const showMessage = (message = '') => { formMessage.textContent = message; };

function setMode(nextMode) {
  mode = nextMode;
  const register = mode === 'register';
  nameField.classList.toggle('hidden', !register);
  nameInput.required = register;
  passwordInput.autocomplete = register ? 'new-password' : 'current-password';
  submitButton.innerHTML = register ? 'Crear mi cuenta <span aria-hidden="true">→</span>' : 'Entrar a mi espacio <span aria-hidden="true">→</span>';
  formSubtitle.textContent = register ? 'Crea tu cuenta en unos segundos.' : 'Entra para ver tu espacio personal.';
  document.querySelectorAll('.tab').forEach((tab) => {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', active);
  });
  showMessage();
}

document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => setMode(tab.dataset.mode)));

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage();
  if (!authForm.reportValidity()) return;
  submitButton.disabled = true;
  submitButton.style.opacity = '.65';
  const payload = Object.fromEntries(new FormData(authForm));
  try {
    const response = await fetch(`/api/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'No se pudo completar la solicitud.');
    renderProfile(data.user);
    authForm.reset();
  } catch (error) {
    showMessage(error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.style.opacity = '';
  }
});

document.querySelector('#logout-button').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  profileView.classList.add('hidden');
  authView.classList.remove('hidden');
  setMode('login');
});

function renderProfile(user) {
  document.querySelector('#profile-name').textContent = user.name.split(' ')[0];
  document.querySelector('#detail-name').textContent = user.name;
  document.querySelector('#detail-email').textContent = user.email;
  document.querySelector('#detail-date').textContent = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date(user.createdAt));
  document.querySelector('#avatar').textContent = user.name.charAt(0).toUpperCase();
  authView.classList.add('hidden');
  profileView.classList.remove('hidden');
}

async function restoreSession() {
  try {
    const response = await fetch('/api/me');
    const data = await response.json();
    if (data.user) renderProfile(data.user);
  } catch {
    showMessage('No se pudo conectar con el servicio.');
  }
}

restoreSession();
