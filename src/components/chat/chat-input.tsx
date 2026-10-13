// Phase 1 — D4: Polish — Modern Tech Minimalist Floating Input Dock

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export default function ChatInput({
  onSend,
  isLoading = false,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const prevLoadingRef = useRef(isLoading);

  // Auto-focus input field after AI response completes (desktop only, to avoid virtual keyboard pop-up on mobile)
  useEffect(() => {
    if (prevLoadingRef.current && !isLoading) {
      const isTouchMobile =
        window.matchMedia("(pointer: coarse)").matches ||
        window.innerWidth < 768;

      if (!isTouchMobile) {
        const timer = setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
        return () => clearTimeout(timer);
      }
    }
    prevLoadingRef.current = isLoading;
  }, [isLoading]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="w-full px-4 sm:px-6 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-5 pt-3 backdrop-blur-md bg-background-overlay border-t border-border/50">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center gap-2 rounded-2xl border-2 border-emerald-500/35 dark:border-emerald-400/35 bg-emerald-50/80 dark:bg-[#15231d] px-3.5 sm:px-4 py-2.5 sm:py-1.5 shadow-md shadow-emerald-500/5 dark:shadow-black/40 hover:border-emerald-500/50 dark:hover:border-emerald-400/50 focus-within:border-emerald-500 dark:focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/20 focus-within:shadow-lg focus-within:shadow-emerald-500/10 transition-all duration-300 ease-out"
      >
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask about hospital and treatments..."
          disabled={isLoading}
          className="flex-1 border-0 bg-transparent dark:bg-transparent disabled:bg-transparent dark:disabled:bg-transparent px-1 py-1 text-base sm:text-sm font-medium placeholder:font-normal shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70 caret-emerald-500 dark:caret-emerald-400"
        />
        <div
          className={`flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out ${
            value
              ? "w-7 opacity-100 scale-100 rotate-0"
              : "w-0 opacity-0 scale-50 -rotate-90"
          }`}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            tabIndex={value ? 0 : -1}
            onClick={() => {
              setValue("");
              inputRef.current?.focus();
            }}
            className="h-7 w-7 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 cursor-pointer"
            aria-label="Clear input"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={!value.trim() || isLoading}
          className="h-9 w-9 sm:h-8 sm:w-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-zinc-950 transition-all shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
          aria-label="Send message"
        >
          <ArrowUp className="h-4 w-4 stroke-[2.5]" />
        </Button>
      </form>
      <p className="mt-2 text-center text-[11px] text-muted-foreground/60 tracking-tight">
        Developed by{" "}
        <a
          href="https://github.com/harisankarsony"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          harisankarsony
        </a>
      </p>
    </div>
  );
}
