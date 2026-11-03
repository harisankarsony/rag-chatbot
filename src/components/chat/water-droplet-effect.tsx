"use client";

import { useEffect } from "react";

/**
 * WaterDropletEffect
 *
 * Spawns an ethereal Ayurvedic water droplet ripple (*Netra Bindu* aschyothana effect)
 * at the exact coordinates of every user interaction click.
 * Highly performant: uses native DOM creation and animationend cleanup with zero React re-renders.
 */
export function WaterDropletEffect() {
  useEffect(() => {
    // Respect user motion preference
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const handlePointerUp = (e: PointerEvent) => {
      // Skip touch (finger) interactions — only fire for mouse or stylus
      if (e.pointerType === "touch") return;
      // Only primary button (left click)
      if (e.button !== 0) return;

      const ripple = document.createElement("span");
      ripple.className = "water-drop-ripple";
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;

      const removeRipple = () => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      };

      ripple.addEventListener("animationend", removeRipple, { once: true });
      // Fallback cleanup in case animationend does not fire
      setTimeout(removeRipple, 650);

      document.body.appendChild(ripple);
    };

    window.addEventListener("pointerup", handlePointerUp, { passive: true });

    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  return null;
}

