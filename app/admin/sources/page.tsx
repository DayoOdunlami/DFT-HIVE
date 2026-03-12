// @ts-nocheck
"use client";

import { useEffect, useState } from "react";

type SourceCandidate = {
  id: string;
  url: string;
  title: string | null;
  suggested_by: "user" | "ai";
  ai_category: string | null;
  user_note: string | null;
  ai_assessment: string | null;
  status: "pending" | "approved" | "rejected" | "ingested";
  suggested_at: string;
};

const STATUS_BADGE: Record<string, { bg: string; color: string; border: string }> = {
  pending:  { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
  approved: { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" },
  rejected: { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
  ingested: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] ?? STATUS_BADGE.pending;
  return (
    <span style={{
      display: "inline-block",
      fontSize: 11,
      fontWeight: 700,
      padding: "2px 10px",
      borderRadius: 9999,
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      textTransform: "capitalize",
    }}>
      {status}
    </span>
  );
}

function SuggestedByBadge({ by }: { by: string }) {
  const isAI = by === "ai";
  return (
    <span style={{
      display: "inline-block",
      fontSize: 10,
      fontWeight: 700,
      padding: "2px 8px",
      borderRadius: 4,
      background: isAI ? "#f5f3ff" : "#f0fdf4",
      color: isAI ? "#6d28d9" : "#15803d",
      border: `1px solid ${isAI ? "#ddd6fe" : "#bbf7d0"}`,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
    }}>
      {by}
    </span>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function truncate(s: string | null, max = 60) {
  if (!s) return "—";
  return s.length > max ? s.slice(0, max) + "…" : s;
}

export default function AdminSourcesPage() {
  const [rows, setRows] = useState<SourceCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/source-candidates")
      .then(async (res) => {
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((d) => setRows(d.rows ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
      />
      <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'DM Sans', sans-serif", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
                Source Candidates
              </h1>
              <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                URLs suggested by users or flagged by HIVE AI for review.
              </p>
            </div>
            {!loading && !error && (
              <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#f3f4f6", border: "1px solid #e5e7eb", padding: "4px 12px", borderRadius: 6 }}>
                {rows.length} {rows.length === 1 ? "candidate" : "candidates"}
              </span>
            )}
          </div>

          {/* States */}
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: 14 }}>
              Loading…
            </div>
          )}
          {error && (
            <div style={{ padding: "16px 20px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Table */}
          {!loading && !error && rows.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: 14 }}>
              No source candidates yet.
            </div>
          )}

          {!loading && !error && rows.length > 0 && (
            <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    {["Source", "By", "Category", "User note", "AI assessment", "Status", "Suggested"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "10px 14px", maxWidth: 260 }}>
                        <div style={{ fontWeight: 600, color: "#111827", fontSize: 13, lineHeight: 1.4 }}>
                          {r.title || (
                            <span style={{ color: "#9ca3af", fontStyle: "italic", fontWeight: 400 }}>No title</span>
                          )}
                        </div>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 11, color: "#6366f1", wordBreak: "break-all", textDecoration: "none" }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                        >
                          {truncate(r.url, 50)}
                        </a>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <SuggestedByBadge by={r.suggested_by} />
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "#374151" }}>
                        {r.ai_category ? (
                          <code style={{ fontSize: 11, background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>
                            {r.ai_category}
                          </code>
                        ) : "—"}
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "#4b5563", maxWidth: 180 }}>
                        {truncate(r.user_note, 80)}
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "#4b5563", maxWidth: 200 }}>
                        {truncate(r.ai_assessment, 80)}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <StatusBadge status={r.status} />
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
                        {formatDate(r.suggested_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
