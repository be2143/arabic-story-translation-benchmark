"use client";

import { DialectEvalProvider } from "@/context/DialectEvalContext";
import DialectEvalPhaseRouter from "@/dialect-eval/DialectEvalPhaseRouter";

export default function DialectEvalPage() {
  return (
    <DialectEvalProvider>
      <DialectEvalPhaseRouter />
    </DialectEvalProvider>
  );
}
