"use client";

interface ChatTriggerProps {
  onClick: () => void;
  hasMessages: boolean;
  label?: string;
  "data-onboard"?: string;
}

export function ChatTrigger({
  onClick,
  hasMessages,
  label = "Ask HIVE",
  "data-onboard": dataOnboard,
}: ChatTriggerProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      data-onboard={dataOnboard}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        fontWeight: 600,
        padding: "6px 12px",
        borderRadius: 6,
        background: "#1d70b8",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "background 0.15s",
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      <svg
        width="14"
        height="14"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      {label}
      {hasMessages && (
        <span
          aria-label="Active conversation"
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#22c55e",
            display: "inline-block",
            marginLeft: 2,
          }}
        />
      )}
    </button>
  );
}
