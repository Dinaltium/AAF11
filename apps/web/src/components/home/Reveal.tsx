'use client';

/**
 * Lightweight scroll-reveal. Animates either the element or its direct children
 * (when `stagger` is set) from a small offset as it enters view. Content is
 * visible by default; GSAP applies the from() start-state in a layout effect,
 * so no-JS and reduced-motion users always see it.
 */

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type Props = {
  children: React.ReactNode;
  className?: string;
  y?: number;
  stagger?: number;
  start?: string;
};

export default function Reveal({ children, className, y = 24, stagger, start = 'top 84%' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.registerPlugin(ScrollTrigger);
      const el = ref.current!;
      const targets = stagger != null ? Array.from(el.children) : [el];
      gsap.from(targets, {
        y,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: stagger ?? 0,
        scrollTrigger: { trigger: el, start, once: true },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
