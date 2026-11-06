// Phase 1 — D5: Markdown rendering for assistant messages

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
            "rounded-xl text-sm font-semibold flex items-center justify-center transition-colors",
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
          "max-w-[85%] sm:max-w-[80%] lg:max-w-[75%] rounded-2xl px-4 py-3 text-base leading-relaxed tracking-normal transition-all",
          isUser
            ? "rounded-tr-xs bg-[#d9fdd3] text-[#111b21] border border-emerald-200/60 dark:bg-[#005c4b] dark:text-[#e9edef] dark:border-emerald-700/40 shadow-xs"
            : "rounded-tl-xs bg-card text-card-foreground border border-border/70 dark:bg-[#1a2428] dark:border-border/40 shadow-xs",
        )}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Headings
              h1: ({ children }) => (
                <h1 className="text-lg font-bold mb-2 mt-1 text-foreground">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-base font-semibold mb-1.5 mt-2 text-foreground">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold mb-1 mt-2 text-foreground/90">
                  {children}
                </h3>
              ),

              // Paragraphs
              p: ({ children }) => (
                <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
              ),

              // Bold & Italic
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-foreground/80">{children}</em>
              ),

              // Unordered list
              ul: ({ children }) => (
                <ul className="my-1.5 ml-4 space-y-0.5 list-disc marker:text-emerald-500 dark:marker:text-emerald-400">
                  {children}
                </ul>
              ),

              // Ordered list
              ol: ({ children }) => (
                <ol className="my-1.5 ml-4 space-y-0.5 list-decimal marker:text-emerald-500 dark:marker:text-emerald-400">
                  {children}
                </ol>
              ),

              li: ({ children }) => (
                <li className="leading-relaxed pl-0.5">{children}</li>
              ),

              // Inline code
              code: ({ children, className }) => {
                const isBlock = Boolean(className);
                if (isBlock) {
                  return <code className={className}>{children}</code>;
                }
                return (
                  <code className="rounded-md bg-emerald-500/10 dark:bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[0.8em] text-emerald-700 dark:text-emerald-300">
                    {children}
                  </code>
                );
              },

              // Code block
              pre: ({ children }) => (
                <pre className="my-2 rounded-xl bg-muted/80 dark:bg-black/50 border border-border/70 dark:border-zinc-700 px-4 py-3 overflow-x-auto font-mono text-[0.8em] leading-relaxed">
                  {children}
                </pre>
              ),

              // Blockquote
              blockquote: ({ children }) => (
                <blockquote className="my-2.5 border-l-2 border-emerald-500/70 dark:border-emerald-400 pl-3.5 italic text-foreground/80 dark:text-foreground/85">
                  {children}
                </blockquote>
              ),

              // Horizontal rule
              hr: () => (
                <hr className="my-3 border-0 border-t border-border/80 dark:border-zinc-600/80" />
              ),

              // Links
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer font-medium underline underline-offset-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-none hover:transition-colors hover:duration-150"
                >
                  {children}
                </a>
              ),

              // Tables (via remark-gfm)
              table: ({ children }) => (
                <div className="my-3 overflow-x-auto rounded-xl border border-border/80 dark:border-zinc-700 bg-muted/15 dark:bg-zinc-900/30 shadow-xs">
                  <table className="w-full text-sm border-collapse">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-muted/70 dark:bg-zinc-800/80 text-foreground border-b border-border/80 dark:border-zinc-700">
                  {children}
                </thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-border/60 dark:divide-zinc-700/80">
                  {children}
                </tbody>
              ),
              tr: ({ children }) => (
                <tr className="border-b border-border/60 dark:border-zinc-700/80 last:border-b-0 hover:bg-emerald-500/[0.06] transition-none hover:transition-colors hover:duration-150">
                  {children}
                </tr>
              ),
              th: ({ children }) => (
                <th className="px-3 py-2 text-left font-semibold text-foreground border-r border-border/70 dark:border-zinc-700 last:border-r-0 whitespace-nowrap">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-2 text-foreground/90 border-r border-border/60 dark:border-zinc-700/80 last:border-r-0 align-top leading-relaxed">
                  {children}
                </td>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
