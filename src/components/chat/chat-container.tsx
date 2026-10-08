// Phase 1 — D3: Wire up local state, mock replies, auto-scroll, loading

"use client";

import { ChatMessage } from "@/types";
import { useEffect, useRef, useState } from "react";
import ChatInput from "./chat-input";
import MessageList from "./message-list";

// A small pool of mock Ayurveda responses to cycle through
const MOCK_RESPONSES = [
  "Ayurveda is a 5,000-year-old system of natural healing that originated in the Vedic culture of India. The term comes from Sanskrit: *ayur* (life) and *veda* (science or knowledge).",
  "The three Doshas — **Vata**, **Pitta**, and **Kapha** — are bio-energetic forces that govern all physical and mental processes in the body.",
  "Panchakarma is Ayurveda's primary purification and detoxification treatment. It consists of five procedures: Vamana, Virechana, Nasya, Basti, and Raktamokshana.",
  "Ashwagandha (*Withania somnifera*) is one of Ayurveda's most prized herbs, used to reduce stress, improve energy levels, and support overall vitality.",
  "In Ayurveda, digestion (*Agni*) is considered the cornerstone of health. A strong Agni ensures proper nutrient absorption and the prevention of toxin (*Ama*) accumulation.",
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
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll whenever messages change or loading state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSend(text: string) {
    // 1. Append the user message immediately
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // 2. Show loading indicator
    setIsLoading(true);

    // 3. Simulate network delay (500–1200 ms)
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 700)
    );

    // 4. Append mock assistant reply
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: getNextMockResponse(),
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 border-b px-4 py-3 bg-background">
        <span className="text-2xl" aria-hidden>
          🌿
        </span>
        <div>
          <h1 className="text-sm font-semibold leading-none">
            Ayurveda Assistant
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Powered by RAG · Gemini
          </p>
        </div>
      </header>

      {/* Scrollable message area */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Invisible scroll anchor */}
      <div ref={bottomRef} />

      {/* Fixed input bar */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
