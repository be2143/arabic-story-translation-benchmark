"use client";

import { useApp } from "@/context/AppContext";
import SignupScreen from "@/screens/SignupScreen";
import IntroScreen from "@/screens/IntroScreen";
import EducationScreen from "@/screens/EducationScreen";
import QuizScreen from "@/screens/QuizScreen";
import DialectScreen from "@/screens/DialectScreen";
import WorkspaceScreen from "@/screens/WorkspaceScreen";
import CompletionScreen from "@/screens/CompletionScreen";

function PhaseRouter() {
  const { state } = useApp();

  switch (state.phase) {
    case "signup":
      return <SignupScreen />;
    case "intro":
      return <IntroScreen />;
    case "education":
      return <EducationScreen />;
    case "quiz":
      return <QuizScreen />;
    case "dialect":
      return <DialectScreen />;
    case "workspace":
      return <WorkspaceScreen />;
    case "completion":
      return <CompletionScreen />;
    default:
      return <SignupScreen />;
  }
}

export default function HomePage() {
  return <PhaseRouter />;
}
