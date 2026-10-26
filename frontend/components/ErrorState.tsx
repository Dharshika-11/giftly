import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeLink?: boolean;
}

export default function ErrorState({
  title = "Something went wrong",
  message = "Something went wrong while finding your gift. Please try again.",
  onRetry,
  showHomeLink = false,
}: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[300px] text-center px-4 py-12"
      role="alert"
      aria-live="assertive"
    >
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
        <AlertTriangle size={28} className="text-red-400" />
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary flex items-center gap-2 py-2.5 px-6 text-sm"
            id="error-retry-btn"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        )}
        {showHomeLink && (
          <Link href="/">
            <button className="btn-secondary flex items-center gap-2 py-2.5 px-6 text-sm" id="error-home-btn">
              <Home size={15} />
              Go home
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
