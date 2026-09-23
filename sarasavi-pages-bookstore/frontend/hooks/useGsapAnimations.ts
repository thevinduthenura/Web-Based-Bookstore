/**
 * useGsapAnimations.ts
 * ─────────────────────────────────────────────────────────
 * Centralised GSAP animation utilities for Sarasavi Pages.
 * Uses @gsap/react's useGSAP for automatic scope + cleanup.
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// --- Text scramble utility -------------------------------------------------
const CHARS = 'abcdefghijklmnopqrstuvwxyz·-';

export function scrambleTextReveal(
  el: HTMLElement,
  finalText: string,
  duration = 1.6,
  delay = 0
) {
  const total = finalText.length;
  let frame = 0;
  const fps = 30;
  const totalFrames = Math.floor(duration * fps);

  setTimeout(() => {
    const interval = setInterval(() => {
      let output = '';
      for (let i = 0; i < total; i++) {
        const progress = frame / totalFrames;
        const charRevealProgress = (i + 1) / total;
        if (progress > charRevealProgress) {
          output += finalText[i];
        } else {
          output +=
            finalText[i] === ' '
              ? ' '
              : CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      el.textContent = output;
      frame++;
      if (frame > totalFrames) {
        el.textContent = finalText;
        clearInterval(interval);
      }
    }, 1000 / fps);
  }, delay * 1000);
}

// ─── Magnetic hover helper ─────────────────────────────────────────────────
export function addMagneticEffect(el: HTMLElement, strength = 0.3) {
  const onMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
  };
  const onLeave = () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' });
  };
  el.addEventListener('mousemove', onMove);
  el.addEventListener('mouseleave', onLeave);
  return () => {
    el.removeEventListener('mousemove', onMove);
    el.removeEventListener('mouseleave', onLeave);
  };
}

export default gsap;
