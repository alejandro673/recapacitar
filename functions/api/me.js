import { currentUser, json, publicUser } from './_utils.js';

export async function onRequestGet({ request, env }) {
  const user = await currentUser(request, env.DB);
  if (!user) return json({ user: null });
  return json({ user: publicUser(user) });
}
