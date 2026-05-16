"use client";

import { EvaluationProvider } from "@/context/EvaluationContext";
import EvaluationPhaseRouter from "@/evaluation/EvaluationPhaseRouter";

export default function EvaluationPage() {
  return (
    <EvaluationProvider>
      <EvaluationPhaseRouter />
    </EvaluationProvider>
  );
}
