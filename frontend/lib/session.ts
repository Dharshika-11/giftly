/**
 * Session management — generates and persists an anonymous session ID.
 * Structured for easy replacement with proper auth later.
 */

const SESSION_KEY = "giftly_session_id";

function generateSessionId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr-session";

  try {
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch {
    // Private browsing or localStorage blocked
    return generateSessionId();
  }
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }
}
