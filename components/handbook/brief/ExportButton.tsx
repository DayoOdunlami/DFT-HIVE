"use client";

interface BriefSection {
  section_key: string;
  section_title: string;
  content: string;
  confidence?: string;
}

interface ExportButtonProps {
  ids: string[];
  sections?: BriefSection[];
  disabled?: boolean;
}

export function ExportButton({ ids, sections, disabled }: ExportButtonProps) {
  const handleExport = async () => {
    try {
      const res = await fetch("/api/handbook/brief/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, sections: sections ?? [] }),
      });
      if (!res.ok) throw new Error("Export failed");
      const html = await res.text();
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
      }
    } catch {
      alert(
        "PDF export encountered an error. You can also use your browser's print function (Ctrl/Cmd+P) on the brief page."
      );
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled}
      aria-label="Export brief as PDF"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12,
        fontWeight: 600,
        padding: "6px 14px",
        borderRadius: 6,
        border: "1px solid #d1d5db",
        background: "#fff",
        color: "#374151",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontFamily: "inherit",
        transition: "all 0.15s",
      }}
    >
      <svg
        width="12"
        height="12"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      PDF
    </button>
  );
}
