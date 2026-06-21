import type { Access, CollectionConfig } from 'payload';

const authed: Access = ({ req }) => Boolean(req.user);
const isAdmin: Access = ({ req }) =>
  (req.user as { role?: string } | null)?.role === 'admin';

/** Team members — Payload auth collection; identity that logs into the admin. */
export const Members: CollectionConfig = {
  slug: 'members',
  auth: true,
  admin: { useAsTitle: 'name', group: 'Operations' },
  access: {
    read: authed,
    create: isAdmin,
    update: authed,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'member',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Member', value: 'member' },
      ],
    },
    {
      name: 'memberToken',
      type: 'text',
      unique: true,
      index: true,
      admin: { description: 'mbr_* token used by the SDK to tie projects to this owner.' },
    },
  ],
};

/** Project registry. */
export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: { useAsTitle: 'name', group: 'Operations' },
  access: { read: authed, create: authed, update: authed, delete: isAdmin },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'connectorUrl', type: 'text', required: true },
    { name: 'projectKey', type: 'text', required: true, unique: true, index: true },
    { name: 'owner', type: 'relationship', relationTo: 'members' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'healthy',
      options: ['healthy', 'degraded', 'down'],
    },
    {
      name: 'environment',
      type: 'select',
      defaultValue: 'production',
      options: ['production', 'staging', 'development'],
    },
    { name: 'lastSeen', type: 'date' },
    { name: 'description', type: 'textarea' },
    { name: 'tags', type: 'text', hasMany: true },
    {
      name: 'visible',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Show this project on the public website.' },
    },
  ],
};

/** Time-series health/metrics snapshots produced by the poller. */
export const MetricsSnapshots: CollectionConfig = {
  slug: 'metrics_snapshots',
  admin: { useAsTitle: 'id', group: 'Operations', hidden: true },
  access: { read: authed, create: authed, update: authed, delete: isAdmin },
  fields: [
    { name: 'project', type: 'relationship', relationTo: 'projects', required: true, index: true },
    { name: 'timestamp', type: 'date', required: true },
    { name: 'health', type: 'select', options: ['healthy', 'degraded', 'down'] },
    { name: 'requestCount', type: 'number', defaultValue: 0 },
    { name: 'errorRate', type: 'number', defaultValue: 0 },
    { name: 'customData', type: 'json' },
  ],
};

/** Immutable audit trail of every control-plane action. */
export const ActionsLog: CollectionConfig = {
  slug: 'actions_log',
  admin: { useAsTitle: 'action', group: 'Operations' },
  access: { read: authed, create: authed, update: () => false, delete: isAdmin },
  fields: [
    { name: 'project', type: 'relationship', relationTo: 'projects' },
    { name: 'member', type: 'relationship', relationTo: 'members' },
    { name: 'action', type: 'text', required: true },
    { name: 'timestamp', type: 'date', required: true },
    { name: 'result', type: 'text' },
  ],
};
