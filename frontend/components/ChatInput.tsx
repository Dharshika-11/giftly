"use client";

import { useRef, useEffect, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Type your message...",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  };

  const canSend = !disabled && value.trim().length > 0;

  return (
    <div className="relative flex items-end gap-2">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          id="chat-message-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          maxLength={2000}
          className="chat-input pr-14 disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Message input"
          aria-multiline="true"
        />

        {/* Send button inside input */}
        <button
          id="chat-send-button"
          onClick={onSend}
          disabled={!canSend}
          aria-label="Send message"
          className={`absolute right-2 bottom-2 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
            canSend
              ? "bg-brand-gradient shadow-md hover:shadow-lg hover:scale-105 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Send size={16} className={canSend ? "translate-x-0.5" : ""} />
        </button>
      </div>

      <p className="absolute -bottom-5 right-0 text-xs text-gray-400">
        {disabled ? "Finding ideas..." : "Enter to send · Shift+Enter for new line"}
      </p>
    </div>
  );
}
