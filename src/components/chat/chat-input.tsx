// Phase 1 — D2: Input bar with Send button

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal } from "lucide-react";
import { FormEvent, useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export default function ChatInput({ onSend, isLoading = false }: ChatInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t bg-background px-4 py-3"
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask about Ayurveda..."
        disabled={isLoading}
        className="flex-1 rounded-full bg-muted focus-visible:ring-emerald-600"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!value.trim() || isLoading}
        className="rounded-full bg-emerald-700 hover:bg-emerald-800 shrink-0"
        aria-label="Send message"
      >
        <SendHorizonal className="h-4 w-4" />
      </Button>
    </form>
  );
}
