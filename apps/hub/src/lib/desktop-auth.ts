import type { Payload } from 'payload';
import { bearerToken } from './payload';

/** CORS headers so the Tauri desktop webview (a different origin) can call us. */
export const cors: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization,X-Member-Token,Content-Type',
};

/** Preflight response for OPTIONS handlers. */
export function preflight(): Response {
  return new Response(null, { status: 204, headers: cors });
}

/** Member token from Authorization: Bearer or X-Member-Token header. */
export function memberTokenFrom(req: Request): string | null {
  return bearerToken(req) ?? req.headers.get('x-member-token');
}

/** Validate a member token against the Members collection. */
export async function findMember(payload: Payload, token: string) {
  const res = await payload.find({
    collection: 'members',
    where: { memberToken: { equals: token } },
    limit: 1,
    overrideAccess: true,
    depth: 0,
  });
  return res.docs[0] ?? null;
}
