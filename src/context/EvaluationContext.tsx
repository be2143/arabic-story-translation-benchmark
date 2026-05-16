"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { TranslationDialect, UserInfo, QuizResult } from "./AppContext";
import { evaluationQuizQuestions } from "@/data/evaluationQuiz";
import type { EvaluationComparisonResponse } from "@/types/evaluation";

export type { EvaluationComparisonResponse };

export type EvaluationPhase =
  | "signup"
  | "intro"
  | "education"
  | "quiz"
  | "dialect"
  | "example"
  | "comparisons"
  | "completion";

interface EvaluationState {
  phase: EvaluationPhase;
  user: UserInfo | null;
  quizResults: QuizResult[];
  selectedDialect: TranslationDialect | null;
  comparisonResponses: EvaluationComparisonResponse[];
  isSubmitting: boolean;
  submissionError: string | null;
}

interface EvaluationContextType {
  state: EvaluationState;
  setPhase: (phase: EvaluationPhase) => void;
  setUser: (user: UserInfo) => void;
  setQuizResults: (results: QuizResult[]) => void;
  setSelectedDialect: (dialect: TranslationDialect) => void;
  startComparisons: (dialect: TranslationDialect) => void;
  upsertComparisonResponse: (row: EvaluationComparisonResponse) => void;
  submitEvaluation: () => Promise<void>;
}

export const EVALUATION_STORY_COUNT = 12;

const EvaluationContext = createContext<EvaluationContextType | null>(null);

export const EVALUATION_SESSION_STORAGE_KEY = "translation-evaluation-session-v3";

const PHASE_VALUES: EvaluationPhase[] = [
  "signup",
  "intro",
  "education",
  "quiz",
  "dialect",
  "example",
  "comparisons",
  "completion",
];

const DIALECT_VALUES: TranslationDialect[] = ["MSA", "Saudi", "Egyptian", "Lebanese"];

type PersistedFields = Pick<
  EvaluationState,
  "phase" | "user" | "quizResults" | "selectedDialect" | "comparisonResponses"
>;

function isPhase(x: unknown): x is EvaluationPhase {
  return typeof x === "string" && PHASE_VALUES.includes(x as EvaluationPhase);
}

function parseUser(x: unknown): UserInfo | null {
  if (x === null) return null;
  if (typeof x !== "object" || x === null) return null;
  const u = x as Record<string, unknown>;
  if (typeof u.name !== "string" || typeof u.email !== "string") return null;
  return { name: u.name, email: u.email };
}

function parseQuizResults(x: unknown): QuizResult[] {
  if (!Array.isArray(x)) return [];
  const out: QuizResult[] = [];
  for (const item of x) {
    if (typeof item !== "object" || item === null) continue;
    const r = item as Record<string, unknown>;
    const questionId = Number(r.questionId);
    const selectedAnswer = Number(r.selectedAnswer);
    const isCorrect = Boolean(r.isCorrect);
    if (!Number.isFinite(questionId) || !Number.isFinite(selectedAnswer)) continue;
    out.push({ questionId, selectedAnswer, isCorrect });
  }
  return out;
}

function parseDialect(x: unknown): TranslationDialect | null {
  if (x === null) return null;
  return typeof x === "string" && DIALECT_VALUES.includes(x as TranslationDialect)
    ? (x as TranslationDialect)
    : null;
}

function parseChosenSide(x: unknown): "left" | "right" | null {
  if (x === "left" || x === "right") return x;
  return null;
}

function parseComparisonResponses(x: unknown): EvaluationComparisonResponse[] {
  if (!Array.isArray(x)) return [];
  const out: EvaluationComparisonResponse[] = [];
  for (const item of x) {
    if (typeof item !== "object" || item === null) continue;
    const r = item as Record<string, unknown>;
    const story_id = Number(r.story_id);
    const round_index = Number(r.round_index);
    const target_dialect = parseDialect(r.target_dialect);
    const left_source_key = String(r.left_source_key ?? "").trim();
    const right_source_key = String(r.right_source_key ?? "").trim();
    const skipped = Boolean(r.skipped);
    if (
      !Number.isFinite(story_id) ||
      !Number.isFinite(round_index) ||
      !target_dialect ||
      !left_source_key ||
      !right_source_key
    ) {
      continue;
    }

    if (skipped) {
      out.push({
        story_id,
        round_index,
        target_dialect,
        left_source_key,
        right_source_key,
        chosen_side: null,
        skipped: true,
      });
      continue;
    }

    const chosen_side = parseChosenSide(r.chosen_side);
    if (!chosen_side) continue;
    out.push({
      story_id,
      round_index,
      target_dialect,
      left_source_key,
      right_source_key,
      chosen_side,
      skipped: false,
    });
  }
  return out;
}

const LEGACY_SESSION_KEYS = [
  EVALUATION_SESSION_STORAGE_KEY,
  "translation-evaluation-session-v2",
  "translation-evaluation-session-v1",
];

function loadPersistedSession(): PersistedFields | null {
  if (typeof window === "undefined") return null;
  for (const key of LEGACY_SESSION_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const data = JSON.parse(raw) as unknown;
      if (typeof data !== "object" || data === null) continue;
      const o = data as Record<string, unknown>;
      if (!isPhase(o.phase)) continue;
      return {
        phase: o.phase,
        user: parseUser(o.user),
        quizResults: parseQuizResults(o.quizResults),
        selectedDialect: parseDialect(o.selectedDialect),
        comparisonResponses: parseComparisonResponses(o.comparisonResponses),
      };
    } catch {
      continue;
    }
  }
  return null;
}

