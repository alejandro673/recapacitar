const SESSION_COOKIE = "recapacitar_session";
const SESSION_DAYS = 30;

function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } }); }
function cleanUser(row) { return { id: row.id, email: row.email, first_name: row.first_name, last_name: row.last_name, bio: row.bio || "", created_at: row.created_at }; }
function randomHex(bytes = 32) { const values = crypto.getRandomValues(new Uint8Array(bytes)); return [...values].map((value) => value.toString(16).padStart(2, "0")).join(""); }
async function hashPassword(password, salt = randomHex(16)) { const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]); const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 100000, hash: "SHA-256" }, key, 256); return { hash: [...new Uint8Array(bits)].map((value) => value.toString(16).padStart(2, "0")).join(""), salt }; }
function cookie(value, maxAge = SESSION_DAYS * 86400) { return `${SESSION_COOKIE}=${value}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`; }
async function createSession(db, userId) { const token = randomHex(32); await db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, datetime('now', '+30 days'))").bind(token, userId).run(); return token; }
async function getSession(request, db) { const match = request.headers.get("Cookie")?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`)); if (!match) return null; const row = await db.prepare("SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > datetime('now')").bind(match[1]).first(); return row ? { token: match[1], user: cleanUser(row) } : null; }
function withCookie(response, value, maxAge) { const headers = new Headers(response.headers); headers.append("Set-Cookie", cookie(value, maxAge)); return new Response(response.body, { status: response.status, headers }); }
export { cleanUser, createSession, getSession, hashPassword, json, withCookie, cookie, SESSION_COOKIE };