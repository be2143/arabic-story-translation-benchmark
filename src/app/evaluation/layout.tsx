import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Translation evaluation",
  description: "Compare Arabic translations of social stories (evaluation study)",
};

export default function EvaluationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
