"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Fires once when the observed element first enters the viewport, then
 * disconnects. Starts `false` on both server and client (avoiding a
 * hydration mismatch) and falls back to `true` post-mount if
 * IntersectionObserver isn't available (very old browsers) so nothing is
 * stuck hidden.
 */
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      const id = window.setTimeout(() => setInView(true), 0);
      return () => window.clearTimeout(id);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3, ...options },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
}

/**
 * Whether `ref`'s element is on screen right now — unlike `useInView`, which
 * latches `true` on first sight and stops watching. Use it for things that
 * must stop again when the visitor scrolls away (a render loop, a timeline),
 * not for one-shot reveals or lazy mounting.
 *
 * Takes an existing ref so it can watch the same node as a `useInView`
 * without a second wrapper element. Starts `false` on server and client.
 */
export function useIsVisible<T extends HTMLElement>(ref: RefObject<T | null>, options?: IntersectionObserverInit) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      const id = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(id);
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
      ...options,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, options]);

  return visible;
}
