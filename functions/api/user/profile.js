import { getSession, json, cleanUser } from "../../_lib/auth.js";

export async function onRequestPut({ request, env }) {
  const session = await getSession(request, env.DB);
  if (!session) return json({ error: "Sesión no válida." }, 401);
  const { firstName, lastName, bio } = await request.json().catch(() => ({}));
  if (!firstName?.trim() || !lastName?.trim()) return json({ error: "Nombre y apellidos son obligatorios." }, 400);
  const user = await env.DB.prepare("UPDATE users SET first_name = ?, last_name = ?, bio = ?, updated_at = datetime('now') WHERE id = ? RETURNING *").bind(firstName.trim(), lastName.trim(), (bio || "").trim(), session.user.id).first();
  return json({ user: cleanUser(user) });
}