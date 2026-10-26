// ── Message & Conversation ─────────────────────────────────────────────────────

export interface Message {
  message_id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  recommendations?: GiftRecommendation[];
  isLoading?: boolean;
  hasError?: boolean;
  client_message_id?: string;
}

export interface GiftRecommendation {
  name: string;
  reason: string;
  price_range: string;
  category: string;
  personalization?: string;
  alternative?: string;
}

export interface ConversationSummary {
  conversation_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ConversationDetail {
  conversation_id: string;
  session_id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

// ── API Request/Response ───────────────────────────────────────────────────────

export interface ChatRequest {
  session_id: string;
  conversation_id: string;
  message: string;
  client_message_id: string;
}

export interface ChatResponse {
  conversation_id: string;
  message_id: string;
  content: string;
  recommendations: GiftRecommendation[];
  client_message_id: string;
}

export interface CreateConversationRequest {
  session_id: string;
  title?: string;
}

// ── UI State ───────────────────────────────────────────────────────────────────

export type BackendStatus = "checking" | "waking" | "ready" | "error";

export interface ApiError {
  message: string;
  code?: number;
}
