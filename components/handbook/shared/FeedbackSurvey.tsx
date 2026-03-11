"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "hive-feedback-submitted-v1";
const VIEWS_KEY = "hive-case-study-views-v1";
const THRESHOLD = 3; // Show after 3+ case study views

type Rating = 1 | 2 | 3 | 4 | 5;

type SurveyState = "hidden" | "visible" | "submitted";

/** Call this each time a case study is viewed to track the counter. */
export function recordCaseStudyView() {
  try {
    const prev = parseInt(localStorage.getItem(VIEWS_KEY) ?? "0", 10);
    localStorage.setItem(VIEWS_KEY, String(prev + 1));
  } catch {
    // ignore
  }
}

export function FeedbackSurvey() {
  const [state, setState] = useState<SurveyState>("hidden");
  const [rating, setRating] = useState<Rating | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const submitted = localStorage.getItem(STORAGE_KEY);
      if (submitted) return;

      const views = parseInt(localStorage.getItem(VIEWS_KEY) ?? "0", 10);
      if (views >= THRESHOLD) {
        // Show with a small delay so it doesn't appear at the same time as page load
        setTimeout(() => setState("visible"), 2000);
      }
    } catch {
      // ignore
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {
      // ignore
    }
    setState("hidden");
  };

  const submit = async () => {
    if (!rating) return;
    setSubmitting(true);

    try {
      // Fire-and-forget — no backend required, GA4 event suffices
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "feedback_submitted", {
          rating,
          comment: comment.slice(0, 500),
        });
      }
      localStorage.setItem(STORAGE_KEY, "submitted");
      setState("submitted");
    } finally {
      setSubmitting(false);
    }
  };

  if (state === "hidden") return null;

  if (state === "submitted") {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: "#0b0c0c",
          color: "#fff",
          borderRadius: 12,
          padding: "16px 20px",
          zIndex: 400,
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          fontSize: 14,
          animation: "hive-fade-up 0.3s ease forwards",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 20 }}>✓</span>
        <span>Thank you for your feedback!</span>
        <button
          onClick={() => setState("hidden")}
          aria-label="Close"
          style={{
            background: "none",
            border: "none",
            color: "#9ca3af",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            padding: "0 0 0 8px",
          }}
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-labelledby="feedback-title"
      aria-modal="true"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "20px 20px 16px",
        width: 300,
        zIndex: 400,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        animation: "hive-fade-up 0.3s ease forwards",
      }}
    >
      {/* DfT green stripe */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "#006853",
          borderRadius: "12px 12px 0 0",
        }}
        aria-hidden
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <p
          id="feedback-title"
          style={{ fontSize: 14, fontWeight: 700, color: "#0b0c0c", margin: 0, lineHeight: 1.3 }}
        >
          How useful is HIVE?
        </p>
        <button
          onClick={dismiss}
          aria-label="Dismiss feedback survey"
          style={{
            background: "none",
            border: "none",
            color: "#9ca3af",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            padding: 0,
            marginLeft: 8,
          }}
        >
          ×
        </button>
      </div>

      <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12, lineHeight: 1.5 }}>
        You've viewed {THRESHOLD}+ case studies. Quick feedback helps us improve.
      </p>

      {/* Star rating */}
      <div
        role="group"
        aria-label="Rate HIVE from 1 to 5 stars"
        style={{ display: "flex", gap: 6, marginBottom: 12 }}
      >
        {([1, 2, 3, 4, 5] as Rating[]).map((r) => (
          <button
            key={r}
            onClick={() => setRating(r)}
            aria-label={`${r} star${r > 1 ? "s" : ""}`}
            aria-pressed={rating === r}
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              border: `1.5px solid ${rating && r <= rating ? "#006853" : "#d1d5db"}`,
              background: rating && r <= rating ? "#f0fdf4" : "#fff",
              cursor: "pointer",
              fontSize: 18,
              transition: "all 0.1s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "inherit",
            }}
          >
            {r <= (rating ?? 0) ? "★" : "☆"}
          </button>
        ))}
      </div>

      {/* Optional comment */}
      <label htmlFor="feedback-comment" style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, display: "block", marginBottom: 4 }}>
        What could be better? <span style={{ fontWeight: 400 }}>(optional)</span>
      </label>
      <textarea
        id="feedback-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        maxLength={500}
        placeholder="e.g. I need more maritime cases"
        style={{
          width: "100%",
          borderRadius: 4,
          border: "1px solid #d1d5db",
          padding: "6px 8px",
          fontSize: 12,
          fontFamily: "inherit",
          resize: "vertical",
          boxSizing: "border-box",
          outline: "none",
          marginBottom: 12,
        }}
      />

      <button
        onClick={submit}
        disabled={!rating || submitting}
        aria-label="Submit feedback"
        style={{
          width: "100%",
          padding: "10px",
          background: rating ? "#0b0c0c" : "#e5e7eb",
          color: rating ? "#fff" : "#9ca3af",
          border: "none",
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 700,
          cursor: rating ? "pointer" : "not-allowed",
          fontFamily: "inherit",
          transition: "all 0.15s",
        }}
      >
        {submitting ? "Sending…" : "Send feedback"}
      </button>
    </div>
  );
}
