// Phase 2 — D8: Connected UI to /api/chat with Vercel AI SDK useChat()

"use client";

import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { AlertCircle, AlertTriangle, ArrowLeft, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ChatInput from "./chat-input";
import MessageList from "./message-list";
import ThemeToggle from "./theme-toggle";

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || msg.parts.length === 0) return "";
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export default function ChatContainer() {
  const [inputText, setInputText] = useState("");
  const [showDevWarning, setShowDevWarning] = useState(true);
  const lastPromptRef = useRef("");
  const prevErrorRef = useRef<Error | undefined>(undefined);

  const {
    messages: rawMessages,
    sendMessage,
    status,
    stop,
    setMessages: setRawMessages,
    error,
    clearError,
  } = useChat({
    onError: (err) => {
      console.error("Chat streaming error:", err);
      // Refill the input field with the user's message once so they can retry
      if (lastPromptRef.current) {
        setInputText(lastPromptRef.current);
        lastPromptRef.current = "";
      }
      // Remove the failed user message from the conversation list
      setRawMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.slice(0, -2);
        } else if (last?.role === "user") {
          return prev.slice(0, -1);
        }
        return prev;
      });
    },
  });

  const isLoading = status === "submitted" || status === "streaming";
  const chatPushedRef = useRef(false);

  // Sync refilled prompt once on error transition
  useEffect(() => {
    if (!prevErrorRef.current && error) {
      if (lastPromptRef.current) {
        setInputText(lastPromptRef.current);
        lastPromptRef.current = "";
      }
      setRawMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.slice(0, -2);
        } else if (last?.role === "user") {
          return prev.slice(0, -1);
        }
        return prev;
      });
    }
    prevErrorRef.current = error;
  }, [error, setRawMessages]);

  // Convert AI SDK UIMessages into our ChatMessage structure
  const messages: ChatMessage[] = useMemo(() => {
    return rawMessages
      .filter((m) => {
        if (m.role !== "user" && m.role !== "assistant") return false;
        // Keep assistant messages only once they have started streaming text
        if (m.role === "assistant" && !getUIMessageText(m)) return false;
        return true;
      })
      .map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: getUIMessageText(m),
      }));
  }, [rawMessages]);

  const hasConversation = messages.length > 0;

  function handleReset() {
    stop();
    setRawMessages([]);
    clearError();
    setInputText("");
    lastPromptRef.current = "";

    if (typeof window !== "undefined") {
      window.getSelection()?.removeAllRanges();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      if (chatPushedRef.current) {
        chatPushedRef.current = false;
        window.history.back();
      }
    }
  }

  // Handle browser back button (popstate)
  useEffect(() => {
    if (typeof window !== "undefined" && window.history.state?.chat) {
      window.history.replaceState(null, "");
    }

    function handlePopState() {
      chatPushedRef.current = false;
      stop();
      setRawMessages([]);
      clearError();
      setInputText("");
      lastPromptRef.current = "";
      window.getSelection()?.removeAllRanges();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      stop();
    };
  }, [stop, setRawMessages, clearError]);

  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    lastPromptRef.current = trimmed;
    setInputText("");

    if (!chatPushedRef.current && typeof window !== "undefined") {
      window.history.pushState({ chat: true }, "");
      chatPushedRef.current = true;
    }

    clearError();
    await sendMessage({ text: trimmed });
  }

  return (
    <div className="flex flex-col h-dvh w-full">
      {/* Frosted Modern Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/60 px-4 sm:px-6 lg:px-8 py-3 backdrop-blur-md bg-background-overlay">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={hasConversation ? handleReset : undefined}
            tabIndex={hasConversation ? 0 : -1}
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-xs outline-none shrink-0 overflow-hidden",
              hasConversation
                ? "hover:bg-emerald-500/20 transition-colors cursor-pointer"
                : "cursor-default pointer-events-none",
            )}
            title={hasConversation ? "Back to home" : ""}
            aria-label={hasConversation ? "Back to home" : "Sreedhareeyam Guide"}
          >
            <span
              className={`text-lg transition-all duration-300 ease-in-out ${
                hasConversation
                  ? "scale-0 -rotate-90 opacity-0"
                  : "scale-100 rotate-0 opacity-100"
              }`}
              aria-hidden
            >
              🌿
            </span>
            <ArrowLeft
              className={`absolute h-4 w-4 stroke-[2.25] transition-all duration-300 ease-in-out ${
                hasConversation
                  ? "scale-100 rotate-0 opacity-100"
                  : "scale-0 rotate-90 opacity-0"
              }`}
              aria-hidden
            />
          </button>
          <div>
            <div className="flex items-center gap-2 align-middle ">
              <span
                className={cn(
                  "text-base font-semibold tracking-tight text-foreground outline-none",
                )}
              >
                <p>Sreedhareeyam Guide</p>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 ">
                <p>RAG Chatbot</p>
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.75 ">
              Content from{" "}
              <a
                href="https://www.sreedhareeyam.com"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer underline underline-offset-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-none hover:transition-colors hover:duration-150"
              >
                sreedhareeyam.com
              </a>{" "}
              · Unofficial Demo
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Scrollable message area */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        onSelectPrompt={handleSend}
      />

      {/* Error Banner */}
      {error && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mb-2 p-3 rounded-2xl bg-destructive/10 border border-destructive/25 text-destructive text-sm flex items-center justify-between gap-3 shadow-xs animate-message-appear">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="truncate font-medium">
              An error has occured. Please retry.
            </p>
          </div>
          <button
            type="button"
            onClick={() => clearError()}
            className="p-1 rounded-lg hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Development Phase / Wrapper Warning Banner. Remove or update once RAG implementation is complete */}
      {showDevWarning && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mb-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 dark:bg-amber-500/15 dark:border-amber-500/30 text-amber-800 dark:text-amber-200 text-sm flex items-center justify-between gap-3 shadow-xs animate-message-appear">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="font-medium text-xs sm:text-sm leading-snug">
              Please note that this app is in development: Direct Gemini
              streaming is active, but website scraping and RAG retrieval from
              sreedhareeyam.com are still pending.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDevWarning(false)}
            className="p-1 rounded-lg hover:bg-amber-500/15 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-colors shrink-0 cursor-pointer"
            aria-label="Dismiss development notice"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Floating Input Dock */}
      <div className="shrink-0">
        <ChatInput
          value={inputText}
          onChange={setInputText}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
