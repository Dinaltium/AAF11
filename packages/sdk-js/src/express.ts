import type { AAF11Connector } from './connector.js';

/**
 * Express / Connect adapter. Requires `express.json()` mounted upstream so
 * `req.body` is parsed. Mount with:
 *
 *   app.use(express.json());
 *   app.use(nexusMiddleware(connector));
 *
 * Only requests under the connector basePath are handled; everything else
 * falls through to next().
 */
export function nexusMiddleware(connector: AAF11Connector) {
  const base = connector.config.basePath;
  // Loosely typed to avoid a hard dependency on @types/express.
  return async function (req: any, res: any, next: any): Promise<void> {
    const path: string = req.path ?? req.url?.split('?')[0] ?? '';
    if (!path.startsWith(base)) {
      next();
      return;
    }
    try {
      const result = await connector.handle({
        method: req.method,
        path,
        headers: req.headers,
        body: req.body,
      });
      res.status(result.status).json(result.body);
    } catch (err) {
      next(err);
    }
  };
}
