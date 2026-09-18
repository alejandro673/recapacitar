import { createSession, hashPassword, json, withCookie } from "../../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  const { email, password } = await request.json().catch(() => ({}));
  const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email?.trim().toLowerCase()).first();
  if (!user) return json({ error: "Correo o contraseña incorrectos." }, 401);
  const attempt = await hashPassword(password || "", user.password_salt);
  if (attempt.hash !== user.password_hash) return json({ error: "Correo o contraseña incorrectos." }, 401);
  const token = await createSession(env.DB, user.id);
  return withCookie(json({ user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, bio: user.bio || "", created_at: user.created_at } }), token);
}