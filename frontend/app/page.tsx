import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Link from "next/link";
import { MessageSquare, Sparkles, Gift, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Giftly – Find a Gift They'll Actually Love",
  description:
    "Discover thoughtful, personalized gift ideas for birthdays, anniversaries, graduations, and more. Tell us who you're shopping for and we'll help you find the perfect gift.",
};

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: MessageSquare,
    title: "Tell us about them",
    desc: "Share who you're shopping for — their relationship to you, age, and what they love doing.",
    color: "from-brand-400 to-indigo-500",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "Share your budget",
    desc: "Let us know your budget range and any specific preferences or things to avoid.",
    color: "from-warm-400 to-brand-400",
  },
  {
    step: "03",
    icon: Gift,
    title: "Discover perfect ideas",
    desc: "Get a curated list of thoughtful gift ideas with personalization suggestions.",
    color: "from-indigo-400 to-purple-500",
  },
];

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />

      {/* How it Works */}
      <section
        id="how-it-works"
        className="py-24 px-4 bg-white"
        aria-labelledby="how-it-works-heading"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">
              Simple process
            </p>
            <h2
              id="how-it-works-heading"
              className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
            >
              Finding the right gift{" "}
              <span className="gradient-text">is easy</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              No more guessing. A few quick questions and you&apos;ll have
              ideas that feel personal and thoughtful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="relative text-center group"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Connector line */}
                  {index < HOW_IT_WORKS.length - 1 && (
                    <div
                      className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-gray-200 to-transparent"
                      aria-hidden="true"
                    />
                  )}

                  <div
                    className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-105 transition-transform duration-300`}
                  >
                    <Icon size={32} className="text-white" />
                  </div>
                  <div className="text-xs font-bold text-gray-300 mb-2 tracking-widest">
                    STEP {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 animated-bg" aria-labelledby="cta-heading">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            id="cta-heading"
            className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
          >
            Ready to find something{" "}
            <span className="gradient-text">memorable?</span>
          </h2>
          <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
            Stop scrolling through endless product pages. Tell us what you need
            and we&apos;ll point you in the right direction.
          </p>
          <Link href="/chat">
            <button
              id="cta-find-gift"
              className="btn-primary flex items-center gap-3 mx-auto px-10 py-5 text-lg"
            >
              <Gift size={22} />
              Start Finding Gifts
              <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-10 px-4" role="contentinfo">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gift size={18} className="text-brand-500" />
            <span className="font-bold text-gray-900">Giftly</span>
          </div>
          <p className="text-sm text-gray-400">
            Find gifts they&apos;ll actually love — for every occasion.
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <Link href="/chat" className="hover:text-brand-500 transition-colors">
              Find a gift
            </Link>
            <Link href="/#how-it-works" className="hover:text-brand-500 transition-colors">
              How it works
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
