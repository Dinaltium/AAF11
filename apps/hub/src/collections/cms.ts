import type { Access, CollectionConfig } from 'payload';

const authed: Access = ({ req }) => Boolean(req.user);
// Published CMS content is world-readable; the public API still whitelists fields.
const publicRead: Access = () => true;

/** Blog posts.
 *  NOTE: `body` is a textarea (markdown/plain) for v1 to keep seeding and the
 *  public API trivial and fully testable. Upgrade to Lexical richText later —
 *  the editor is already configured in payload.config.ts. */
export const Posts: CollectionConfig = {
  slug: 'cms_posts',
  admin: { useAsTitle: 'title', group: 'Content', defaultColumns: ['title', 'published'] },
  versions: { drafts: true },
  access: { read: publicRead, create: authed, update: authed, delete: authed },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'excerpt', type: 'textarea' },
    { name: 'body', type: 'textarea' },
    { name: 'author', type: 'relationship', relationTo: 'members' },
    { name: 'published', type: 'checkbox', defaultValue: false },
    { name: 'publishedAt', type: 'date' },
  ],
};

/** Services offered to clients. */
export const Services: CollectionConfig = {
  slug: 'cms_services',
  admin: { useAsTitle: 'title', group: 'Content' },
  access: { read: publicRead, create: authed, update: authed, delete: authed },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'tags', type: 'text', hasMany: true },
    { name: 'visible', type: 'checkbox', defaultValue: true },
  ],
};

/** Public team profiles. */
export const TeamProfiles: CollectionConfig = {
  slug: 'cms_team',
  admin: { useAsTitle: 'name', group: 'Content' },
  access: { read: publicRead, create: authed, update: authed, delete: authed },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', required: true },
    { name: 'bio', type: 'textarea' },
    { name: 'github', type: 'text' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'visible', type: 'checkbox', defaultValue: true },
  ],
};

/** Uploaded media (images for blog/team). */
export const Media: CollectionConfig = {
  slug: 'media',
  upload: true,
  admin: { group: 'Content' },
  access: { read: publicRead, create: authed, update: authed, delete: authed },
  fields: [{ name: 'alt', type: 'text' }],
};
