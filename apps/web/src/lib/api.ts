/**
 * Public-site data layer. Reads the Hub's public API.
 *
 * test mode: if the Hub is unreachable, falls back to shared mock fixtures so
 *            the site still renders for previews/CI. NO real data involved.
 * real mode: must reach the Hub. No fallback — an error surfaces rather than
 *            silently showing mock content.
 */
import {
  dataMode,
  mockProjects,
  mockServices,
  mockTeam,
  mockBlogPosts,
  type PublicProject,
  type PublicService,
  type PublicTeamMember,
  type PublicBlogPost,
} from '@aaf11/shared';

const HUB = process.env.NEXT_PUBLIC_HUB_URL ?? 'http://localhost:3000';

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${HUB}${path}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Hub ${path} → ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    if (dataMode() === 'test') return null; // fall back to mock below
    throw err;
  }
}

export async function getProjects(): Promise<PublicProject[]> {
  const data = await fetchJson<{ projects: PublicProject[] }>('/api/public/projects');
  if (data) return data.projects;
  return mockProjects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    environment: p.environment,
    tags: p.tags,
  }));
}

export async function getServices(): Promise<PublicService[]> {
  const data = await fetchJson<{ services: PublicService[] }>('/api/public/services');
  if (data) return data.services;
  return mockServices
    .filter((s) => s.visible)
    .map((s) => ({ id: s.id, title: s.title, description: s.description, tags: s.tags }));
}

export async function getTeam(): Promise<PublicTeamMember[]> {
  const data = await fetchJson<{ team: PublicTeamMember[] }>('/api/public/team');
  if (data) return data.team;
  return mockTeam
    .filter((t) => t.visible)
    .map((t) => ({ id: t.id, name: t.name, role: t.role, bio: t.bio, github: t.github }));
}

export async function getBlog(): Promise<PublicBlogPost[]> {
  const data = await fetchJson<{ posts: PublicBlogPost[] }>('/api/public/blog');
  if (data) return data.posts;
  return mockBlogPosts
    .filter((p) => p.published)
    .map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      authorName: 'Team AAF11',
      publishedAt: p.publishedAt,
    }));
}

export async function getBlogPost(slug: string): Promise<PublicBlogPost | null> {
  const data = await fetchJson<{ post: PublicBlogPost }>(`/api/public/blog/${slug}`);
  if (data) return data.post;
  const p = mockBlogPosts.find((b) => b.slug === slug && b.published);
  if (!p) return null;
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    body: p.body,
    authorName: 'Team AAF11',
    publishedAt: p.publishedAt,
  };
}

/** True when the page is rendering from mock fallback (test mode, no Hub). */
export function isMockMode(): boolean {
  return dataMode() === 'test';
}
