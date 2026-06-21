/** SDK registration logic — upsert a project by its projectKey. */
import type { Payload } from 'payload';
import type { RegistrationPayload, RegistrationResponse } from '@aaf11/shared';

export async function registerProject(
  payload: Payload,
  data: RegistrationPayload,
  now: string = new Date().toISOString(),
): Promise<RegistrationResponse> {
  if (!data.projectKey || !data.memberToken) {
    return { ok: false, error: 'projectKey and memberToken are required' };
  }

  const members = await payload.find({
    collection: 'members',
    where: { memberToken: { equals: data.memberToken } },
    limit: 1,
    overrideAccess: true,
    depth: 0,
  });
  const member = members.docs[0];
  if (!member) return { ok: false, error: 'Unknown member token' };

  const base = {
    name: data.projectName,
    connectorUrl: data.connectorUrl,
    projectKey: data.projectKey,
    owner: member.id,
    environment: data.environment,
    lastSeen: now,
  };

  const existing = await payload.find({
    collection: 'projects',
    where: { projectKey: { equals: data.projectKey } },
    limit: 1,
    overrideAccess: true,
    depth: 0,
  });

  if (existing.docs[0]) {
    const updated = await payload.update({
      collection: 'projects',
      id: existing.docs[0].id,
      data: base,
      overrideAccess: true,
    });
    return { ok: true, projectId: String(updated.id) };
  }

  const created = await payload.create({
    collection: 'projects',
    data: { ...base, status: 'healthy', visible: true },
    overrideAccess: true,
  });
  return { ok: true, projectId: String(created.id) };
}
