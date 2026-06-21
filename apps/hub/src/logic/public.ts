/**
 * Public read API logic — whitelists fields for the world-facing website.
 * Always uses overrideAccess (server-side) and returns ONLY safe fields.
 */
import type { Payload } from 'payload';
import type {
  PublicBlogPost,
  PublicProject,
  PublicService,
  PublicTeamMember,
} from '@aaf11/shared';

function tagList(tags: unknown): string[] {
  return Array.isArray(tags) ? (tags.filter((t) => typeof t === 'string') as string[]) : [];
}

export async function getPublicProjects(payload: Payload): Promise<PublicProject[]> {
  const res = await payload.find({
    collection: 'projects',
    where: { visible: { equals: true } },
    limit: 200,
    overrideAccess: true,
    depth: 0,
  });
  return res.docs.map((d) => ({
    id: String(d.id),
    name: d.name,
    description: d.description ?? undefined,
    status: (d.status ?? 'healthy') as PublicProject['status'],
    environment: String(d.environment ?? 'production'),
    tags: tagList(d.tags),
  }));
}

export async function getPublicTeam(payload: Payload): Promise<PublicTeamMember[]> {
  const res = await payload.find({
    collection: 'cms_team',
    where: { visible: { equals: true } },
    limit: 200,
    overrideAccess: true,
    depth: 0,
  });
  return res.docs.map((d) => ({
    id: String(d.id),
    name: d.name,
    role: d.role,
    bio: d.bio ?? undefined,
    github: d.github ?? undefined,
    photoUrl: undefined,
  }));
}

export async function getPublicServices(payload: Payload): Promise<PublicService[]> {
  const res = await payload.find({
    collection: 'cms_services',
    where: { visible: { equals: true } },
    limit: 200,
    overrideAccess: true,
    depth: 0,
  });
  return res.docs.map((d) => ({
    id: String(d.id),
    title: d.title,
    description: d.description,
    tags: tagList(d.tags),
  }));
}

export async function getPublicBlog(payload: Payload): Promise<PublicBlogPost[]> {
  const res = await payload.find({
    collection: 'cms_posts',
    where: { published: { equals: true } },
    sort: '-publishedAt',
    limit: 200,
    overrideAccess: true,
    depth: 1,
  });
  return res.docs.map((d) => ({
    id: String(d.id),
    title: d.title,
    slug: d.slug,
    excerpt: d.excerpt ?? undefined,
    authorName: typeof d.author === 'object' && d.author ? d.author.name : undefined,
    publishedAt: d.publishedAt ?? undefined,
  }));
}

export async function getPublicBlogPost(
  payload: Payload,
  slug: string,
): Promise<PublicBlogPost | null> {
  const res = await payload.find({
    collection: 'cms_posts',
    where: { slug: { equals: slug }, published: { equals: true } },
    limit: 1,
    overrideAccess: true,
    depth: 1,
  });
  const d = res.docs[0];
  if (!d) return null;
  return {
    id: String(d.id),
    title: d.title,
    slug: d.slug,
    excerpt: d.excerpt ?? undefined,
    body: d.body ?? undefined,
    authorName: typeof d.author === 'object' && d.author ? d.author.name : undefined,
    publishedAt: d.publishedAt ?? undefined,
  };
}
