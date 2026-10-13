// Phase 1 — D4: Polish — Modern Tech Minimalist Message Bubble

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types";
import { Bot, User } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-full animate-message-appear",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Sleek Modern Avatar */}
      <Avatar className="h-8 w-8 shrink-0 mt-0.5 rounded-xl border border-border/50 shadow-xs">
        <AvatarFallback
          className={cn(
            "rounded-xl text-xs font-semibold flex items-center justify-center transition-colors",
            isUser
              ? "bg-[#00a884] text-white"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Bubble Container */}
      <div
        className={cn(
          "max-w-[80%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed tracking-normal transition-all",
          isUser
            ? "rounded-tr-xs bg-[#d9fdd3] text-[#111b21] border border-emerald-200/60 dark:bg-[#005c4b] dark:text-[#e9edef] dark:border-emerald-700/40 shadow-xs"
            : "rounded-tl-xs bg-card text-card-foreground border border-border/70 dark:bg-[#1a2428] dark:border-border/40 shadow-xs",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
