# AAF11 — Brand & Identity Brief

> **Purpose of this file.** Single source of truth for *who AAF11 is* and *how it
> should sound and look*. The public website (`apps/web`) — starting with the home
> page — is built against this document. Anything marked **[CONFIRM]** is an
> assumption inferred from the codebase/spec; Rafan should correct or approve it
> before it ships in copy.

- **Owner:** Rafan (rafan79200@gmail.com)
- **Status:** Draft v1 — 2026-06-21
- **Source material:** `docs/specs/2026-06-21-aaf11-nexus-design.md`,
  `packages/shared/src/fixtures.ts`, `PROGRESS.md`

---

## 1. What AAF11 is

AAF11 is a **product studio + engineering team** that designs, ships, and *keeps
alive* software across many surfaces — web apps, desktop tools, IoT/embedded
systems, and bots.

What sets it apart is **Nexus**: AAF11's own operations platform. Every project
the team builds reports its health and metrics back to one federated hub, so the
team monitors, controls, and showcases everything from a single place.

> The promise in one line: **We build products. Nexus keeps them alive.**

- **"AAF11" — name meaning:** [CONFIRM] — team name / callsign; etymology not in
  the repo. Rafan to supply the real story (it makes great hero/about copy).
- **Nexus** is the *platform*, not the company. AAF11 is the team; Nexus is the
  nervous system that runs under everything they ship.

## 2. Who we are (the team)

Small, senior, builder-led. No bloat — the people who design it also run it in
production.

| Name | Role | Focus |
|------|------|-------|
| **Rafan** | Founder & Lead Engineer | Platforms, product, ships end-to-end; runs Team AAF11 |
| **Aisha** [CONFIRM] | Backend & AI Engineer | Health-tech, AI systems |

- Team profiles above are seeded from `fixtures.ts` (test data). [CONFIRM] the
  real roster, roles, and bios before they go on the public `/team` page.
- Tone of the team: hands-on operators, not a faceless agency. "We run what we
  build" is a core differentiator — lean into it.

## 3. What we do (capabilities)

Grounded in `cms_services` / fixtures:

1. **Web Application Development** — full-stack apps with Next.js and modern
   tooling.
2. **IoT & Embedded Systems** — connected devices, telemetry, control systems.
3. **AI Integration** — local and hosted LLM features embedded into real
   products.

Plus the thing none of the competition has: **operational ownership.** Every
build ships with the AAF11 SDK connector, so it's monitored and controllable
from day one. We don't hand over a zip and disappear — projects stay observable.

**Proof points (live on the site):**
- Real projects reporting live status: BusLink (real-time bus tracking),
  Medicine Assistant (prescription/reminder assistant), LabBot (lab automation),
  the AAF11 site itself. [CONFIRM] which are public-facing / safe to showcase.
- The site's own home page renders *live* project health from the Hub — the
  portfolio is literally running on the platform it's selling.

## 4. Who we help

[CONFIRM] — inferred from project domains (transit, health-tech, lab/IoT):

- **Founders & small teams** who need a product built *and* kept running, without
  standing up their own ops/monitoring.
- **Domain operators** — transit, healthcare, labs — who need connected,
  reliable systems, not just a pretty front-end.
- Anyone who's been burned by "agency ships it, then it rots." AAF11's pitch is
  continuity: the thing keeps working after launch.

## 5. Brand identity — meaning

**Core idea: federated resilience.** The architecture *is* the brand. "If the
hub goes down, everything keeps running" isn't just an engineering rule — it's
the personality: dependable, decentralized, no single point of failure, always
on.

**Three brand pillars:**
1. **Alive** — products that are monitored, healthy, and observable, not
   fire-and-forget. Status is visible. Nothing is a black box.
2. **Federated** — many surfaces, one nervous system. Independent yet connected.
3. **Operator-grade** — built by the people who run it. Technical honesty over
   marketing gloss.

**Personality:** precise, confident, technical-but-readable. An engineer you'd
trust in an incident, not a salesperson. Shows the dashboard rather than
describing it.

## 6. Voice & tone

- **Direct and concrete.** "We build products. Nexus keeps them alive." Short
  declaratives over adjectives.
- **Show live data, don't claim it.** Real status badges, real numbers. The
  product proves the pitch.
- **Technical confidence, zero jargon-dumping.** Name the stack when it earns
  trust (Next.js, IoT, LLM); never hide behind it.
- **Honest.** Degraded is shown as degraded. Reliability you can *see* > "99.9%"
  you have to believe.
- Avoid: hype words ("revolutionary", "synergy"), vague agency-speak,
  exclamation-driven energy.

## 7. Visual direction

Current system (`apps/web/src/app/globals.css`) — keep and sharpen:

- **Dark, editorial/technical.** Near-black canvas, restrained type, monospace
  accents for system/status detail.
- **Status as a first-class visual element.** Health badges (operational /
  degraded / offline), live dots, project cards. The "control room" aesthetic.
- **Accent colors** carry meaning: an operational/ok green, a primary accent for
  action, degraded/down states distinct. Color = signal, not decoration.
- **Motion:** subtle reveal/rise on load — alive, not flashy. Hints at
  real-time without being busy.
- **Grid + mono labels (eyebrows):** "LIVE STATUS", "CAPABILITIES" — reads like
  an instrument panel.

**Feeling to leave the visitor with:** *these people can see everything they
run, and it's all green.*

## 8. Home page implications (what this drives)

The home page should make the brand legible in ~5 seconds:

- **Hero:** the one-liner + live proof (project count, # operational, services).
- **Live status:** real project health — the differentiator, front and center.
- **Capabilities:** what we build, tied to real shipped projects.
- **The Nexus angle:** make "we keep what we build alive" explicit, not implied.
- **CTA:** start a project / see live projects.

> Redesign work tracked separately. This brief is the *why* behind every section.

## 9. Open items for Rafan [CONFIRM]

- [ ] Real meaning / origin of "AAF11"
- [ ] Real team roster, roles, bios, photos (replace fixture data)
- [ ] Which projects are public/showcase-safe
- [ ] Target audience — confirm or correct §4
- [ ] Tagline lock: keep "We build products. Nexus keeps them alive." ?
- [ ] Logo / wordmark direction (currently a `brand-mark` dot + wordmark)
