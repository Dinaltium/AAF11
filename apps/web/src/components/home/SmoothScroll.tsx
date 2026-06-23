'use client';

/**
 * Lenis smooth-scroll wired into GSAP's ticker so ScrollTrigger stays in sync.
 * Disabled entirely under prefers-reduced-motion (native scroll, ScrollTrigger
 * still works). Scoped to the home page only — mounted nowhere else.
 *
 * Scroll restoration: native restore fights pinned ScrollTriggers (the browser
 * restores scrollY before pin spacers exist → lands in the wrong section). We
 * take it over: persist scrollY, and on reload, if we were mid-way through the
 * opening's pinned scrub, snap to that pin's END (the resolved section-2 state)
 * rather than a broken mid-pin position.
 */

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const SAVE_KEY = 'aaf_home_scroll';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lenis: Lenis | null = null;

    const setScroll = (y: number) => {
      if (lenis) lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    };
    const save = () => sessionStorage.setItem(SAVE_KEY, String(Math.round(window.scrollY)));

    let restored = false;
    const restore = () => {
      if (restored) return;
      const pins = ScrollTrigger.getAll().filter((t) => t.pin);
      if (!pins.length) return; // pins not built yet
      restored = true;
      const opening = pins.reduce((a, b) => (a.start <= b.start ? a : b));
      const saved = Number(sessionStorage.getItem(SAVE_KEY) || 0);
      if (saved > 5 && saved < opening.end) setScroll(opening.end); // mid section 2 → final
      else if (saved >= opening.end) setScroll(saved); // past section 2 → keep
      // otherwise: stay at top (section 1)
    };

    const refreshAndRestore = () => {
      ScrollTrigger.refresh();
      restore();
    };

    window.addEventListener('scroll', save, { passive: true });
    window.addEventListener('load', refreshAndRestore);

    if (reduced) {
      requestAnimationFrame(refreshAndRestore);
      return () => {
        window.removeEventListener('scroll', save);
        window.removeEventListener('load', refreshAndRestore);
      };
    }

    lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 1 });
    if (process.env.NODE_ENV !== 'production') {
      (window as unknown as { lenis?: Lenis }).lenis = lenis;
    }
    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => lenis!.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    requestAnimationFrame(refreshAndRestore);

    return () => {
      window.removeEventListener('scroll', save);
      window.removeEventListener('load', refreshAndRestore);
      gsap.ticker.remove(tick);
      lenis!.destroy();
    };
  }, []);

  return <>{children}</>;
}
