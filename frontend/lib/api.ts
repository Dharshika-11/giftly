/**
 * Centralized API client with retry, exponential backoff, and cold-start handling.
 */

import type {
  ChatRequest,
  ChatResponse,
  ConversationDetail,
  ConversationSummary,
  CreateConversationRequest,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Retry Configuration ────────────────────────────────────────────────────────
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;
const REQUEST_TIMEOUT_MS = 30000;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly isColdStart?: boolean
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestWithRetry<T>(
  path: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          errorData?.detail ||
          getHttpErrorMessage(response.status);
        throw new ApiError(message, response.status);
      }

      return response.json() as Promise<T>;
    } catch (err) {
      clearTimeout(timer);

      if (err instanceof ApiError && err.statusCode && err.statusCode < 500) {
        // 4xx errors are not retryable
        throw err;
      }

      lastError = err as Error;

      const isFinalAttempt = attempt === retries;
      if (!isFinalAttempt) {
        const waitMs = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await delay(waitMs);
      }
    }
  }

  // Determine if this looks like a cold-start scenario
  const isColdStart =
    lastError?.name === "AbortError" ||
    lastError?.message?.includes("fetch") ||
    lastError?.message?.includes("network");

  throw new ApiError(
    isColdStart
      ? "The gift assistant is taking a moment to wake up. Please try again."
      : lastError?.message || "Something went wrong. Please try again.",
    undefined,
    isColdStart
  );
}

function getHttpErrorMessage(status: number): string {
  switch (status) {
    case 404:
      return "Not found.";
    case 422:
      return "Invalid request.";
    case 503:
      return "Service temporarily unavailable. Please try again shortly.";
    case 502:
      return "Something went wrong while finding your gift. Please try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// ── API Functions ──────────────────────────────────────────────────────────────

export async function checkBackendHealth(): Promise<boolean> {
  try {
    await requestWithRetry<{ status: string }>("/api/wake", {}, 1);
    return true;
  } catch {
    return false;
  }
}

export async function createConversation(
  data: CreateConversationRequest
): Promise<ConversationDetail> {
  return requestWithRetry<ConversationDetail>("/api/conversations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getConversations(
  sessionId: string
): Promise<ConversationSummary[]> {
  return requestWithRetry<ConversationSummary[]>(
    `/api/conversations?session_id=${encodeURIComponent(sessionId)}`
  );
}

export async function getConversation(
  conversationId: string,
  sessionId: string
): Promise<ConversationDetail> {
  return requestWithRetry<ConversationDetail>(
    `/api/conversations/${conversationId}?session_id=${encodeURIComponent(sessionId)}`
  );
}

export async function deleteConversation(
  conversationId: string,
  sessionId: string
): Promise<void> {
  await requestWithRetry<void>(
    `/api/conversations/${conversationId}?session_id=${encodeURIComponent(sessionId)}`,
    { method: "DELETE" },
    1
  );
}

export async function sendMessage(data: ChatRequest): Promise<ChatResponse> {
  return requestWithRetry<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
