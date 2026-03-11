"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "hive-onboarding-dismissed-v1";

type TooltipStep = {
  id: string;
  targetSelector: string;
  title: string;
  body: string;
  position: "top" | "bottom" | "left" | "right";
};

const STEPS: TooltipStep[] = [
  {
    id: "search",
    targetSelector: "[data-onboard='search']",
    title: "AI-powered search",
    body: "Type a plain-English question — HIVE detects climate hazards and transport sectors automatically.",
    position: "bottom",
  },
  {
    id: "heatmap",
    targetSelector: "[data-onboard='heatmap']",
    title: "Coverage heatmap",
    body: "Cells show how many adaptation options exist for each sector × hazard combination. Click any cell to filter.",
    position: "right",
  },
  {
    id: "brief",
    targetSelector: "[data-onboard='brief-nav']",
    title: "Build a brief",
    body: "Add case studies to your brief using the + button. Generate a cross-case AI report from Brief mode.",
    position: "bottom",
  },
  {
    id: "chat",
    targetSelector: "[data-onboard='chat-trigger']",
    title: "Ask HIVE",
    body: "The AI assistant knows what page you're on — ask about cases, options, or request a brief.",
    position: "bottom",
  },
];

interface TooltipBubbleProps {
  step: TooltipStep;
  onDismiss: () => void;
  onNext: () => void;
  isLast: boolean;
  current: number;
  total: number;
}

function TooltipBubble({ step, onDismiss, onNext, isLast, current, total }: TooltipBubbleProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const el = document.querySelector(step.targetSelector);
    if (el) setRect(el.getBoundingClientRect());
  }, [step.targetSelector]);

  if (!rect) return null;

  const offset = 12;
  const bubbleW = 280;

  let top = 0;
  let left = 0;

  if (step.position === "bottom") {
    top = rect.bottom + offset + window.scrollY;
    left = rect.left + rect.width / 2 - bubbleW / 2;
  } else if (step.position === "top") {
    top = rect.top - offset - 100 + window.scrollY;
    left = rect.left + rect.width / 2 - bubbleW / 2;
  } else if (step.position === "right") {
    top = rect.top + rect.height / 2 - 50 + window.scrollY;
    left = rect.right + offset;
  } else {
    top = rect.top + rect.height / 2 - 50 + window.scrollY;
    left = rect.left - bubbleW - offset;
  }

  // Keep bubble within viewport
  left = Math.max(12, Math.min(left, window.innerWidth - bubbleW - 12));

  return (
    <>
      {/* Highlight ring around target */}
      <div
        style={{
          position: "fixed",
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
          border: "2px solid #006853",
          borderRadius: 8,
          pointerEvents: "none",
          zIndex: 9998,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
        }}
        aria-hidden
      />

      {/* Tooltip bubble */}
      <div
        role="tooltip"
        aria-live="polite"
        style={{
          position: "absolute",
          top,
          left,
          width: bubbleW,
          background: "#0b0c0c",
          color: "#fff",
          borderRadius: 8,
          padding: "14px 16px",
          zIndex: 9999,
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          animation: "hive-fade-up 0.2s ease forwards",
        }}
      >
        {/* Step counter */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#6ee7b7",
            marginBottom: 4,
          }}
        >
          {current + 1} of {total}
        </div>

        <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 4px", color: "#fff" }}>
          {step.title}
        </p>
        <p style={{ fontSize: 12, lineHeight: 1.6, color: "#d1d5db", margin: "0 0 12px" }}>
          {step.body}
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={onDismiss}
            style={{
              fontSize: 11,
              color: "#9ca3af",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            Skip tour
          </button>
          <button
            onClick={onNext}
            style={{
              fontSize: 12,
              fontWeight: 700,
              background: "#006853",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "6px 14px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {isLast ? "Done" : "Next →"}
          </button>
        </div>
      </div>
    </>
  );
}

export function OnboardingTooltips() {
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        // Small delay so page elements are rendered
        setTimeout(() => setStep(0), 800);
      }
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    setStep(null);
  };

  const next = () => {
    if (step === null) return;
    if (step >= STEPS.length - 1) {
      dismiss();
    } else {
      setStep((s) => (s ?? 0) + 1);
    }
  };

  if (step === null) return null;

  const currentStep = STEPS[step];

  return (
    <TooltipBubble
      step={currentStep}
      onDismiss={dismiss}
      onNext={next}
      isLast={step === STEPS.length - 1}
      current={step}
      total={STEPS.length}
    />
  );
}
