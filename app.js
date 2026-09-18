const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
let currentUser = null;

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
const initials = (user) => `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "R";
const notify = (message) => { toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2800); };

async function request(url, options = {}) {
  const response = await fetch(url, { headers: { "Content-Type": "application/json", ...options.headers }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "No se pudo completar la operación.");
  return data;
}

function brand() { return `<div class="brand"><span class="brand-mark">R</span><span>recapacitar</span></div>`; }

function renderLanding() {
  app.innerHTML = `<main class="landing"><section class="landing-copy">${brand()}<div class="hero"><div class="eyebrow">Tu espacio para avanzar</div><h1>Vuelve a ti, <span>paso a paso.</span></h1><p>Organiza tus metas, conecta tus herramientas y conserva tus avances en un espacio sencillo, privado y hecho para ti.</p><div class="button-row"><button class="btn btn-primary" data-view="register">Crear mi cuenta</button><button class="btn btn-secondary" data-view="login">Ya tengo una cuenta</button></div></div><small class="muted">Impulsado por GitHub + Cloudflare Pages + D1</small></section><section class="landing-art"><div class="art-card"><div class="art-rule"></div><h2>Un lugar para lo que sigue.</h2><p>Tus datos, tus decisiones y tu progreso reunidos en un mismo sitio.</p><span class="eyebrow">recapacitar / 01</span></div></section></main>`;
}

function renderAuth(mode = "login") {
  const register = mode === "register";
  app.innerHTML = `<main class="auth-layout"><section class="auth-card">${brand()}<h1>${register ? "Crea tu cuenta" : "Qué bueno verte"}</h1><p>${register ? "Empieza a construir tu espacio personal." : "Accede a tu espacio de Recapacitar."}</p><form id="auth-form"><div class="form-group"><label for="email">Correo electrónico</label><input id="email" name="email" type="email" autocomplete="email" required /></div>${register ? `<div class="form-group"><label for="firstName">Nombre</label><input id="firstName" name="firstName" autocomplete="given-name" required /></div><div class="form-group"><label for="lastName">Apellidos</label><input id="lastName" name="lastName" autocomplete="family-name" required /></div>` : ""}<div class="form-group"><label for="password">Contraseña</label><input id="password" name="password" type="password" minlength="8" autocomplete="${register ? "new-password" : "current-password"}" required /></div><div id="form-error" class="form-error"></div><button class="btn btn-primary" type="submit">${register ? "Registrarme" : "Iniciar sesión"}</button></form><p class="auth-switch">${register ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"} <button data-view="${register ? "login" : "register"}">${register ? "Inicia sesión" : "Regístrate"}</button></p><p class="auth-switch"><button data-view="home">Volver al inicio</button></p></section></main>`;
  document.querySelector("#auth-form").addEventListener("submit", handleAuth);
}

async function handleAuth(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const isRegister = Boolean(form.get("firstName"));
  const error = document.querySelector("#form-error");
  error.textContent = "";
  try {
    const data = await request(`/api/auth/${isRegister ? "register" : "login"}`, { method: "POST", body: JSON.stringify({ email: form.get("email"), password: form.get("password"), firstName: form.get("firstName"), lastName: form.get("lastName") }) });
    currentUser = data.user;
    renderDashboard("home");
    notify(isRegister ? "Tu cuenta fue creada." : "Sesión iniciada.");
  } catch (err) { error.textContent = err.message; }
}

function renderDashboard(section = "home") {
  const user = currentUser;
  const content = section === "profile" ? profileView(user) : section === "integrations" ? integrationsView() : homeView(user);
  app.innerHTML = `<main class="dashboard"><aside class="sidebar">${brand()}<nav class="nav"><button class="${section === "home" ? "active" : ""}" data-section="home">Resumen</button><button class="${section === "profile" ? "active" : ""}" data-section="profile">Mi perfil</button><button class="${section === "integrations" ? "active" : ""}" data-section="integrations">Integraciones</button></nav><button class="logout" id="logout">Cerrar sesión</button></aside><section class="content">${content}</section></main>`;
  document.querySelectorAll("[data-section]").forEach((button) => button.addEventListener("click", () => renderDashboard(button.dataset.section)));
  document.querySelector("#logout").addEventListener("click", logout);
  document.querySelector("#profile-form")?.addEventListener("submit", saveProfile);
}

