import { createSession, json, publicUser, readBody, sessionCookie, verifyPassword } from './_utils.js';

export async function onRequestPost({ request, env }) {
  const body = await readBody(request);
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  if (!email || typeof password !== 'string') return json({ error: 'Introduce tu correo y contrasena.' }, 400);

  const user = await env.DB.prepare('SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?')
    .bind(email).first();
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return json({ error: 'Correo o contrasena incorrectos.' }, 401);
  }

  const token = await createSession(env.DB, user.id);
  return json({ user: publicUser(user) }, 200, { 'Set-Cookie': sessionCookie(token) });
}
