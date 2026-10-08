// Phase 1 — D3: Scrollable list + typing indicator

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatMessage } from "@/types";
import MessageBubble from "./message-bubble";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export default function MessageList({
  messages,
  isLoading = false,
}: MessageListProps) {
  return (
    <ScrollArea className="flex-1 px-4 py-6">
      {messages.length === 0 && !isLoading ? (
        // Empty state
        <div className="flex flex-col items-center justify-center h-full gap-3 text-center text-muted-foreground select-none">
          <span className="text-4xl">🌿</span>
          <p className="text-base font-medium">Ask me anything about Ayurveda</p>
          <p className="text-sm max-w-xs">
            I can answer questions about treatments, herbs, wellness practices,
            and more.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Typing indicator — three bouncing dots */}
          {isLoading && (
            <div className="flex items-end gap-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs font-semibold bg-emerald-700 text-white">
                  AI
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>
      )}
    </ScrollArea>
  );
}
