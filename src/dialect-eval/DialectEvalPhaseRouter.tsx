"use client";

import { useDialectEval } from "@/context/DialectEvalContext";
import DialectEvalSignupScreen from "@/dialect-eval/screens/DialectEvalSignupScreen";
import DialectEvalIntroScreen from "@/dialect-eval/screens/DialectEvalIntroScreen";
import DialectEvalWorkspaceScreen from "@/dialect-eval/screens/DialectEvalWorkspaceScreen";
import DialectEvalCompletionScreen from "@/dialect-eval/screens/DialectEvalCompletionScreen";

export default function DialectEvalPhaseRouter() {
  const { state } = useDialectEval();

  switch (state.phase) {
    case "signup":
      return <DialectEvalSignupScreen />;
    case "intro":
      return <DialectEvalIntroScreen />;
    case "evaluate":
      return <DialectEvalWorkspaceScreen />;
    case "completion":
      return <DialectEvalCompletionScreen />;
    default:
      return <DialectEvalSignupScreen />;
  }
}
