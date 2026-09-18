import { getSession, json } from "../../_lib/auth.js";

export async function onRequestGet({ request, env }) { const session = await getSession(request, env.DB); if (!session) return json({ error: "No hay una sesión activa." }, 401); return json({ user: session.user }); }