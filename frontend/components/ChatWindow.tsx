"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/types";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { Gift, Sparkles } from "lucide-react";

const QUICK_REPLIES = [
  { icon: "👧", label: "Sister" },
  { icon: "👦", label: "Brother" },
  { icon: "💑", label: "Partner" },
  { icon: "👫", label: "Friend" },
  { icon: "👨‍👩‍👦", label: "Parent" },
  { icon: "💼", label: "Colleague" },
];

interface ChatWindowProps {
  messages: Message[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onRetry?: (messageIndex: number) => void;
  isLoading: boolean;
  showWelcome?: boolean;
}

export default function ChatWindow({
  messages,
  inputValue,
  onInputChange,
  onSend,
  onRetry,
  isLoading,
  showWelcome = true,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleQuickReply = (label: string) => {
    onInputChange(label);
  };

  const showEmpty = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5"
        aria-label="Conversation"
        aria-live="polite"
        role="log"
      >
        {/* Welcome state */}
        {showEmpty && showWelcome && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center mb-6 shadow-xl">
              <Gift size={36} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 font-display">
              Let&apos;s find something they&apos;ll love.
            </h2>
            <p className="text-gray-500 max-w-sm mb-8 text-sm leading-relaxed">
              Tell me a little about the person you&apos;re shopping for and
              I&apos;ll help you discover thoughtful gift ideas.
            </p>

            {/* Who are you shopping for? */}
            <div className="w-full max-w-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                Who are you shopping for?
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply.label}
                    onClick={() => handleQuickReply(reply.label)}
                    className="chip"
                    id={`quick-reply-${reply.label.toLowerCase()}`}
                    aria-label={`Shopping for ${reply.label}`}
                  >
                    {reply.icon} {reply.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message, index) => (
          <MessageBubble
            key={message.message_id}
            message={message}
            onRetry={
              message.hasError && onRetry
                ? () => onRetry(index)
                : undefined
            }
          />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <MessageBubble
            message={{
              message_id: "loading",
              role: "assistant",
              content: "",
              timestamp: new Date().toISOString(),
              isLoading: true,
            }}
          />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-4">
        {/* Quick prompts when conversation has started */}
        {messages.length > 0 && messages.length < 4 && !isLoading && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
            {["My budget is ₹1000", "They love tech", "Something personalized"].map(
              (prompt) => (
                <button
                  key={prompt}
                  onClick={() => onInputChange(prompt)}
                  className="chip flex-shrink-0 text-xs"
                >
                  <Sparkles size={11} />
                  {prompt}
                </button>
              )
            )}
          </div>
        )}

        <ChatInput
          value={inputValue}
          onChange={onInputChange}
          onSend={onSend}
          disabled={isLoading}
          placeholder={
            messages.length === 0
              ? "Who are you shopping for? Start here..."
              : "Tell me more..."
          }
        />
      </div>
    </div>
  );
}
