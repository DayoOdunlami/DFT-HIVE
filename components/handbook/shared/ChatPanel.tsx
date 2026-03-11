"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useChatContext, type ChatMessage } from "./ChatContext";

interface ChatPanelProps {
  context: string;
  open: boolean;
  onClose: () => void;
}

interface ContextConfig {
  title: string;
  subtitle: string;
  placeholder: string;
  greeting: string;
  starters: string[];
}

const CONTEXT_CONFIGS: Record<string, ContextConfig> = {
  browse: {
    title: "Ask HIVE",
    subtitle: "109 curated case studies · answers grounded in evidence",
    placeholder: "Ask a question...",
    greeting:
      "What are you trying to find? I can search across 109 curated case studies and surface the most relevant adaptation evidence for your context.",
    starters: [
      "Flooding on rail corridors",
      "Urban heat — what works?",
      "High UK transferability cases",
      "Drainage options for highways",
    ],
  },
  options: {
    title: "Ask about options",
    subtitle: "Filtering & exploring this library",
    placeholder: "Ask about adaptation options...",
    greeting:
      "Ask me to help you explore the adaptation options library — by sector, hazard, measure type, or co-benefits.",
    starters: [
      "What options exist for coastal flooding on rail?",
      "Which measures have the most co-benefits?",
      "What's available for aviation heat resilience?",
      "Show me drainage options across all sectors",
    ],
  },
};

function getConfig(context: string): ContextConfig {
  if (context.startsWith("case:")) {
    const id = context.replace("case:", "");
    return {
      title: "Ask about this case",
      subtitle: `Discussing ${id}`,
      placeholder: "Ask about this case...",
      greeting: `I can help you understand this case study in depth — its relevance to your context, cost implications, or how it compares to similar cases.`,
      starters: [
        "Why is this relevant to my context?",
        "What are the costs and funding sources?",
        "Show me related cases",
        "How does this compare to UK practice?",
      ],
    };
  }
  if (context.startsWith("brief:")) {
    return {
      title: "Ask about this brief",
      subtitle: "Interrogate, reframe, or extend this report",
      placeholder: "Ask about this brief...",
      greeting:
        "I can help you explore and improve this brief — explain patterns, identify gaps, reframe for a specific audience, or check the confidence level of any section.",
      starters: [
        "What am I missing?",
        "Reframe for a rail audience",
        "What's the confidence level?",
        "Add coastal flooding cases",
      ],
    };
  }
  return CONTEXT_CONFIGS[context] ?? CONTEXT_CONFIGS.browse;
}

