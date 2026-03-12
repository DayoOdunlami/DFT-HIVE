"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChatContext } from "./ChatContext";
import { ChatTrigger } from "./ChatTrigger";
import { THEMES, type ThemeKey } from "@/lib/hive/themes";

const NAV_LINKS = [
  { href: "/handbook/cases", label: "Case Studies" },
  { href: "/handbook/brief", label: "Brief mode" },
  { href: "/handbook/options", label: "Options Library" },
];

export function HandbookNav() {
  const pathname = usePathname();
  const { chatOpen, openChat, closeChat, messages, briefIds, themeKey, setThemeKey } =
    useChatContext();

  const T = THEMES[themeKey];
  const hasMessages = messages.length > 1;
  const briefCount = briefIds.length;

  const handleChatToggle = () => {
    if (chatOpen) closeChat();
    else openChat();
  };

  const chatLabel = chatOpen
    ? "Close chat"
    : pathname?.startsWith("/handbook/brief")
      ? "Ask about this brief"
      : pathname?.match(/^\/handbook\/ID_/)
        ? "Ask about this case"
        : "Ask HIVE";

  return (
    <>
      {/* DfT green 5px stripe — DfT theme only, per GOV.UK / DfT branding */}
      {themeKey === "dft" && (
        <div aria-hidden="true" style={{ height: 5, background: "#006853" }} />
      )}

      {/* Nav bar */}
      <nav
        aria-label="HIVE handbook navigation"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: T.navBg,
          borderBottom: `1px solid ${T.border}`,
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Logo + links */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Link
              href="/handbook"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 5,
                  background: T.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="11"
                  height="11"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#fff"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064"
                  />
                </svg>
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: T.textPrimary,
                  fontFamily: "var(--font-dm-sans), Arial, sans-serif",
                }}
              >
                HIVE
              </span>
            </Link>

            <div
              style={{ display: "flex", alignItems: "center", gap: 4 }}
              role="list"
            >
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href === "/handbook/cases"
                    ? pathname === "/handbook/cases" || pathname?.startsWith("/handbook/cases/")
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    role="listitem"
                    data-onboard={link.href === "/handbook/brief" ? "brief-nav" : undefined}
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? T.accent : T.textSecondary,
                      textDecoration: "none",
                      padding: "4px 10px",
                      borderRadius: 5,
                      borderBottom: isActive
                        ? `2px solid ${T.accent}`
                        : "2px solid transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    {link.label}
                    {link.href === "/handbook/brief" && briefCount > 0 && (
                      <span
                        aria-label={`${briefCount} cases in brief`}
                        style={{
                          marginLeft: 5,
                          fontSize: 10,
                          fontWeight: 700,
                          background: T.accent,
                          color: "#fff",
                          padding: "1px 5px",
                          borderRadius: 10,
                        }}
                      >
                        {briefCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: theme switcher + chat trigger */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Theme picker */}
            <div
              aria-label="Theme"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderRadius: 20,
                padding: 2,
                border: `1px solid ${T.border}`,
                background: T.surfaceAlt,
              }}
            >
              {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setThemeKey(key)}
                  aria-label={`${THEMES[key].label} theme`}
                  aria-pressed={themeKey === key}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 9px",
                    borderRadius: 20,
                    border: "none",
                    cursor: "pointer",
                    background:
                      themeKey === key ? T.accent : "transparent",
                    color: themeKey === key ? "#fff" : T.textSecondary,
                    transition: "all 0.15s",
                  }}
                >
                  {THEMES[key].label}
                </button>
              ))}
            </div>

            <ChatTrigger
              onClick={handleChatToggle}
              hasMessages={hasMessages}
              label={chatLabel}
              data-onboard="chat-trigger"
            />
          </div>
        </div>
      </nav>
    </>
  );
}
