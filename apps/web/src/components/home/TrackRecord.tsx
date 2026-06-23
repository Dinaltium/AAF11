'use client';

/**
 * Real track record as a horizontal, scroll-scrubbed rail (pinned on desktop).
 * Falls back to a native swipeable scroller on mobile and under reduced motion,
 * so the content is always reachable without the pin choreography.
 */

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './home.module.css';
import { PROJECTS } from './content';

export default function TrackRecord() {
  const section = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const desktop = window.matchMedia('(min-width: 821px)').matches;
      if (reduced || !desktop) return; // native horizontal scroll

      const tr = track.current!;
      const sc = scroller.current!;
      sc.style.overflow = 'visible';

      const distance = () => Math.max(0, tr.scrollWidth - sc.clientWidth);

      gsap.to(tr, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: () => '+=' + distance(),
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} className={styles.work} id="work">
      <div className={styles.wrap}>
        <span className={styles.sysLabel}>Track record</span>
        <h2 className={styles.sectionTitle} style={{ marginTop: 18, maxWidth: '20ch' }}>
          A real record of shipped work.
        </h2>
        <p className={styles.workHint}>
          <span>{'>'}</span> drag / scroll through what we’ve built
        </p>
      </div>

      <div ref={scroller} className={styles.workScroller} style={{ marginTop: 'clamp(40px, 6vh, 64px)' }}>
        <div ref={track} className={styles.workTrack}>
          {PROJECTS.map((p, i) => (
            <article key={p.name} className={styles.workCard}>
              <div className={styles.workCardHead}>
                <h3 className={styles.workName}>{p.name}</h3>
                <span className={styles.workStatus} data-s={p.status}>
                  {p.status}
                </span>
              </div>
              <div className={styles.workDomain}>{p.domain}</div>
              <p className={styles.workBlurb}>{p.blurb}</p>
              <div className={styles.workIndex}>
                {String(i + 1).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
