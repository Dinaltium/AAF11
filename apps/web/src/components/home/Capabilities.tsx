import React from 'react';
import styles from './home.module.css';
import { CAPABILITIES } from './content';
import Reveal from './Reveal';

export default function Capabilities() {
  return (
    <section className={styles.section} id="services">
      <div className={styles.wrap}>
        <Reveal className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>What we build</h2>
          <p className={styles.sectionLede}>
            Capability first, then offer — we add a service only when we can deliver it
            fully and reliably.
          </p>
        </Reveal>

        <Reveal className={styles.caps} stagger={0.1} y={28}>
          {CAPABILITIES.map((c) => (
            <article key={c.title} className={styles.cap}>
              <span className={styles.capHorizon}>{c.horizon}</span>
              <h3 className={styles.capTitle}>{c.title}</h3>
              <p className={styles.capBlurb}>{c.blurb}</p>
              <div className={styles.capDetail}>
                {c.detail.map((d) => (
                  <span key={d} className={styles.capTag}>
                    {d}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
