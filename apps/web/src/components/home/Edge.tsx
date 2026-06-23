import React from 'react';
import styles from './home.module.css';
import { EDGE } from './content';
import Reveal from './Reveal';

export default function Edge() {
  return (
    <section className={`${styles.section} ${styles.edge}`}>
      <div className={styles.wrap}>
        <div className={styles.edgeGrid}>
          <Reveal>
            <span className={styles.sysLabel}>{EDGE.label}</span>
            <h2 className={styles.edgeLead} style={{ marginTop: 20 }}>
              A <em>biotech founder</em> in the room.
            </h2>
            <p className={styles.edgeBody}>{EDGE.body}</p>
          </Reveal>

          <Reveal className={styles.edgePoints} stagger={0.08} y={18}>
            {EDGE.points.map((p) => (
              <div key={p.k} className={styles.edgePoint}>
                <div className={styles.edgePointK}>{p.k}</div>
                <div className={styles.edgePointV}>{p.v}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
