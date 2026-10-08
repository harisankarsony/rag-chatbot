// Phase 1 — D2: Scrollable list of MessageBubble items

import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/types";
import MessageBubble from "./message-bubble";

interface MessageListProps {
  messages: ChatMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <ScrollArea className="flex-1 px-4 py-6">
      {messages.length === 0 ? (
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
        </div>
      )}
    </ScrollArea>
  );
}
