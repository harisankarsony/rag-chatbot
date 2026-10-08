// Phase 1 — D2: Main chat layout wrapper

"use client";

import { ChatMessage } from "@/types";
import { useState } from "react";
import ChatInput from "./chat-input";
import MessageList from "./message-list";

export default function ChatContainer() {
  // D3 will wire real logic here. For now: static empty state.
  const [messages] = useState<ChatMessage[]>([]);

  function handleSend(text: string) {
    // TODO (D3): handle send — add message to state, call API
    console.log("Message sent:", text);
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 border-b px-4 py-3 bg-background">
        <span className="text-2xl" aria-hidden>🌿</span>
        <div>
          <h1 className="text-sm font-semibold leading-none">Ayurveda Assistant</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Powered by RAG · Gemini
          </p>
        </div>
      </header>

      {/* Scrollable message area */}
      <MessageList messages={messages} />

      {/* Fixed input bar */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}
