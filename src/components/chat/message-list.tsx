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

  const baselineHeightRef = useRef(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      baselineHeightRef.current = window.innerHeight;
    }
  }, []);

  // Scroll when messages update or loading state changes
  useEffect(() => {
    // On empty landing screen, ensure view returns to the top
    if (messages?.length === 0 && !isLoading) {
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Short timeout ensures DOM has fully painted before scrolling
    const timer = setTimeout(() => scrollToBottom(), 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  // Re-scroll when the mobile on-screen keyboard opens/closes.
  // Handles device back button, gesture dismiss, and soft keyboard dismissal.
  useEffect(() => {
    const vv = window.visualViewport;

    const handleViewportResize = () => {
      if (!scrollRef.current) return;
      const currentHeight = window.innerHeight;

      // Track true baseline height when keyboard is not open
      if (
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        baselineHeightRef.current = Math.max(
          baselineHeightRef.current,
          currentHeight,
        );
      }

      const isKeyboardOpen = currentHeight < baselineHeightRef.current - 120;

      if (isKeyboardOpen) {
        // Scroll down when keyboard opens (both in conversation and homescreen)
        scrollToBottom(true);
      } else {
        // Keyboard closed via back button or gesture: smoothly return to top on homescreen
        if (messages?.length === 0 && !isLoading) {
          scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    };

    vv?.addEventListener("resize", handleViewportResize);
    window.addEventListener("resize", handleViewportResize);

    return () => {
      vv?.removeEventListener("resize", handleViewportResize);
      window.removeEventListener("resize", handleViewportResize);
    };
  }, [messages, isLoading]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 min-h-0 overflow-y-auto scroll-smooth px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col"
    >
      {messages?.length === 0 && !isLoading ? (
        // Modern Tech Minimalist Empty State
        <div className="m-auto flex flex-col items-center py-2 sm:py-8 text-center w-full animate-message-appear">
          {/* Header-matching Herb Emblem with Animated Leaves */}
          <div className="group cursor-default relative mb-5 sm:mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/10 transition-all duration-300 hover:scale-105 hover:bg-emerald-500/15">
            {/* Subtle ambient breathing aura */}
            <span
              className="absolute inset-0 rounded-2xl bg-emerald-500/10 animate-pulse pointer-events-none"
              aria-hidden
            />
            {/* Animated Leaves (Swaying Herb) */}
            <span
              className="relative text-2xl sm:text-3xl  inline-block animate-leaf-sway select-none"
              aria-hidden
            >
              🌿
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-2">
            Sreedhareeyam Website Guide
          </h2>
          <p className="text-base text-muted-foreground mb-3 leading-relaxed">
            Explore Ayurvedic Netra Chikitsa (eye care), products, and hospital
            therapies grounded on data from{" "}
            <a
              href="https://www.sreedhareeyam.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-none hover:transition-colors hover:duration-150"
            >
              sreedhareeyam.com
            </a>
            .
          </p>
          <div className="inline-flex text-center align-middle items-center gap-2 rounded-full bg-muted/80 dark:bg-amber-500/[0.08] border border-amber-500/40 dark:border-amber-500/35 px-3 py-1.5 text-xs text-muted-foreground dark:text-amber-200/85 mb-6 max-w-full select-none">
            <span className="leading-snug text-center select-none">
              <p>
                Independent RAG learning project · Not officially affiliated
                with Sreedhareeyam
              </p>
            </span>
          </div>

          {/* Interactive Suggestion Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full sm:w-fit max-w-full">
            {SUGGESTED_PROMPTS?.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPrompt?.(item.prompt)}
                className="group relative flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card px-4 py-3 sm:py-3.5 hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:shadow-xs transition-all cursor-pointer w-full text-left"
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0 pr-2 text-left">
                  <p className="text-sm sm:text-base font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item?.title}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground sm:whitespace-nowrap">
                    {item.description}
                  </p>
                </div>
                <ArrowUpRight className="h-[1.15rem] w-[1.15rem] lg:h-4 lg:w-4 text-muted-foreground/50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-auto" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 w-full">
          {messages?.map((msg) => (
            <MessageBubble key={msg?.id} message={msg} />
          ))}

          {/* Typing indicator — shows while waiting for the model to start streaming */}
          {isLoading &&
            (messages.length === 0 ||
              messages[messages.length - 1]?.role !== "assistant") && (
              <div className="flex items-start gap-3 animate-message-appear">
                <Avatar className="h-8 w-8 shrink-0 mt-0.5 rounded-xl border border-border/50 shadow-xs">
                  <AvatarFallback className="rounded-xl text-sm font-semibold flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
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
