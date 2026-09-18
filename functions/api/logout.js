import { getSessionToken, json, sessionCookie } from './_utils.js';

export async function onRequestPost({ request, env }) {
  const token = getSessionToken(request);
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', 0) });
}
