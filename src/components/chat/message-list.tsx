import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatMessage } from "@/types";
import { ArrowUpRight, Bot, Sparkles } from "lucide-react";
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

  useEffect(() => {
    // Don't scroll if we're on the empty landing screen
    if (messages?.length === 0 && !isLoading) return;

    // Use a short timeout to ensure the DOM has fully updated and painted
    // before triggering the scroll, fixing occasional missed auto-scrolls.
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col"
    >
      {messages?.length === 0 && !isLoading ? (
        // Modern Tech Minimalist Empty State
        <div className="m-auto flex flex-col items-center py-2 sm:py-8 text-center max-w-2xl w-full animate-message-appear">
          {/* Glowing Emblem */}
          <div className="relative mb-5 sm:mb-6 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/25 shadow-md shadow-emerald-500/10">
            <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-600 dark:text-emerald-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
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
          <div className="inline-flex items-center gap-2 rounded-full bg-muted/80 border border-amber-500/40 dark:border-amber-500/30 px-3 py-1.5 text-[11px] text-muted-foreground mb-6 max-w-full">
            <span className="leading-snug">
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
