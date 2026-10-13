import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatMessage } from "@/types";
import { ArrowUpRight, Bot } from "lucide-react";
import { useEffect, useRef } from "react";
import MessageBubble from "./message-bubble";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onSelectPrompt?: (prompt: string) => void;
}

const SUGGESTED_PROMPTS = [
  {
    icon: "👁️",
    title: "Ayurvedic Eye Care",
    description: "Netra Tarpana & ocular treatments",
    prompt:
      "What specialized Ayurvedic eye treatments does Sreedhareeyam offer for vision care and eye strain?",
  },
  {
    icon: "🌿",
    title: "Sunetra Herbal Eye Drops",
    description: "Botanical formulation for daily clarity",
    prompt:
      "What are the ingredients and benefits of Sreedhareeyam Sunetra herbal eye drops?",
  },
  {
    icon: "🏥",
    title: "Hospital & Heritage",
    description: "Koothattukulam & Nelliakkattu Mana",
    prompt:
      "Tell me about Sreedhareeyam Ayurvedic Eye Hospital's background, location in Kerala, and ancestral heritage.",
  },
  {
    icon: "🩺",
    title: "Chronic Eye Conditions",
    description: "Diabetic retinopathy & glaucoma care",
    prompt:
      "How does Sreedhareeyam manage conditions like diabetic retinopathy, glaucoma, and macular degeneration?",
  },
];

export default function MessageList({
  messages,
  isLoading = false,
  onSelectPrompt,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: smooth ? "smooth" : "instant",
    });
  };

  // Scroll when messages update or loading state changes
  useEffect(() => {
    // Don't scroll if we're on the empty landing screen
    if (messages?.length === 0 && !isLoading) return;

    // Short timeout ensures DOM has fully painted before scrolling
    const timer = setTimeout(() => scrollToBottom(), 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  // Re-scroll when the mobile on-screen keyboard opens/closes.
  // visualViewport fires "resize" when the keyboard changes the visible area.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleViewportResize = () => {
      // Only scroll if there is an active conversation
      if (!scrollRef.current) return;
      const hasContent = (messages?.length ?? 0) > 0 || isLoading;
      if (hasContent) {
        scrollToBottom(true);
      }
    };

    vv.addEventListener("resize", handleViewportResize);
    return () => vv.removeEventListener("resize", handleViewportResize);
  }, [messages, isLoading]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 min-h-0 overflow-y-auto scroll-smooth px-4 sm:px-6 py-4 sm:py-6 flex flex-col"
    >
      {messages?.length === 0 && !isLoading ? (
        // Modern Tech Minimalist Empty State
        <div className="m-auto flex flex-col items-center py-2 sm:py-8 text-center max-w-2xl w-full animate-message-appear">
          {/* Header-matching Herb Emblem with Animated Leaves */}
          <div className="group relative mb-5 sm:mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/10 transition-all duration-300 hover:scale-105 hover:bg-emerald-500/15">
            {/* Subtle ambient breathing aura */}
            <span
              className="absolute inset-0 rounded-2xl bg-emerald-500/10 animate-pulse pointer-events-none"
              aria-hidden
            />
            {/* Animated Leaves (Swaying Herb) */}
            <span
              className="relative text-2xl sm:text-3xl  inline-block animate-leaf-sway"
              aria-hidden
            >
              🌿
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-2">
            Sreedhareeyam Website Guide
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mb-3 leading-relaxed">
            Explore Ayurvedic Netra Chikitsa (eye care), products, and hospital
            therapies grounded on data from{" "}
            <a
              href="https://www.sreedhareeyam.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              sreedhareeyam.com
            </a>
            .
          </p>
          <div className="inline-flex text-center align-middle items-center gap-2 rounded-full bg-muted/80 dark:bg-amber-500/[0.08] border border-amber-500/40 dark:border-amber-500/35 px-3 py-1.5 text-[11px] text-muted-foreground dark:text-amber-200/85 mb-6 max-w-full select-none">
            <span className="leading-snug text-center select-none">
              Independent RAG learning project · Not officially affiliated with
              Sreedhareeyam
            </span>
          </div>

          {/* Interactive Suggestion Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
            {SUGGESTED_PROMPTS?.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPrompt?.(item.prompt)}
                className="group relative flex items-start gap-3 rounded-xl border border-border/80 bg-card p-3.5 hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:shadow-xs transition-all cursor-pointer"
              >
                <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-xs font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item?.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
          {messages?.map((msg) => (
            <MessageBubble key={msg?.id} message={msg} />
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 animate-message-appear">
              <Avatar className="h-8 w-8 shrink-0 mt-0.5 rounded-xl border border-border/50 shadow-xs">
                <AvatarFallback className="rounded-xl text-xs font-semibold flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-xs bg-card border border-border/70 dark:bg-[#1a2428] dark:border-border/40 px-4 py-3 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
