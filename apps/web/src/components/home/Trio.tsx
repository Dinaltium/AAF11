import React from 'react';
import styles from './home.module.css';
import { FOUNDERS } from './content';
import Reveal from './Reveal';

export default function Trio() {
  return (
    <section className={styles.section} id="team">
      <div className={styles.wrap}>
        <Reveal className={styles.sectionHead}>
          <span className={styles.sysLabel}>The trio</span>
          <h2 className={styles.sectionTitle}>
            Business, domain, and engineering — covered from day one.
          </h2>
          <p className={styles.sectionLede}>
            Most early teams are missing one of the three. AAF11 isn’t. Each founder is
            strongest where the others aren’t.
          </p>
        </Reveal>

        <Reveal className={styles.trio} stagger={0.12} y={30}>
          {FOUNDERS.map((f) => (
            <article key={f.name} className={styles.founder}>
              <div className={styles.founderNode}>{f.initials}</div>
              <div className={styles.founderRole}>{f.role}</div>
              <h3 className={styles.founderName}>{f.name}</h3>
              <div className={styles.founderAxis}>{f.axis}</div>
              <p className={styles.founderBlurb}>{f.blurb}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
