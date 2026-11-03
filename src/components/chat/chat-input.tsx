// Phase 1 — D4: Polish — Modern Tech Minimalist Floating Input Dock

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  value?: string;
  onChange?: (val: string) => void;
}

export default function ChatInput({
  onSend,
  isLoading = false,
  value: controlledValue,
  onChange: controlledOnChange,
}: ChatInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const setValue = (val: string) => {
    if (isControlled) {
      controlledOnChange?.(val);
    } else {
      setInternalValue(val);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const prevLoadingRef = useRef(isLoading);

  // Auto-focus input field after AI response or error completes (desktop only)
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
    <div className="w-full px-4 sm:px-6 lg:px-8 lg:pb-3 pb-4 pt-3 backdrop-blur-md bg-background-overlay border-t border-border/50">
      <form
        onSubmit={handleSubmit}
        onClick={(e) => {
          if (
            (e.target as HTMLElement).tagName !== "BUTTON" &&
            !(e.target as HTMLElement).closest("button")
          ) {
            inputRef.current?.focus();
          }
        }}
        className="relative flex items-center gap-2 rounded-2xl border-2 border-emerald-500/35 dark:border-emerald-400/35 bg-emerald-50/80 dark:bg-[#15231d] px-3.5 sm:px-4 py-2.5 lg:py-1.5 shadow-md shadow-emerald-500/5 dark:shadow-black/40 hover:border-emerald-500/50 dark:hover:border-emerald-400/50 focus-within:border-emerald-500 dark:focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/20 focus-within:shadow-lg focus-within:shadow-emerald-500/10 transition-all duration-300 ease-out"
      >
        <Input
          id="chat-input"
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask about hospital and treatments..."
          disabled={isLoading}
          className="flex-1 border-0 bg-transparent dark:bg-transparent disabled:bg-transparent dark:disabled:bg-transparent px-1 py-1 text-base font-medium placeholder:font-normal shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70 caret-emerald-500 dark:caret-emerald-400"
        />
        <div
          className={`flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out ${
            value
              ? "w-8.5 lg:w-7 opacity-100 scale-100 rotate-0"
              : "w-0 opacity-0 scale-50 -rotate-90"
          }`}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            tabIndex={value ? 0 : -1}
            onMouseDown={(e) => {
              // Prevent click from stealing focus on desktop
              e.preventDefault();
            }}
            onClick={() => {
              setValue("");
              const isDesktop =
                typeof window !== "undefined" &&
                !window.matchMedia("(pointer: coarse)").matches &&
                window.innerWidth >= 1024;

              if (isDesktop) {
                inputRef.current?.focus();
              }
            }}
            className="size-8 lg:size-7 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 cursor-pointer"
            aria-label="Clear input"
            title="Clear input"
          >
            <X className="size-5 lg:size-4 stroke-[2.25]" />
          </Button>
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={!value.trim() || isLoading}
          className="h-9 w-9 lg:h-8 lg:w-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-zinc-950 transition-all shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
          aria-label="Send message"
          title="Send message"
        >
          <ArrowUp className="h-4 w-4 stroke-[2.5]" />
        </Button>
      </form>
      <p className="mt-3 text-center text-xs text-muted-foreground/60 tracking-tight">
        Developed by{" "}
        <a
          href="https://github.com/harisankarsony"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-none hover:transition-colors hover:duration-150"
        >
          harisankarsony
        </a>
      </p>
    </div>
  );
}
