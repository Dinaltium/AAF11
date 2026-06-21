/**
 * Control plane — dispatch an action to a project's connector, with ownership
 * checks and a permanent audit-log entry.
 */
import type { Payload } from 'payload';

export type FetchLike = (
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string },
) => Promise<{ json: () => Promise<unknown> }>;

export interface DispatchOptions {
  projectId: string | number;
  actionId: string;
  memberToken: string;
  payload?: unknown;
  fetchImpl?: FetchLike;
  now?: string;
}

export interface DispatchResult {
  status: number;
  body: { ok: boolean; result?: unknown; error?: string };
}

export async function dispatchAction(
  payload: Payload,
  opts: DispatchOptions,
): Promise<DispatchResult> {
  const member = (
    await payload.find({
      collection: 'members',
      where: { memberToken: { equals: opts.memberToken } },
      limit: 1,
      overrideAccess: true,
      depth: 0,
    })
  ).docs[0];
  if (!member) return { status: 401, body: { ok: false, error: 'Unauthorized' } };

  const project = await payload
    .findByID({ collection: 'projects', id: opts.projectId, overrideAccess: true, depth: 0 })
    .catch(() => null);
  if (!project) return { status: 404, body: { ok: false, error: 'Project not found' } };

  const ownerId =
    typeof project.owner === 'object' && project.owner ? project.owner.id : project.owner;
  if (member.role !== 'admin' && String(ownerId) !== String(member.id)) {
    return { status: 403, body: { ok: false, error: 'Not the project owner' } };
  }

  const f: FetchLike = opts.fetchImpl ?? (globalThis.fetch as unknown as FetchLike);
  let result: { ok: boolean; result?: unknown; error?: string };
  try {
    const res = await f(`${project.connectorUrl}/aaf11/actions/${opts.actionId}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${opts.memberToken}`,
      },
      body: JSON.stringify(opts.payload ?? {}),
    });
    result = (await res.json()) as typeof result;
  } catch (err) {
    result = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  await payload.create({
    collection: 'actions_log',
    data: {
      project: project.id,
      member: member.id,
      action: opts.actionId,
      timestamp: opts.now ?? new Date().toISOString(),
      result: JSON.stringify(result),
    },
    overrideAccess: true,
  });

  return { status: result.ok ? 200 : 502, body: result };
}
