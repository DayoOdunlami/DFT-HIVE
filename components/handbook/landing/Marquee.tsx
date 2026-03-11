"use client";

import { useEffect, useRef } from "react";
import type { MarqueeEntry } from "@/lib/hive/seed-data";
import { MarqueeCard } from "./MarqueeCard";

interface MarqueeRowProps {
  entries: MarqueeEntry[];
  direction: 1 | -1;
  onCardClick: (entry: MarqueeEntry) => void;
  isHighlighted: (entry: MarqueeEntry) => boolean;
  isDimmed: (entry: MarqueeEntry) => boolean;
}

function MarqueeRow({
  entries,
  direction,
  onCardClick,
  isHighlighted,
  isDimmed,
}: MarqueeRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const lastScrollDirRef = useRef(1);
  const rafRef = useRef<number>(0);

  // Track scroll direction
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const dy = window.scrollY - lastY;
      if (Math.abs(dy) > 1) lastScrollDirRef.current = dy > 0 ? 1 : -1;
      lastY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // RAF animation loop
  useEffect(() => {
    const SPEED = 0.9; // px/frame at 60fps ≈ 54px/s
    const loop = () => {
      if (!trackRef.current) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const trackW = trackRef.current.scrollWidth / 2;
      if (trackW <= 0) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const effectiveDir = direction * lastScrollDirRef.current;
      xRef.current -= SPEED * effectiveDir;
      if (xRef.current < -trackW) xRef.current += trackW;
      if (xRef.current > 0) xRef.current -= trackW;
      trackRef.current.style.transform = `translateX(${xRef.current.toFixed(2)}px)`;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [direction]);

  return (
    <div
      style={{ overflow: "hidden", paddingTop: 10, paddingBottom: 10 }}
      onMouseEnter={() => cancelAnimationFrame(rafRef.current)}
      onMouseLeave={() => {
        const SPEED = 0.9;
        const loop = () => {
          if (!trackRef.current) { rafRef.current = requestAnimationFrame(loop); return; }
          const trackW = trackRef.current.scrollWidth / 2;
          if (trackW <= 0) { rafRef.current = requestAnimationFrame(loop); return; }
          const effectiveDir = direction * lastScrollDirRef.current;
          xRef.current -= SPEED * effectiveDir;
          if (xRef.current < -trackW) xRef.current += trackW;
          if (xRef.current > 0) xRef.current -= trackW;
          trackRef.current.style.transform = `translateX(${xRef.current.toFixed(2)}px)`;
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      }}
    >
      <div
        ref={trackRef}
        style={{
          display: "flex",
          gap: 12,
          width: "max-content",
          willChange: "transform",
        }}
      >
        {[...entries, ...entries].map((entry, i) => (
          <MarqueeCard
            key={`${entry.id}-${i}`}
            entry={entry}
            onClick={onCardClick}
            highlighted={isHighlighted(entry)}
            dimmed={isDimmed(entry)}
          />
        ))}
      </div>
    </div>
  );
}

interface MarqueeProps {
  entries: MarqueeEntry[];
  onCardClick: (entry: MarqueeEntry) => void;
  matchingSectors: string[];
  matchingHazards: string[];
  hasFilters: boolean;
}

export function Marquee({
  entries,
  onCardClick,
  matchingSectors,
  matchingHazards,
  hasFilters,
}: MarqueeProps) {
  const half = Math.ceil(entries.length / 2);
  const rowA = entries.slice(0, half);
  const rowB = entries.slice(half);

  const isHighlighted = (entry: MarqueeEntry) => {
    if (!hasFilters) return false;
    const sectorMatch =
      matchingSectors.length === 0 || matchingSectors.includes(entry.sector);
    const hazardMatch =
      matchingHazards.length === 0 ||
      entry.hazards.some((h) =>
        matchingHazards.some((mh) =>
          h.toLowerCase().includes(mh.toLowerCase())
        )
      );
    return sectorMatch && hazardMatch;
  };

  const isDimmed = (entry: MarqueeEntry) => hasFilters && !isHighlighted(entry);

  return (
    <div style={{ position: "relative", paddingTop: 8, paddingBottom: 8 }}>
      <MarqueeRow
        entries={rowA}
        direction={1}
        onCardClick={onCardClick}
        isHighlighted={isHighlighted}
        isDimmed={isDimmed}
      />
      <MarqueeRow
        entries={rowB}
        direction={-1}
        onCardClick={onCardClick}
        isHighlighted={isHighlighted}
        isDimmed={isDimmed}
      />
    </div>
  );
}
