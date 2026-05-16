"use client";

import { useEvaluation } from "@/context/EvaluationContext";
import EvalSignupScreen from "@/evaluation/screens/EvalSignupScreen";
import EvalIntroScreen from "@/evaluation/screens/EvalIntroScreen";
import EvalEducationScreen from "@/evaluation/screens/EvalEducationScreen";
import EvalQuizScreen from "@/evaluation/screens/EvalQuizScreen";
import EvalDialectScreen from "@/evaluation/screens/EvalDialectScreen";
import EvalComparisonExampleScreen from "@/evaluation/screens/EvalComparisonExampleScreen";
import EvalComparisonScreen from "@/evaluation/screens/EvalComparisonScreen";
import EvalCompletionScreen from "@/evaluation/screens/EvalCompletionScreen";

export default function EvaluationPhaseRouter() {
  const { state } = useEvaluation();

  switch (state.phase) {
    case "signup":
      return <EvalSignupScreen />;
    case "intro":
      return <EvalIntroScreen />;
    case "education":
      return <EvalEducationScreen />;
    case "quiz":
      return <EvalQuizScreen />;
    case "dialect":
      return <EvalDialectScreen />;
    case "example":
      return <EvalComparisonExampleScreen />;
    case "comparisons":
      return <EvalComparisonScreen />;
    case "completion":
      return <EvalCompletionScreen />;
    default:
      return <EvalSignupScreen />;
  }
}
