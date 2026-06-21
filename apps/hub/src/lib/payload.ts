import { getPayload } from 'payload';
import config from '@payload-config';

/** Shared Local API client. getPayload caches a singleton internally. */
export function payloadClient() {
  return getPayload({ config });
}

/** Extract a Bearer token from a request's Authorization header. */
export function bearerToken(req: Request): string | null {
  const h = req.headers.get('authorization');
  if (!h) return null;
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m ? m[1]!.trim() : null;
}
