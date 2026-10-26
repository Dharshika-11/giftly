import { Gift, Loader2, Wifi, WifiOff } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  variant?: "fullscreen" | "inline";
}

export default function LoadingState({
  message = "Getting your gift assistant ready...",
  submessage,
  variant = "fullscreen",
}: LoadingStateProps) {
  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500" role="status" aria-live="polite">
        <Loader2 size={14} className="animate-spin text-brand-500" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-soft-gradient"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="text-center px-4">
        {/* Animated icon */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-400 to-indigo-500 animate-pulse-soft" />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center">
            <Gift size={36} className="text-white animate-bounce-soft" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2">{message}</h2>
        {submessage && (
          <p className="text-sm text-gray-500 max-w-xs mx-auto">{submessage}</p>
        )}

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

export function ColdStartBanner({ attempt }: { attempt: number }) {
  return (
    <div
      className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800"
      role="alert"
      aria-live="polite"
    >
      <Wifi size={16} className="text-amber-500 flex-shrink-0 animate-pulse" />
      <div>
        <p className="font-semibold">Waking up the gift assistant...</p>
        {attempt > 1 && (
          <p className="text-xs text-amber-600 mt-0.5">
            Still connecting — this usually takes under 30 seconds.
          </p>
        )}
      </div>
    </div>
  );
}

export function OfflineBanner() {
  return (
    <div
      className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-800"
      role="alert"
    >
      <WifiOff size={16} className="text-red-400 flex-shrink-0" />
      <p>
        Unable to connect right now. Please check your connection and try again.
      </p>
    </div>
  );
}
