// Phase 1 — D4: Polish — theme toggle + mobile responsive

"use client";

import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import ChatInput from "./chat-input";
import MessageList from "./message-list";
import ThemeToggle from "./theme-toggle";

// Sreedhareeyam-specific mock responses (for Phase 1 UI simulation)
const MOCK_RESPONSES = [
  "**Sreedhareeyam Ayurvedic Eye Hospital & Research Centre** is based in Koothattukulam, Kerala. It specializes in traditional Ayurvedic Netra Chikitsa (ophthalmology) combined with modern diagnostic standards.",
  "Sreedhareeyam provides non-invasive Ayurvedic therapies such as **Netra Tarpana**, **Aschyothana**, and **Seka** for complex conditions including diabetic retinopathy, glaucoma, macular degeneration, and dry eye syndrome.",
  "Sreedhareeyam manufactures authentic formulations such as **Sunetra herbal eye drops**, prepared with classical ingredients like Triphala, Tulsi, and Rose water to relieve digital eye strain and maintain ocular clarity.",
  "The heritage of Sreedhareeyam originates from the historic **Nelliakkattu Mana**, an ancestral Ayurvedic physician family renowned across centuries for specialized ophthalmic wisdom and holistic healing.",
  "*(Disclaimer: This is an independent RAG educational project and is not directly affiliated with or endorsed by Sreedhareeyam Ayurvedic Eye Hospital).* Sreedhareeyam also operates wellness and OP centers across India.",
];

let mockIndex = 0;
function getNextMockResponse(): string {
  const response = MOCK_RESPONSES[mockIndex % MOCK_RESPONSES.length];
  mockIndex++;
  return response;
}

export default function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasConversation = messages?.length > 0;

  async function handleSend(text: string) {
    // 1. Append the user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      role: "user",
      content: text,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // 2. Show loading indicator
    setIsLoading(true);

    // 3. Simulate network delay (500–1200 ms)
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 700),
    );

    // 4. Append mock assistant reply
    const assistantMessage: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      role: "assistant",
      content: getNextMockResponse(),
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col h-dvh w-full max-w-4xl mx-auto">
      {/* Frosted Modern Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/60 px-4 sm:px-6 py-3 backdrop-blur-md bg-background-overlay">
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!hasConversation}
            onClick={() => {
              setIsLoading(false);
              setMessages([]);
            }}
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-xs outline-none shrink-0 overflow-hidden",
              hasConversation
                ? "hover:bg-emerald-500/20 transition-colors cursor-pointer"
                : "cursor-default",
            )}
            title={hasConversation ? "Back to home" : ""}
            aria-label={hasConversation ? "Back to home" : ""}
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!hasConversation || isLoading}
                onClick={() => {
                  if (!isLoading) setMessages([]);
                }}
                className={cn(
                  "text-sm font-semibold tracking-tight text-foreground outline-none",
                )}
              >
                Sreedhareeyam Guide
              </button>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                RAG Project
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Knowledge from{" "}
              <a
                href="https://www.sreedhareeyam.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
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

      {/* Floating Input Dock */}
      <div className="shrink-0">
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
