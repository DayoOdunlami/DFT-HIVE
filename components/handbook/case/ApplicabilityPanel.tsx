"use client";

import type { CaseStudy } from "@/lib/hive/seed-data";

interface ApplicabilityPanelProps {
  cs: CaseStudy;
}

export function ApplicabilityPanel({ cs }: ApplicabilityPanelProps) {
  const isHigh = cs.transferability === "High";

  return (
    <div
      style={{
        border: `1px solid ${isHigh ? "#b3d4ef" : "#fde68a"}`,
        borderRadius: 12,
        padding: "16px 18px",
        background: isHigh ? "#f0f9ff" : "#fffbeb",
      }}
    >
      {/* Badge */}
      <div style={{ marginBottom: 10 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 20,
            background: isHigh ? "#d1fae5" : "#fef3c7",
            color: isHigh ? "#065f46" : "#92400e",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: isHigh ? "#10b981" : "#f59e0b",
              display: "inline-block",
            }}
          />
          {cs.transferability} UK transferability
        </span>
      </div>

      {/* Note */}
      <p
        style={{
          fontSize: 13,
          color: "#374151",
          lineHeight: 1.65,
          marginBottom: 12,
        }}
      >
        {cs.transferabilityNote}
      </p>

      {/* UK applicability tags */}
      {cs.ukApplicability.length > 0 && (
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "#6b7280",
              marginBottom: 8,
            }}
          >
            Applicable to
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {cs.ukApplicability.map((a) => (
              <span
                key={a}
                style={{
                  fontSize: 12,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: "#fff",
                  border: `1px solid ${isHigh ? "#b3d4ef" : "#fde68a"}`,
                  color: isHigh ? "#0369a1" : "#92400e",
                  fontWeight: 500,
                }}
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* UK region */}
      {cs.ukRegion && cs.ukRegion !== "—" && (
        <p
          style={{
            fontSize: 11,
            color: "#9ca3af",
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <svg
            width="11"
            height="11"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          {cs.ukRegion}
        </p>
      )}
    </div>
  );
}
