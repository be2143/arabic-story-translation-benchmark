import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dialect story evaluation",
  description: "Rate Arabic dialect social stories using DO, SC, SS, and DF metrics",
};

export default function DialectEvalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
