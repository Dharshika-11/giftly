import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gift Assistant",
  description: "Find the perfect gift with Giftly.",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