function createInitialEvaluationState(): EvaluationState {
  const base: EvaluationState = {
    phase: "signup",
    user: null,
    quizResults: [],
    selectedDialect: null,
    comparisonResponses: [],
    isSubmitting: false,
    submissionError: null,
  };

  const loaded = loadPersistedSession();
  if (!loaded) return base;

  if (loaded.phase !== "signup" && !loaded.user) {
    return base;
  }

  return {
    ...base,
    ...loaded,
    isSubmitting: false,
    submissionError: null,
  };
}

function persistEvaluationSession(state: EvaluationState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      EVALUATION_SESSION_STORAGE_KEY,
      JSON.stringify(serializeForStorage(state))
    );
  } catch {
    /* ignore */
  }
}

function serializeForStorage(state: EvaluationState): PersistedFields {
  return {
    phase: state.phase,
    user: state.user,
    quizResults: state.quizResults,
    selectedDialect: state.selectedDialect,
    comparisonResponses: state.comparisonResponses,
  };
}

export function clearPersistedEvaluationSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(EVALUATION_SESSION_STORAGE_KEY);
    localStorage.removeItem("translation-evaluation-session-v2");
    localStorage.removeItem("translation-evaluation-session-v1");
  } catch {
    /* ignore */
  }
}

export function EvaluationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EvaluationState>(createInitialEvaluationState);

  useEffect(() => {
    persistEvaluationSession(state);
  }, [state]);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setPhase = useCallback((phase: EvaluationPhase) => {
    setState((prev) => {
      const next = { ...prev, phase };
      persistEvaluationSession(next);
      return next;
    });
  }, []);

  const setUser = useCallback((user: UserInfo) => {
    setState((prev) => {
      const next = { ...prev, user };
      persistEvaluationSession(next);
      return next;
    });
  }, []);

  const setQuizResults = useCallback((quizResults: QuizResult[]) => {
    setState((prev) => ({ ...prev, quizResults }));
  }, []);

  const setSelectedDialect = useCallback((selectedDialect: TranslationDialect) => {
    setState((prev) => ({ ...prev, selectedDialect }));
  }, []);

  const startComparisons = useCallback((selectedDialect: TranslationDialect) => {
    setState((prev) => ({
      ...prev,
      selectedDialect,
      comparisonResponses: [],
      phase: "comparisons",
    }));
  }, []);

  const upsertComparisonResponse = useCallback((row: EvaluationComparisonResponse) => {
    setState((prev) => {
      const rest = prev.comparisonResponses.filter((r) => r.story_id !== row.story_id);
      const comparisonResponses = [...rest, row].sort(
        (a, b) => a.round_index - b.round_index
      );
      const next = { ...prev, comparisonResponses };
      persistEvaluationSession(next);
      return next;
    });
  }, []);

  const submitEvaluation = useCallback(async () => {
    const s = stateRef.current;
    if (!s.user || !s.selectedDialect) {
      setState((prev) => ({
        ...prev,
        submissionError: "Missing participant details or dialect.",
      }));
      return;
    }

    const byStory = new Map(s.comparisonResponses.map((r) => [r.story_id, r]));
    for (let storyId = 1; storyId <= EVALUATION_STORY_COUNT; storyId++) {
      if (!byStory.has(storyId)) {
        setState((prev) => ({
          ...prev,
          submissionError: `Please complete all ${EVALUATION_STORY_COUNT} stories before submitting.`,
        }));
        return;
      }
    }

    const missingChoice = s.comparisonResponses.some(
      (r) => !r.skipped && r.chosen_side == null
    );
    if (missingChoice) {
      setState((prev) => ({
        ...prev,
        submissionError: `Please choose the better translation for every story that has two options.`,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isSubmitting: true,
      submissionError: null,
    }));

    const quiz_score = s.quizResults.filter((r) => r.isCorrect).length;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

    try {
      const res = await fetch(`${apiBase}/api/evaluation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: s.user.name,
          email: s.user.email,
          quiz_score,
          quiz_total: evaluationQuizQuestions.length,
          target_dialect: s.selectedDialect,
          comparisons: s.comparisonResponses,
        }),
      });

      if (!res.ok) {
        let detail = res.statusText;
        try {
          const j = (await res.json()) as { error?: string };
          if (j.error) detail = j.error;
        } catch {
          /* ignore */
        }
        throw new Error(detail || "Submission failed.");
      }

      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        submissionError: null,
        phase: "completion",
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not reach the server.";
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        submissionError: msg,
      }));
    }
  }, []);

  return (
    <EvaluationContext.Provider
      value={{
        state,
        setPhase,
        setUser,
        setQuizResults,
        setSelectedDialect,
        startComparisons,
        upsertComparisonResponse,
        submitEvaluation,
      }}
    >
      {children}
    </EvaluationContext.Provider>
  );
}

export function useEvaluation() {
  const ctx = useContext(EvaluationContext);
  if (!ctx) {
    throw new Error("useEvaluation must be used within EvaluationProvider");
  }
  return ctx;
}
