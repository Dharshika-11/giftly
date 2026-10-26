"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Star } from "lucide-react";

const OCCASIONS = [
  { emoji: "🎂", label: "Birthday", color: "from-pink-50 to-rose-50" },
  { emoji: "💍", label: "Anniversary", color: "from-purple-50 to-indigo-50" },
  { emoji: "🎓", label: "Graduation", color: "from-blue-50 to-cyan-50" },
  { emoji: "💒", label: "Wedding", color: "from-amber-50 to-yellow-50" },
  { emoji: "🎄", label: "Christmas", color: "from-green-50 to-emerald-50" },
  { emoji: "❤️", label: "Just Because", color: "from-red-50 to-pink-50" },
];

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-16 px-4"
      aria-labelledby="hero-heading"
    >
      {/* Background orbs */}
      <div
        className="orb w-[500px] h-[500px] bg-brand-300 top-[-100px] right-[-150px]"
        aria-hidden="true"
      />
      <div
        className="orb w-[400px] h-[400px] bg-warm-300 bottom-[-50px] left-[-100px]"
        aria-hidden="true"
      />
      <div
        className="orb w-[300px] h-[300px] bg-indigo-300 top-[30%] left-[10%]"
        aria-hidden="true"
      />

      {/* Animated background */}
      <div className="absolute inset-0 animated-bg opacity-40" aria-hidden="true" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-8 animate-fade-in shadow-sm">
          <Sparkles size={14} className="text-brand-500" />
          <span className="text-sm font-medium text-brand-700">
            Thoughtful gifts for every occasion
          </span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} fill="#f59e3c" className="text-warm-400" />
            ))}
          </div>
        </div>

        {/* Headline */}
        <h1
          id="hero-heading"
          className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          Find a gift they&apos;ll{" "}
          <span className="gradient-text italic">actually love.</span>
        </h1>

        {/* Subheading */}
        <p
          className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          Tell us who you&apos;re shopping for, what they love, and your budget.
          We&apos;ll help you narrow it down to something truly thoughtful.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <Link href="/chat">
            <button
              id="hero-find-gift"
              className="btn-primary flex items-center gap-2.5 px-8 py-4 text-lg"
            >
              <Sparkles size={18} />
              Find My Gift
              <ArrowRight size={18} />
            </button>
          </Link>
          <Link href="/#how-it-works">
            <button className="btn-secondary px-8 py-4 text-base">
              See how it works
            </button>
          </Link>
        </div>

        {/* Occasion Cards */}
        <div
          id="occasions"
          className="animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5">
            Popular occasions
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {OCCASIONS.map((occasion) => (
              <Link
                href={`/chat?occasion=${encodeURIComponent(occasion.label)}`}
                key={occasion.label}
              >
                <div
                  className={`occasion-card bg-gradient-to-br ${occasion.color} group`}
                  role="button"
                  aria-label={`Find ${occasion.label} gifts`}
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                    {occasion.emoji}
                  </div>
                  <p className="text-xs font-semibold text-gray-700">
                    {occasion.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Floating preview cards */}
      <div className="relative z-10 max-w-4xl mx-auto w-full mt-16 animate-slide-up hidden lg:block" style={{ animationDelay: "0.5s" }}>
        <PreviewCards />
      </div>
    </section>
  );
}

function PreviewCards() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[
        {
          emoji: "📸",
          title: "Personalized Photo Book",
          price: "₹1,200 – ₹2,500",
          tag: "Personalized",
          tagColor: "bg-purple-100 text-purple-700",
        },
        {
          emoji: "🎧",
          title: "Wireless Noise-Cancelling Headphones",
          price: "₹3,000 – ₹8,000",
          tag: "Tech",
          tagColor: "bg-blue-100 text-blue-700",
        },
        {
          emoji: "🕯️",
          title: "Luxury Scented Candle Set",
          price: "₹800 – ₹2,000",
          tag: "Wellness",
          tagColor: "bg-amber-100 text-amber-700",
        },
      ].map((card) => (
        <div
          key={card.title}
          className="gift-card flex-1 p-5 min-w-0 opacity-70 hover:opacity-100 pointer-events-none"
        >
          <div className="text-3xl mb-3">{card.emoji}</div>
          <div className={`category-badge ${card.tagColor} mb-3`}>
            {card.tag}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm mb-2 leading-snug">
            {card.title}
          </h3>
          <p className="price-tag text-xs inline-block">{card.price}</p>
        </div>
      ))}
    </div>
  );
}
