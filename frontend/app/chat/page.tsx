"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Message, ConversationDetail } from "@/types";
import {
  createConversation,
  getConversation,
  sendMessage,
  ApiError,
} from "@/lib/api";
import { getSessionId } from "@/lib/session";
import { v4 as uuidv4 } from "uuid";
import ConversationSidebar from "@/components/ConversationSidebar";
import ChatWindow from "@/components/ChatWindow";
import LoadingState, { ColdStartBanner, OfflineBanner } from "@/components/LoadingState";
import { Gift, Menu, X, Wifi } from "lucide-react";
import Link from "next/link";

function ChatPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("id");
  const occasion = searchParams.get("occasion");

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState<string | null>(
    conversationId
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<
    "ready" | "waking" | "offline"
  >("ready");
  const [coldStartAttempt, setColdStartAttempt] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const initialized = useRef(false);

  // Load existing conversation when navigating to ?id=xxx
  useEffect(() => {
    if (conversationId && conversationId !== currentConvId) {
      setCurrentConvId(conversationId);
      loadConversation(conversationId);
    }
  }, [conversationId]);

  // Handle occasion from URL param (clicked from landing page)
  useEffect(() => {
    if (occasion && !initialized.current && messages.length === 0) {
      initialized.current = true;
      setInputValue(`I'm looking for a ${occasion} gift`);
    }
  }, [occasion]);

  async function loadConversation(id: string) {
    setPageLoading(true);
    try {
      const sessionId = getSessionId();
      const conv: ConversationDetail = await getConversation(id, sessionId);
      setMessages(conv.messages);
    } catch {
      // Conversation not found or error
      setMessages([]);
    } finally {
      setPageLoading(false);
    }
  }

  async function ensureConversation(): Promise<string> {
    if (currentConvId) return currentConvId;

    const sessionId = getSessionId();
    const conv = await createConversation({
      session_id: sessionId,
      title: "New Conversation",
    });
    setCurrentConvId(conv.conversation_id);
    router.replace(`/chat?id=${conv.conversation_id}`, { scroll: false });
    return conv.conversation_id;
  }

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const clientMessageId = uuidv4();
    const tempUserMessage: Message = {
      message_id: clientMessageId,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      client_message_id: clientMessageId,
    };

    setInputValue("");
    setMessages((prev) => [...prev, tempUserMessage]);
    setIsLoading(true);
    setBackendStatus("ready");

    try {
      const convId = await ensureConversation();
      const sessionId = getSessionId();

      const response = await sendMessage({
        session_id: sessionId,
        conversation_id: convId,
        message: text,
        client_message_id: clientMessageId,
      });

      const assistantMessage: Message = {
        message_id: response.message_id,
        role: "assistant",
        content: response.content,
        timestamp: new Date().toISOString(),
        recommendations: response.recommendations,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setBackendStatus("ready");
    } catch (err) {
      const apiErr = err as ApiError;
      const isColdStart = apiErr.isColdStart;

      if (isColdStart) {
        setBackendStatus("waking");
        setColdStartAttempt((prev) => prev + 1);
      } else {
        setBackendStatus("offline");
      }

      // Mark the user message as having an error
      setMessages((prev) =>
        prev.map((m) =>
          m.client_message_id === clientMessageId
            ? {
                ...m,
                hasError: false, // User message stays
              }
            : m
        )
      );

      // Add error assistant message
      const errorMessage: Message = {
        message_id: uuidv4(),
        role: "assistant",
        content: isColdStart
          ? "The gift assistant is waking up. Please try sending your message again in a moment."
          : apiErr.message ||
            "Something went wrong while finding your gift. Please try again.",
        timestamp: new Date().toISOString(),
        hasError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, currentConvId]);

  async function handleRetry(messageIndex: number) {
    // Find the user message before the error
    const errorMessage = messages[messageIndex];
    const userMessage = messages
      .slice(0, messageIndex)
      .reverse()
      .find((m) => m.role === "user");

    if (!userMessage) return;

    // Remove the error assistant message
    setMessages((prev) => prev.filter((_, i) => i !== messageIndex));
    setInputValue(userMessage.content);
  }

  function handleNewConversation() {
    setCurrentConvId(null);
    setMessages([]);
    setInputValue("");
    router.push("/chat", { scroll: false });
  }

  if (pageLoading) {
    return <LoadingState message="Loading your conversation..." />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <ConversationSidebar
        activeConversationId={currentConvId || undefined}
        onNewConversation={handleNewConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Open conversation history"
            id="sidebar-toggle"
          >
            <Menu size={20} />
          </button>

          <Link href="/" className="flex items-center gap-2 mr-auto">
            <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow">
              <Gift size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Giftly</span>
          </Link>

          {/* Backend status indicator */}
          {backendStatus === "waking" && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600">
              <Wifi size={13} className="animate-pulse" />
              <span className="hidden sm:inline">Waking up...</span>
            </div>
          )}

          <button
            onClick={handleNewConversation}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-xl transition-all"
            id="header-new-conversation"
            aria-label="Start new conversation"
          >
            <X size={13} />
            <span className="hidden sm:inline">New</span>
          </button>
        </header>

        {/* Status banners */}
        {backendStatus !== "ready" && (
          <div className="px-4 pt-3">
            {backendStatus === "waking" && (
              <ColdStartBanner attempt={coldStartAttempt} />
            )}
            {backendStatus === "offline" && <OfflineBanner />}
          </div>
        )}

        {/* Chat content */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow
            messages={messages}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSend={handleSend}
            onRetry={handleRetry}
            isLoading={isLoading}
            showWelcome={!currentConvId}
          />
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading..." />}>
      <ChatPageInner />
    </Suspense>
  );
}
