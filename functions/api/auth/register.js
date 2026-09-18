import { createSession, hashPassword, json, withCookie } from "../../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  const { email, password, firstName, lastName } = await request.json().catch(() => ({}));
  if (!email || !password || !firstName || !lastName) return json({ error: "Completa todos los campos." }, 400);
  if (password.length < 8) return json({ error: "La contraseña debe tener al menos 8 caracteres." }, 400);
  const normalizedEmail = email.trim().toLowerCase();
  const exists = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(normalizedEmail).first();
  if (exists) return json({ error: "Ya existe una cuenta con ese correo." }, 409);
  const { hash, salt } = await hashPassword(password);
  const user = await env.DB.prepare("INSERT INTO users (email, password_hash, password_salt, first_name, last_name) VALUES (?, ?, ?, ?, ?) RETURNING *").bind(normalizedEmail, hash, salt, firstName.trim(), lastName.trim()).first();
  const token = await createSession(env.DB, user.id);
  return withCookie(json({ user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, bio: "", created_at: user.created_at } }, 201), token);
}