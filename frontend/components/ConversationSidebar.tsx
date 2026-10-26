"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ConversationSummary } from "@/types";
import { getConversations, deleteConversation } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  MessageSquare,
  Trash2,
  Gift,
  ChevronLeft,
  X,
} from "lucide-react";

interface ConversationSidebarProps {
  activeConversationId?: string;
  onNewConversation: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ConversationSidebar({
  activeConversationId,
  onNewConversation,
  isOpen,
  onClose,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadConversations();
  }, [activeConversationId]);

  async function loadConversations() {
    try {
      const sessionId = getSessionId();
      const convs = await getConversations(sessionId);
      setConversations(convs);
    } catch {
      // Silently fail — sidebar is non-critical
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(
    e: React.MouseEvent,
    conversationId: string
  ) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Remove this conversation?")) return;

    setDeletingId(conversationId);
    try {
      const sessionId = getSessionId();
      await deleteConversation(conversationId, sessionId);
      setConversations((prev) =>
        prev.filter((c) => c.conversation_id !== conversationId)
      );
      if (activeConversationId === conversationId) {
        router.push("/chat");
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gift size={18} className="text-brand-500" />
            <h2 className="font-bold text-gray-900 text-sm">Your conversations</h2>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        <button
          id="new-conversation-btn"
          onClick={() => {
            onNewConversation();
            onClose();
          }}
          className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm"
          aria-label="Start a new conversation"
        >
          <Plus size={16} />
          New conversation
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl shimmer"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-10">
            <MessageSquare
              size={32}
              className="text-gray-200 mx-auto mb-3"
              aria-hidden="true"
            />
            <p className="text-sm text-gray-400">
              No conversations yet.
              <br />
              Start finding a gift!
            </p>
          </div>
        ) : (
          <div className="space-y-1" role="list" aria-label="Conversation history">
            {conversations.map((conv) => {
              const isActive = conv.conversation_id === activeConversationId;
              return (
                <Link
                  key={conv.conversation_id}
                  href={`/chat?id=${conv.conversation_id}`}
                  onClick={onClose}
                  role="listitem"
                >
                  <div
                    className={`sidebar-item ${isActive ? "active" : ""} group flex items-center gap-3`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <MessageSquare
                      size={15}
                      className={`flex-shrink-0 ${
                        isActive ? "text-brand-500" : "text-gray-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isActive ? "text-brand-700" : "text-gray-700"
                        }`}
                      >
                        {conv.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(conv.updated_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <button
                      onClick={(e) =>
                        handleDelete(e, conv.conversation_id)
                      }
                      className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all flex-shrink-0 ${
                        deletingId === conv.conversation_id ? "opacity-100" : ""
                      }`}
                      aria-label={`Delete conversation: ${conv.title}`}
                      title="Delete conversation"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-100">
        <Link href="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft size={14} />
          Back to home
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 h-full flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Conversation history"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="relative z-10 w-80 max-w-[85vw] bg-white h-full shadow-2xl animate-slide-in-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