function homeView(user) { return `<header class="content-header"><div><div class="eyebrow">Panel personal</div><h1>Hola, ${escapeHtml(user.first_name)}.</h1><p>Este es tu punto de partida para seguir avanzando.</p></div><div class="welcome"><span class="avatar">${initials(user)}</span></div></header><div class="stat-grid"><div class="stat"><small>Estado de tu cuenta</small><strong>Activa</strong></div><div class="stat"><small>Integraciones</small><strong>2 listas</strong></div><div class="stat"><small>Miembro desde</small><strong>${new Date(user.created_at).toLocaleDateString("es-ES", { month: "short", year: "numeric" })}</strong></div></div><section class="panel"><h2>Tu siguiente paso</h2><p>Completa tu perfil y revisa las integraciones disponibles para dejar tu espacio listo.</p><button class="btn btn-coral" data-section="profile">Revisar mi perfil</button></section>`; }
function profileView(user) { return `<header class="content-header"><div><div class="eyebrow">Cuenta</div><h1>Mi perfil</h1><p>Actualiza tus datos personales cuando lo necesites.</p></div></header><section class="panel profile-form"><form id="profile-form"><div class="form-group"><label for="profileEmail">Correo electrónico</label><input id="profileEmail" value="${escapeHtml(user.email)}" disabled /></div><div class="form-group"><label for="profileFirstName">Nombre</label><input id="profileFirstName" name="firstName" value="${escapeHtml(user.first_name)}" required /></div><div class="form-group"><label for="profileLastName">Apellidos</label><input id="profileLastName" name="lastName" value="${escapeHtml(user.last_name)}" required /></div><div class="form-group"><label for="profileBio">Sobre mí</label><input id="profileBio" name="bio" value="${escapeHtml(user.bio || "")}" maxlength="240" placeholder="Cuéntanos algo breve sobre ti" /></div><div class="button-row"><button class="btn btn-primary" type="submit">Guardar cambios</button></div></form></section>`; }
function integrationsView() { return `<header class="content-header"><div><div class="eyebrow">Herramientas</div><h1>Integraciones</h1><p>Todo conectado en el mismo lugar.</p></div></header><div class="integration-grid"><section class="panel integration"><div class="integration-icon">GH</div><div class="integration-info"><strong>GitHub</strong><span>Repositorio y despliegues</span></div><button class="btn btn-secondary" onclick="window.open('https://github.com','_blank')">Abrir</button></section><section class="panel integration"><div class="integration-icon">CF</div><div class="integration-info"><strong>Cloudflare</strong><span>Pages, Functions y D1</span></div><button class="btn btn-secondary" onclick="window.open('https://dash.cloudflare.com','_blank')">Abrir</button></section></div><section class="panel" style="margin-top:16px"><div class="empty">Las conexiones OAuth se pueden añadir cuando definas las credenciales de tu proyecto.</div></section>`; }

async function saveProfile(event) { event.preventDefault(); const form = new FormData(event.currentTarget); try { const data = await request("/api/user/profile", { method: "PUT", body: JSON.stringify({ firstName: form.get("firstName"), lastName: form.get("lastName"), bio: form.get("bio") }) }); currentUser = data.user; renderDashboard("profile"); notify("Perfil actualizado."); } catch (err) { notify(err.message); } }
async function logout() { await request("/api/auth/logout", { method: "POST" }).catch(() => {}); currentUser = null; renderLanding(); notify("Sesión cerrada."); }
async function start() { try { const data = await request("/api/auth/me"); currentUser = data.user; renderDashboard(); } catch { renderLanding(); } }
document.addEventListener("click", (event) => { const target = event.target.closest("[data-view]"); if (!target) return; const view = target.dataset.view; if (view === "home") renderLanding(); else renderAuth(view); });
start();