const SESSION_COOKIE = 'recapacitar_session';
const SESSION_DAYS = 7;

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }
  });
}

export async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', bytes, 'PBKDF2', false, ['deriveBits']);
  const digest = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  return `${toHex(salt)}:${toHex(new Uint8Array(digest))}`;
}

export async function verifyPassword(password, storedHash) {
  const [saltHex, expected] = storedHash.split(':');
  if (!saltHex || !expected) return false;
  const bytes = new TextEncoder().encode(password);
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map((pair) => parseInt(pair, 16)));
  const key = await crypto.subtle.importKey('raw', bytes, 'PBKDF2', false, ['deriveBits']);
  const digest = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  return toHex(new Uint8Array(digest)) === expected;
}

function toHex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function getSessionToken(request) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match?.[1] || null;
}

export async function createSession(db, userId) {
  const token = [...crypto.getRandomValues(new Uint8Array(32))]
    .map((byte) => byte.toString(16).padStart(2, '0')).join('');
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  await db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(token, userId, expires).run();
  return token;
}

export function sessionCookie(token, maxAge = SESSION_DAYS * 86400) {
  return `${SESSION_COOKIE}=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

export async function currentUser(request, db) {
  const token = getSessionToken(request);
  if (!token) return null;
  const result = await db.prepare(`
    SELECT users.id, users.name, users.email, users.created_at
    FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token = ? AND sessions.expires_at > datetime('now')
  `).bind(token).first();
  return result || null;
}

export function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.created_at };
}

export { SESSION_COOKIE };
