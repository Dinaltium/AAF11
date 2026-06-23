import React from 'react';
import styles from './home.module.css';
import { CTA as CTA_CONTENT } from './content';
import Reveal from './Reveal';

export default function CTA() {
  return (
    <section className={styles.cta}>
      <div className={styles.wrap}>
        <Reveal>
          <h2 className={styles.ctaHead}>{CTA_CONTENT.headline}</h2>
          <p className={styles.ctaSub}>{CTA_CONTENT.sub}</p>
          <div className={styles.ctaBtnRow}>
            <a className={`${styles.btn} ${styles.btnPrimary}`} href={CTA_CONTENT.primary.href}>
              {CTA_CONTENT.primary.label}
              <span className={styles.arrow}>→</span>
            </a>
          </div>
          <div className={styles.signoff}>{CTA_CONTENT.signoff}</div>
        </Reveal>
      </div>
    </section>
  );
}