function SourceChip({ id }: { id: string }) {
  return (
    <Link
      href={`/handbook/${id}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 4,
        background: "#e8f1fb",
        color: "#1d70b8",
        border: "1px solid #b3d4ef",
        textDecoration: "none",
        whiteSpace: "nowrap",
        cursor: "pointer",
      }}
    >
      {id} ↗
    </Link>
  );
}

function MessageText({ text }: { text: string }) {
  const parts = text.split(/\b(ID_[\w]+)\b/);
  return (
    <>
      {parts.map((part, i) =>
        /^ID_[\w]+$/.test(part) ? (
          <SourceChip key={i} id={part} />
        ) : (
          <span
            key={i}
            dangerouslySetInnerHTML={{
              __html: part.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
            }}
          />
        )
      )}
    </>
  );
}

function TypingDots() {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 5,
          background: "#1d70b8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg
          width="12"
          height="12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#fff"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      <div
        style={{
          padding: "10px 14px",
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "12px 12px 12px 4px",
          display: "flex",
          gap: 4,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#9ca3af",
              animation: "hive-bounce 1.2s infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function ChatPanel({ context, open, onClose }: ChatPanelProps) {
  const { messages, setMessages } = useChatContext();
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const config = getConfig(context);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "ai", text: config.greeting }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput("");
    const userMsg: ChatMessage = { role: "user", text: q };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setTyping(true);
    try {
      const res = await fetch("/api/handbook/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, context }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", ...data }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const showStarters = messages.length <= 1 && !typing;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.18)",
            zIndex: 40,
          }}
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={config.title}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 420,
          background: "#fff",
          boxShadow: "-4px 0 32px rgba(0,0,0,0.1)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* DfT green stripe */}
        <div style={{ height: 5, background: "#006853", flexShrink: 0 }} />

        {/* Header */}
        <div
          style={{
            padding: "14px 16px 12px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "#1d70b8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#fff"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0b0c0c" }}>
                {config.title}
              </div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>
                {config.subtitle}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close chat"
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "#f3f4f6",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                marginBottom: 14,
                display: "flex",
                flexDirection: m.role === "user" ? "row-reverse" : "row",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              {m.role === "ai" && (
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 5,
                    background: "#1d70b8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              )}
              <div style={{ maxWidth: 300 }}>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    padding: "8px 12px",
                    borderRadius:
                      m.role === "user"
                        ? "12px 12px 4px 12px"
                        : "4px 12px 12px 12px",
                    background: m.role === "user" ? "#1d70b8" : "#f9fafb",
                    color: m.role === "user" ? "#fff" : "#111827",
                    border: m.role === "ai" ? "1px solid #e5e7eb" : "none",
                  }}
                >
                  <MessageText text={m.text} />
                  {m.gap && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: "7px 10px",
                        background: "#fef3c7",
                        borderRadius: 5,
                        fontSize: 11,
                        color: "#92400e",
                      }}
                    >
                      <span style={{ fontWeight: 700, color: "#b45309" }}>
                        Note:{" "}
                      </span>
                      {m.gap}
                    </div>
                  )}
                </div>
                {m.actions && m.actions.length > 0 && (
                  <div
                    style={{
                      marginTop: 6,
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    {m.actions.map((a, j) => (
                      <button
                        key={j}
                        onClick={() => send(a.label)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 5,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                          border: "none",
                          background: a.primary ? "#1d70b8" : "#f3f4f6",
                          color: a.primary ? "#fff" : "#374151",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {a.label}
                        {a.demo && (
                          <span
                            style={{
                              fontSize: 9,
                              background: "#fef3c7",
                              color: "#b45309",
                              padding: "1px 4px",
                              borderRadius: 2,
                            }}
                          >
                            DEMO
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {typing && <TypingDots />}

          {/* Starter questions */}
          {showStarters && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}
            >
              {config.starters.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  style={{
                    textAlign: "left",
                    fontSize: 12,
                    padding: "8px 12px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 6,
                    color: "#065f46",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    lineHeight: 1.4,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #e5e7eb",
            flexShrink: 0,
            background: "#fff",
          }}
        >
          {messages.length > 1 && (
            <button
              onClick={() => setMessages([])}
              style={{
                fontSize: 11,
                color: "#9ca3af",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0 0 8px",
                fontFamily: "inherit",
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              Clear conversation
            </button>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder={config.placeholder}
              aria-label={config.placeholder}
              style={{
                flex: 1,
                fontSize: 13,
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontFamily: "inherit",
                outline: "none",
                background: "#f9fafb",
                color: "#111827",
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim()}
              aria-label="Send message"
              style={{
                width: 36,
                height: 36,
                borderRadius: 6,
                background: input.trim() ? "#1d70b8" : "#e5e7eb",
                border: "none",
                cursor: input.trim() ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.15s",
              }}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke={input.trim() ? "#fff" : "#9ca3af"}
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 19V5m0 0l-7 7m7-7l7 7"
                />
              </svg>
            </button>
          </div>
          <p
            style={{
              fontSize: 10,
              color: "#9ca3af",
              margin: "6px 0 0",
              lineHeight: 1.4,
            }}
          >
            AI-generated · HIVE · Review source records before citing
          </p>
        </div>
      </div>
    </>
  );
}
