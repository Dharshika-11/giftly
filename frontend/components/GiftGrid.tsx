import type { GiftRecommendation } from "@/types";
import GiftCard from "./GiftCard";
import { Gift } from "lucide-react";

interface GiftGridProps {
  recommendations: GiftRecommendation[];
}

export default function GiftGrid({ recommendations }: GiftGridProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="mt-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Gift size={16} className="text-brand-500" />
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">
          Your gift ideas
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {recommendations.map((gift, index) => (
          <GiftCard key={`${gift.name}-${index}`} gift={gift} index={index} />
        ))}
      </div>
    </div>
  );
}
