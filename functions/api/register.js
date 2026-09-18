import { createSession, hashPassword, json, publicUser, readBody, sessionCookie } from './_utils.js';

export async function onRequestPost({ request, env }) {
  const body = await readBody(request);
  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;

  if (!name || !email || typeof password !== 'string' || password.length < 8) {
    return json({ error: 'Completa los campos y usa una contrasena de al menos 8 caracteres.' }, 400);
  }

  try {
    const passwordHash = await hashPassword(password);
    const result = await env.DB.prepare(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
    ).bind(name, email, passwordHash).run();
    const token = await createSession(env.DB, result.meta.last_row_id);
    return json({ user: publicUser({ id: result.meta.last_row_id, name, email, created_at: new Date().toISOString() }) }, 201, {
      'Set-Cookie': sessionCookie(token)
    });
  } catch (error) {
    if (String(error).includes('UNIQUE')) return json({ error: 'Ese correo ya esta registrado.' }, 409);
    return json({ error: 'No se pudo crear la cuenta.' }, 500);
  }
}
