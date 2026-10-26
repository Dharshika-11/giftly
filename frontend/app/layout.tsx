import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Giftly",
    default: "Giftly – Find a Gift They'll Actually Love",
  },
  description:
    "Tell us who you're shopping for and your budget. Giftly helps you find thoughtful, personalized gift ideas for any occasion.",
  keywords: [
    "gift ideas",
    "gift finder",
    "personalized gifts",
    "birthday gifts",
    "gift recommendation",
    "gift shopping",
  ],
  openGraph: {
    title: "Giftly – Smart Gift Recommendations",
    description: "Find thoughtful, personalized gift ideas for any occasion.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
