import { getSession, json, withCookie } from "../../_lib/auth.js";

export async function onRequestPost({ request, env }) { const session = await getSession(request, env.DB); if (session) await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(session.token).run(); return withCookie(json({ ok: true }), "", 0); }