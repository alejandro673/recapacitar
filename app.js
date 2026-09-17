import { validateCredentials } from './db.js';

const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
const loginForm = document.getElementById('loginForm');
const status = document.getElementById('status');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

const particles = [];
const particleCount = 110;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticle() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2.6 + 1.2,
    dx: (Math.random() - 0.5) * 0.7,
    dy: (Math.random() - 0.5) * 0.7,
    color: `rgba(${255 - Math.random() * 30}, ${Math.random() * 60}, ${Math.random() * 85}, 0.9)`
  };
}

function initParticles() {
  particles.length = 0;

  for (let i = 0; i < particleCount; i += 1) {
    particles.push(createParticle());
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i];

    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(255, 60, 74, 0.7)';
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();

    for (let j = i + 1; j < particles.length; j += 1) {
      const q = particles[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 90, 100, ${0.18 - dist / 800})`;
        ctx.lineWidth = 1;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }
  }

  ctx.shadowBlur = 0;
  requestAnimationFrame(drawParticles);
}

function showStatus(message, type) {
  status.textContent = message;
  status.className = `status ${type}`;
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    showStatus('Completa todos los campos.', 'error');
    return;
  }

  const result = validateCredentials(username, password);

  if (!result.success) {
    showStatus(result.message, 'error');
    return;
  }

  showStatus(`${result.message}, ${result.user.name}!`, 'success');
  console.log('Usuario autenticado:', result.user);
});

window.addEventListener('resize', () => {
  resizeCanvas();
  initParticles();
});

resizeCanvas();
initParticles();
drawParticles();
