'use client';

/**
 * Title sequence (sections 1 → 2).
 * Section 1: flat #181616, framing copy, the AAF11 wordmark half-cut at the seam.
 * On scroll the section pins; a scrubbed timeline lifts the wordmark to center and
 * scales it to native size while the #181616 plate lifts to reveal the orange
 * shader. The shader is a FIXED full-viewport layer (never resizes/clips, so it
 * renders smoothly in both scroll directions) faded out as the section exits.
 * Reduced motion: resolved state, no pin/scrub.
 */

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './home.module.css';

const ShaderBg = dynamic(() => import('./ShaderBg'), { ssr: false });
const LogoMark3D = dynamic(() => import('./LogoMark3D'), { ssr: false });

export default function Opening() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLHeadingElement>(null);
  const solid = useRef<HTMLDivElement>(null);
  const shaderFixed = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const cycle = useRef<HTMLSpanElement>(null);
  const logoProgress = useRef({ v: 0 });
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const frameKids = frame.current ? Array.from(frame.current.children) : [];
      const START_SCALE = 0.52;

      // shader is fixed + always rendering; fade it out only as the section exits,
      // so it never bleeds behind the next section. Created AFTER the pin below so
      // its start/end measure the pin-spacer height, not the bare section.
      gsap.set(shaderFixed.current, { opacity: 1 });
      const fadeShader = () =>
        gsap.to(shaderFixed.current, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'bottom bottom',
            end: 'bottom top',
            scrub: true,
          },
        });

      if (reduced) {
        gsap.set(solid.current, { opacity: 0 });
        gsap.set(mark.current, { y: 0, scale: 1 });
        gsap.set(frameKids, { opacity: 0 });
        fadeShader();
        return;
      }

      // mark centered in the pin; +50vh puts its center on the bottom edge = half-cut
      const startY = () => window.innerHeight * 0.5;
      gsap.set(mark.current, { y: startY, scale: START_SCALE });
      gsap.set(solid.current, { opacity: 1 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=180%',
          scrub: 0.7,
          pin: pin.current,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(frameKids, { opacity: 0, y: -24, duration: 0.32, stagger: 0.04, ease: 'power2.in' }, 0);
      // the #181616 plate lifts to reveal the (already-rendering) shader
      tl.to(solid.current, { opacity: 0, duration: 0.5 }, 0.28);
      tl.fromTo(
        mark.current,
        { y: startY, scale: START_SCALE },
        { y: 0, scale: 1, ease: 'power1.inOut', duration: 1 },
        0,
      );

      // 3D logo scales 0→1 in place, starting once the section is 50% scrubbed
      tl.fromTo(logoProgress.current, { v: 0 }, { v: 1, duration: 0.5, ease: 'power2.out' }, 0.5);

      // now that the pin spacer exists, the fade measures the right range
      fadeShader();

      // cycle the orange clause: alive → ship → deliver → do …
      const phrases = ['We keep it alive.', 'We ship it.', 'We deliver it.', 'We do it.'];
      const cyc = cycle.current;
      if (cyc) {
        const ct = gsap.timeline({ repeat: -1 });
        for (let i = 1; i <= phrases.length; i++) {
          const next = phrases[i % phrases.length];
          ct.to(cyc, { opacity: 0, y: -10, duration: 0.4, ease: 'power2.in', delay: 1.7 })
            .add(() => {
              cyc.textContent = next;
            })
            .to(cyc, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
        }
      }
    },
    { scope: root },
  );

  return (
    <section ref={root} className={styles.opening} aria-label="AAF11">
      <div ref={shaderFixed} className={styles.openShaderFixed} aria-hidden="true">
        <ShaderBg animate={!reduced} />
      </div>

      <div ref={pin} className={styles.openingPin}>
        <div ref={solid} className={styles.openSolid} aria-hidden="true" />

        <div ref={frame} className={styles.openFrame}>
          <div className={styles.openRow}>
          </div>
          <p className={styles.openMid}>
            We build it.
            <br />
            <span ref={cycle} className={styles.openMidAccent}>
              We keep it alive.
            </span>
          </p>
        </div>

        <h1 ref={mark} className={styles.openMark}>
          <span className={styles.openPart}>
            AAF
            <span className={styles.openTip}>A · A · F — valid hexadecimal digits</span>
          </span>
          <b className={styles.openPart}>
            11
            <span className={styles.openTip}>binary 11 = 3 · the three founders</span>
          </b>
        </h1>

        <div className={styles.openLogo} aria-hidden="true">
          <LogoMark3D progress={logoProgress} reduced={reduced} />
        </div>
      </div>
    </section>
  );
}
