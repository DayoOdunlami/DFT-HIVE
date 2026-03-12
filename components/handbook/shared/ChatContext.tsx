"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { THEMES, type ThemeKey, type Theme } from "@/lib/hive/themes";

export type ChatMessage = {
  role: "user" | "ai";
  text: string;
  chips?: string[];
  gap?: string | null;
  actions?: Array<{ label: string; primary?: boolean; demo?: boolean }>;
  sources?: string[];
  retrieval_mode?: "rag" | "fallback";
};

type HandbookContextType = {
  chatOpen: boolean;
  chatContext: string;
  messages: ChatMessage[];
  setChatOpen: (open: boolean) => void;
  setChatContext: (ctx: string) => void;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  openChat: (context?: string) => void;
  closeChat: () => void;
  briefIds: string[];
  addToBrief: (id: string) => void;
  removeFromBrief: (id: string) => void;
  clearBrief: () => void;
  themeKey: ThemeKey;
  setThemeKey: (key: ThemeKey) => void;
  theme: Theme;
  sessionIntent: string;
  setSessionIntent: (intent: string) => void;
  retrievalMode: "rag" | "fallback" | null;
  setRetrievalMode: (mode: "rag" | "fallback" | null) => void;
};

const HandbookContext = createContext<HandbookContextType | null>(null);

const SESSION_INTENT_KEY = "hiveSessionIntent";

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState("browse");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [briefIds, setBriefIds] = useState<string[]>([]);
  const [themeKey, setThemeKey] = useState<ThemeKey>("light");
  const [sessionIntent, setSessionIntentState] = useState("");
  const [retrievalMode, setRetrievalMode] = useState<
    "rag" | "fallback" | null
  >(null);
  const theme = THEMES[themeKey];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(SESSION_INTENT_KEY);
    if (stored) setSessionIntentState(stored);
  }, []);

  const setSessionIntent = useCallback((intent: string) => {
    setSessionIntentState(intent);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_INTENT_KEY, intent);
    }
  }, []);

  const openChat = useCallback(
    (context?: string) => {
      if (context) setChatContext(context);
      setChatOpen(true);
    },
    []
  );

  const closeChat = useCallback(() => setChatOpen(false), []);

  const addToBrief = useCallback((id: string) => {
    setBriefIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const removeFromBrief = useCallback((id: string) => {
    setBriefIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const clearBrief = useCallback(() => setBriefIds([]), []);

  return (
    <HandbookContext.Provider
      value={{
        chatOpen,
        chatContext,
        messages,
        setChatOpen,
        setChatContext,
        setMessages,
        openChat,
        closeChat,
        briefIds,
        addToBrief,
        removeFromBrief,
        clearBrief,
        themeKey,
        setThemeKey,
        theme,
        sessionIntent,
        setSessionIntent,
        retrievalMode,
        setRetrievalMode,
      }}
    >
      {children}
    </HandbookContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(HandbookContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
}
