import type { Message } from "@/types";
import { format } from "date-fns";
import GiftGrid from "./GiftGrid";
import { AlertCircle, RefreshCw } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  onRetry?: () => void;
}

export default function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const timestamp = message.timestamp
    ? format(new Date(message.timestamp), "h:mm a")
    : "";

  if (message.isLoading) {
    return (
      <div className="flex items-end gap-3 animate-fade-in" role="status" aria-label="Thinking">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
          G
        </div>
        <div className="message-assistant px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
            <span className="sr-only">Finding gift ideas...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} items-end gap-3 animate-fade-in`}
    >
      {/* Avatar for assistant */}
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold mb-0.5"
          aria-hidden="true"
        >
          G
        </div>
      )}

      <div className={`max-w-[80%] sm:max-w-[72%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {/* Message bubble */}
        <div
          className={`${
            isUser ? "message-user px-5 py-3.5" : "message-assistant px-5 py-4"
          }`}
          aria-label={isUser ? "Your message" : "Assistant message"}
        >
          {message.hasError ? (
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className={`text-sm leading-relaxed ${isUser ? "text-white/90" : "text-red-600"}`}>
                  {message.content}
                </p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-brand-500 hover:text-brand-700 transition-colors"
                    aria-label="Retry sending message"
                  >
                    <RefreshCw size={12} />
                    Try again
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p
              className={`text-sm leading-relaxed whitespace-pre-wrap ${
                isUser ? "text-white" : "text-gray-800"
              }`}
            >
              {message.content}
            </p>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span className="text-xs text-gray-400 px-1">
            {timestamp}
          </span>
        )}

        {/* Gift Recommendations */}
        {!isUser &&
          message.recommendations &&
          message.recommendations.length > 0 && (
            <div className="w-full">
              <GiftGrid recommendations={message.recommendations} />
            </div>
          )}
      </div>

      {/* Avatar for user */}
      {isUser && (
        <div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-warm-400 to-brand-400 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold mb-0.5"
          aria-hidden="true"
        >
          U
        </div>
      )}
    </div>
  );
}
