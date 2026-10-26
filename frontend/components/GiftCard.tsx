import type { GiftRecommendation } from "@/types";
import { Bookmark, Sparkles, Tag, Lightbulb, ArrowRight } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  Personalized: "bg-purple-100 text-purple-700",
  Tech: "bg-blue-100 text-blue-700",
  Fashion: "bg-pink-100 text-pink-700",
  Wellness: "bg-amber-100 text-amber-700",
  Books: "bg-green-100 text-green-700",
  Experience: "bg-indigo-100 text-indigo-700",
  Food: "bg-orange-100 text-orange-700",
  Sports: "bg-teal-100 text-teal-700",
  Art: "bg-rose-100 text-rose-700",
  Home: "bg-yellow-100 text-yellow-700",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Personalized: "✨",
  Tech: "⚡",
  Fashion: "👗",
  Wellness: "🌿",
  Books: "📚",
  Experience: "🎭",
  Food: "🍫",
  Sports: "⚽",
  Art: "🎨",
  Home: "🏠",
};

function getGiftEmoji(category: string): string {
  return CATEGORY_EMOJIS[category] || "🎁";
}

interface GiftCardProps {
  gift: GiftRecommendation;
  index: number;
}

export default function GiftCard({ gift, index }: GiftCardProps) {
  const categoryStyle =
    CATEGORY_COLORS[gift.category] || "bg-gray-100 text-gray-700";

  return (
    <div
      className="gift-card p-5 animate-slide-up group"
      style={{ animationDelay: `${index * 0.1}s` }}
      role="article"
      aria-label={`Gift suggestion: ${gift.name}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            {getGiftEmoji(gift.category)}
          </div>
          <div>
            <span className={`category-badge ${categoryStyle} text-xs mb-1.5`}>
              {gift.category}
            </span>
            <h3 className="font-bold text-gray-900 text-sm leading-snug">
              {gift.name}
            </h3>
          </div>
        </div>
        <button
          className="flex-shrink-0 p-2 rounded-xl hover:bg-brand-50 text-gray-400 hover:text-brand-500 transition-all"
          aria-label={`Save ${gift.name}`}
          title="Save this gift idea"
        >
          <Bookmark size={16} />
        </button>
      </div>

      {/* Price */}
      <div className="flex items-center gap-2 mb-4">
        <Tag size={13} className="text-brand-500" />
        <span className="price-tag text-sm">{gift.price_range}</span>
      </div>

      {/* Reason */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles size={12} className="text-brand-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Why they&apos;ll love it
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{gift.reason}</p>
      </div>

      {/* Personalization */}
      {gift.personalization && (
        <div className="bg-gradient-to-br from-brand-50 to-indigo-50 rounded-xl p-3.5 mb-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Lightbulb size={12} className="text-brand-600" />
            <span className="text-xs font-semibold text-brand-700 uppercase tracking-wide">
              Personal touch
            </span>
          </div>
          <p className="text-sm text-brand-800">{gift.personalization}</p>
        </div>
      )}

      {/* Alternative */}
      {gift.alternative && (
        <div className="flex items-start gap-2 pt-3 border-t border-gray-100">
          <ArrowRight size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-500">
            <span className="font-semibold">Alternative:</span>{" "}
            {gift.alternative}
          </p>
        </div>
      )}
    </div>
  );
}
