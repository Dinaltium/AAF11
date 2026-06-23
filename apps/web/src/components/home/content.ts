/**
 * Curated, real home-page content for AAF11.
 * Sourced from docs/AAF11-Company-Foundation.md and docs/AAF11-Growth-and-Plan.md.
 * This is real content (not mock fixtures); the brand home page does not depend
 * on the Hub data layer so it never renders mock/test data to the public.
 */

export interface Founder {
  name: string;
  role: string;
  axis: string; // the axis they cover
  blurb: string;
  initials: string;
}

export interface Project {
  name: string;
  domain: string;
  blurb: string;
  status: 'Shipped' | 'In build' | 'Active';
}

export interface Capability {
  title: string;
  blurb: string;
  detail: string[];
  horizon: 'Now' | 'Next';
}

export const HERO = {
  chip: 'A · A · F · 11 — built to eleven',
  // "We build it. We keep it alive." — full delivery + lasting partnerships.
  headlineLines: ['We build it.', 'We keep it alive.'],
  sub:
    'AAF11 is a three-founder engineering studio. We ship applied AI and full-stack ' +
    'products — delivered in full, built to last, and strongest where software meets a ' +
    'real domain most teams won’t touch.',
  primaryCta: { label: 'Start a project', href: '/contact' },
  secondaryCta: { label: 'See what we’ve shipped', href: '#work' },
};

export const HERO_STATS: { value: string; label: string }[] = [
  { value: '3', label: 'founders, one complete team' },
  { value: '7+', label: 'products shipped' },
  { value: 'Mangaluru', label: '→ India → beyond' },
  { value: 'WRNXT · GRID', label: 'early client partners' },
];

/** The name decoded — the signature brand beat. */
export const DECODE = {
  chars: ['A', 'A', 'F', '1', '1'],
  steps: [
    'Read it letter by letter — A · A · F · eleven. Never one word.',
    'A, A and F are valid hexadecimal digits. A mark made by engineers.',
    'The 11 is binary for three.',
    'Three founders. The name encodes the team itself.',
  ],
};

export const FOUNDERS: Founder[] = [
  {
    name: 'Darel Oliver Tauro',
    role: 'CEO',
    axis: 'Business · People',
    initials: 'DT',
    blurb:
      'The company’s voice and strongest networker — he pitches AAF11 and represents ' +
      'it to the world. The reason WRNXT and GRID came on board. Owns backend testing ' +
      'and delivery during builds.',
  },
  {
    name: 'Prateek D Shriyan',
    role: 'COO',
    axis: 'Domain · Operations',
    initials: 'PS',
    blurb:
      'Biotech engineer, not a CS grad — by design. Owns problem understanding, project ' +
      'management, and the healthcare and life-sciences edge most software teams can’t ' +
      'claim. ProtEngine and RxBridge started with him.',
  },
  {
    name: 'Rafan Ahamad Sheik',
    role: 'CTO',
    axis: 'Product · Engineering',
    initials: 'RS',
    blurb:
      'Owns UI/UX and the end-to-end build. Ships fast with modern AI-assisted tooling ' +
      'and a bias toward experimenting — which is how every client gets something unique.',
  },
];

export const CAPABILITIES: Capability[] = [
  {
    title: 'AI systems',
    horizon: 'Now',
    blurb:
      'Applied AI in real domains — the sharpest thing we do. Assistants, retrieval, ' +
      'multi-agent workflows, automation, and decision-support that actually ships.',
    detail: ['RAG & knowledge retrieval', 'Multi-agent workflows', 'Automation', 'Decision support'],
  },
  {
    title: 'Full-stack development',
    horizon: 'Now',
    blurb:
      'Websites, web apps, dashboards, SaaS, MVPs, and internal tools — the full build, ' +
      'from a blank repo to a thing your customers use.',
    detail: ['Web apps & dashboards', 'SaaS & MVPs', 'Internal tools', 'Modern, fast stacks'],
  },
  {
    title: 'IoT & embedded',
    horizon: 'Next',
    blurb:
      'PCB design, connected-hardware builds, and IoT projects — productizing the ' +
      'embedded roots the team already has.',
    detail: ['PCB design', 'Connected hardware', 'Telemetry & control'],
  },
];

export const PROJECTS: Project[] = [
  {
    name: 'ProtEngine',
    domain: 'Healthcare AI',
    status: 'Shipped',
    blurb:
      'A drug-screening platform that runs candidate drugs against mutated proteins, ranks ' +
      'the most promising, and writes research-style analysis. A fast assistant where the ' +
      'gold-standard tools take months.',
  },
  {
    name: 'RxBridge',
    domain: 'Clinical decision support',
    status: 'Shipped',
    blurb:
      'Bayesian models that help doctors narrow likely conditions and communicate them ' +
      'clearly to patients. Where ProtEngine targets discovery, RxBridge lives in the clinic.',
  },
  {
    name: 'Vigilens',
    domain: 'Trust & safety AI',
    status: 'Shipped',
    blurb:
      'Detects AI-generated disaster misinformation: flags synthetic video, inspects ' +
      'metadata, traces origin by reverse search, and alerts the community on Telegram.',
  },
  {
    name: 'BUSLINK',
    domain: 'Civic · Web',
    status: 'Active',
    blurb:
      'A bus-information platform for Mangaluru — live routes and stops for riders. ' +
      'In active development.',
  },
  {
    name: 'Feedback Automation',
    domain: 'Automation',
    status: 'Shipped',
    blurb:
      'AAF11’s first product. Fully automates student course-feedback submission and the ' +
      'team’s first lesson in pricing and monetizing a tool.',
  },
  {
    name: 'AAF11 Nexus',
    domain: 'Platform',
    status: 'In build',
    blurb:
      'Our own operations platform — one hub tying every project, its health, and its ' +
      'notifications together. Federated: if the hub goes down, the projects keep running.',
  },
];

export const EDGE = {
  label: 'The edge',
  lead: 'A biotech founder in the room.',
  body:
    'Most software teams can’t credibly build healthcare and life-sciences AI. AAF11 can — ' +
    'which is why our strongest work clusters there. We ship the full extent of what we can ' +
    'build, and aim to give every client something they couldn’t get from a generic shop.',
  points: [
    { k: 'In-house domain', v: 'Real healthcare & life-sciences depth, not borrowed.' },
    { k: 'Full delivery', v: 'We don’t hold back or ship a templated deliverable.' },
    { k: 'Hackathon speed', v: 'Bred to ship working results fast, AI-accelerated.' },
    { k: 'Complete team', v: 'Business, domain, and engineering — covered from day one.' },
  ],
};

export const CTA = {
  headline: 'Tell us the problem.',
  sub: 'We’ll build something that solves it — and stays solved.',
  primary: { label: 'Start a project', href: '/contact' },
  signoff: 'Built to eleven.',
};
