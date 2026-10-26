"use client";

import Link from "next/link";
import { useState } from "react";
import { Gift, Menu, X, Sparkles } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-4 glass-card rounded-2xl px-5 py-3.5 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="Giftly home"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Gift size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight gradient-text">
              Giftly
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/#how-it-works">How it works</NavLink>
            <NavLink href="/#occasions">Gift ideas</NavLink>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/chat">
              <button
                className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm"
                id="nav-find-gift"
              >
                <Sparkles size={15} />
                Find a Gift
              </button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-brand-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 glass-card rounded-2xl p-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              <MobileNavLink
                href="/#how-it-works"
                onClick={() => setMenuOpen(false)}
              >
                How it works
              </MobileNavLink>
              <MobileNavLink
                href="/#occasions"
                onClick={() => setMenuOpen(false)}
              >
                Gift ideas
              </MobileNavLink>
              <div className="pt-3 border-t border-brand-100">
                <Link href="/chat" onClick={() => setMenuOpen(false)}>
                  <button className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm" id="nav-mobile-find-gift">
                    <Sparkles size={15} />
                    Find a Gift
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-brand-600 rounded-xl hover:bg-brand-50 transition-all"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600 rounded-xl transition-all"
    >
      {children}
    </Link>
  );
}
