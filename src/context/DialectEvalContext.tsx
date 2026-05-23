"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { TranslationDialect } from "@/context/AppContext";
import { getDialectEvalCases, type DialectEvalCase } from "@/data/dialectEvalCases";
import {
  computeDoResult,
  emptyStoryScores,
  type DialectEvalStoryScores,
} from "@/types/dialectEval";

export type DialectEvalPhase = "signup" | "dialect" | "intro" | "evaluate" | "completion";

export interface DialectEvalUser {
  name: string;
  email: string;
}

interface DialectEvalState {
  phase: DialectEvalPhase;
  user: DialectEvalUser | null;
  selectedDialect: TranslationDialect | null;
  scoresByCaseId: Record<string, DialectEvalStoryScores>;
  savedCaseIds: Record<string, boolean>;
  isSavingStory: boolean;
  isSubmitting: boolean;
  submissionError: string | null;
  storySaveError: string | null;
}

interface DialectEvalContextType {
  state: DialectEvalState;
  cases: DialectEvalCase[];
  storyCount: number;
  setPhase: (phase: DialectEvalPhase) => void;
  setUser: (user: DialectEvalUser) => void;
  setSelectedDialect: (dialect: TranslationDialect) => void;
  setStoryScores: (caseId: string, scores: DialectEvalStoryScores) => void;
  /** Persist one story's ratings to MongoDB (upsert on participant document). */
  submitStoryRating: (caseId: string) => Promise<boolean>;
  /** Mark session complete after all stories were submitted individually. */
  finishDialectEvaluation: () => Promise<void>;
}

const DialectEvalContext = createContext<DialectEvalContextType | null>(null);

export const DIALECT_EVAL_SESSION_KEY = "dialect-eval-session-v2";

const PHASE_VALUES: DialectEvalPhase[] = [
  "signup",
  "dialect",
  "intro",
  "evaluate",
  "completion",
];

type PersistedFields = Pick<
  DialectEvalState,
  "phase" | "user" | "selectedDialect" | "scoresByCaseId" | "savedCaseIds"
>;

function isPhase(x: unknown): x is DialectEvalPhase {
  return typeof x === "string" && PHASE_VALUES.includes(x as DialectEvalPhase);
}

function parseUser(x: unknown): DialectEvalUser | null {
  if (typeof x !== "object" || x === null) return null;
  const u = x as Record<string, unknown>;
  if (typeof u.name !== "string" || typeof u.email !== "string") return null;
  return { name: u.name, email: u.email };
}

function parseDialect(x: unknown): TranslationDialect | null {
  if (x === "MSA" || x === "Saudi" || x === "Egyptian" || x === "Lebanese") return x;
  return null;
}

function parseScores(x: unknown): Record<string, DialectEvalStoryScores> {
  if (typeof x !== "object" || x === null) return {};
  return x as Record<string, DialectEvalStoryScores>;
}

function parseSavedCaseIds(x: unknown): Record<string, boolean> {
  if (typeof x !== "object" || x === null) return {};
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(x)) {
    if (v === true) out[k] = true;
  }
  return out;
}

function createScoresForCases(
  cases: DialectEvalCase[],
  existing: Record<string, DialectEvalStoryScores> = {}
): Record<string, DialectEvalStoryScores> {
  const out: Record<string, DialectEvalStoryScores> = {};
  for (const c of cases) {
    out[c.case_id] = existing[c.case_id] ?? emptyStoryScores(c.case_id);
  }
  return out;
}

function createInitialState(): DialectEvalState {
  return {
    phase: "signup",
    user: null,
    selectedDialect: null,
    scoresByCaseId: {},
    savedCaseIds: {},
    isSavingStory: false,
    isSubmitting: false,
    submissionError: null,
    storySaveError: null,
  };
}

function loadPersisted(): PersistedFields | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DIALECT_EVAL_SESSION_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Record<string, unknown>;
    if (!isPhase(o.phase)) return null;
    return {
      phase: o.phase,
      user: parseUser(o.user),
      selectedDialect: parseDialect(o.selectedDialect),
      scoresByCaseId: parseScores(o.scoresByCaseId),
      savedCaseIds: parseSavedCaseIds(o.savedCaseIds),
    };
  } catch {
    return null;
  }
}

function persist(state: DialectEvalState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      DIALECT_EVAL_SESSION_KEY,
      JSON.stringify({
        phase: state.phase,
        user: state.user,
        selectedDialect: state.selectedDialect,
        scoresByCaseId: state.scoresByCaseId,
        savedCaseIds: state.savedCaseIds,
      })
    );
  } catch {
    /* ignore */
  }
}

function normalizePhase(
  phase: DialectEvalPhase,
  user: DialectEvalUser | null,
  selectedDialect: TranslationDialect | null
): DialectEvalPhase {
  if (phase === "signup") return "signup";
  if (!user) return "signup";
  if (!selectedDialect && phase !== "dialect") return "dialect";
  return phase;
}

export function isStoryScoresComplete(scores: DialectEvalStoryScores): boolean {
  const doOk =
    scores.descriptive_orientation.descriptive_count >= 0 &&
    scores.descriptive_orientation.coaching_count >= 0;

  const dimOk = (d: DialectEvalStoryScores["structural_clarity"]) =>
    [d.Q1, d.Q2, d.Q3, d.Q4, d.Q5].every((q) => q != null && q >= 1 && q <= 5);

  const dfOk =
    scores.dialect_fluency.Q1 != null &&
    scores.dialect_fluency.Q1 >= 1 &&
    scores.dialect_fluency.Q1 <= 5 &&
    scores.dialect_fluency.Q2 != null &&
    scores.dialect_fluency.Q2 >= 1 &&
    scores.dialect_fluency.Q2 <= 5;

  return doOk && dimOk(scores.structural_clarity) && dimOk(scores.situational_safety) && dfOk;
}

export function countCompletedStories(
  cases: DialectEvalCase[],
  scoresByCaseId: Record<string, DialectEvalStoryScores>
): number {
  return cases.filter((c) => {
    const s = scoresByCaseId[c.case_id];
    return s && isStoryScoresComplete(s);
  }).length;
}

export function countSavedStories(
  cases: DialectEvalCase[],
  savedCaseIds: Record<string, boolean>
): number {
  return cases.filter((c) => savedCaseIds[c.case_id]).length;
}

export function DialectEvalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialectEvalState>(() => {
    const loaded = loadPersisted();
    const base = createInitialState();
    if (!loaded) return base;
    if (loaded.phase !== "signup" && !loaded.user) return base;

    const selectedDialect = loaded.selectedDialect;
    const cases = selectedDialect ? getDialectEvalCases(selectedDialect) : [];
    const phase = normalizePhase(loaded.phase, loaded.user, selectedDialect);

    return {
      ...base,
      phase,
      user: loaded.user,
      selectedDialect,
      scoresByCaseId: createScoresForCases(cases, loaded.scoresByCaseId),
      savedCaseIds: loaded.savedCaseIds,
    };
  });

  const cases = useMemo(
    () => (state.selectedDialect ? getDialectEvalCases(state.selectedDialect) : []),
    [state.selectedDialect]
  );

  const storyCount = cases.length;

  useEffect(() => {
    persist(state);
  }, [state]);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setPhase = useCallback((phase: DialectEvalPhase) => {
    setState((prev) => {
      const next = {
        ...prev,
        phase: normalizePhase(phase, prev.user, prev.selectedDialect),
      };
      persist(next);
      return next;
    });
  }, []);

  const setUser = useCallback((user: DialectEvalUser) => {
    setState((prev) => {
      const next = { ...prev, user };
      persist(next);
      return next;
    });
  }, []);

  const setSelectedDialect = useCallback((dialect: TranslationDialect) => {
    const nextCases = getDialectEvalCases(dialect);
    setState((prev) => {
      const next = {
        ...prev,
        selectedDialect: dialect,
        scoresByCaseId: createScoresForCases(nextCases, prev.scoresByCaseId),
        savedCaseIds: Object.fromEntries(
          Object.entries(prev.savedCaseIds).filter(([id]) =>
            nextCases.some((c) => c.case_id === id)
          )
        ),
      };
      persist(next);
      return next;
    });
  }, []);

  const setStoryScores = useCallback((caseId: string, scores: DialectEvalStoryScores) => {
    const doComputed = computeDoResult(
      scores.descriptive_orientation.descriptive_count,
      scores.descriptive_orientation.coaching_count
    );
    const withDo = {
      ...scores,
      descriptive_orientation: {
        ...scores.descriptive_orientation,
        numeric_ratio: doComputed.numeric_ratio,
        result: doComputed.result,
      },
    };
    setState((prev) => {
      const next = {
        ...prev,
        scoresByCaseId: { ...prev.scoresByCaseId, [caseId]: withDo },
      };
      persist(next);
      return next;
    });
  }, []);

  const submitStoryRating = useCallback(async (caseId: string): Promise<boolean> => {
    const s = stateRef.current;
    if (!s.user || !s.selectedDialect) {
      setState((prev) => ({ ...prev, storySaveError: "Missing participant details." }));
      return false;
    }

    const scores = s.scoresByCaseId[caseId];
    if (!scores || !isStoryScoresComplete(scores)) {
      setState((prev) => ({
        ...prev,
        storySaveError: "Complete all four metrics for this story before submitting.",
      }));
      return false;
    }

    setState((prev) => ({ ...prev, isSavingStory: true, storySaveError: null }));

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

    try {
      const res = await fetch(`${apiBase}/api/dialect-evaluation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: s.user.name,
          email: s.user.email,
          target_dialect: s.selectedDialect,
          story_rating: scores,
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
        throw new Error(detail || "Could not submit story.");
      }

      setState((prev) => {
        const next = {
          ...prev,
          isSavingStory: false,
          storySaveError: null,
          savedCaseIds: { ...prev.savedCaseIds, [caseId]: true },
        };
        persist(next);
        return next;
      });
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not reach the server.";
      setState((prev) => ({
        ...prev,
        isSavingStory: false,
        storySaveError: msg,
      }));
      return false;
    }
  }, []);

  const finishDialectEvaluation = useCallback(async () => {
    const s = stateRef.current;
    if (!s.user || !s.selectedDialect) {
      setState((prev) => ({
        ...prev,
        submissionError: "Missing participant details.",
      }));
      return;
    }

    const activeCases = getDialectEvalCases(s.selectedDialect);
    const required = activeCases.length;
    const saved = countSavedStories(activeCases, s.savedCaseIds);

    if (saved < required) {
      setState((prev) => ({
        ...prev,
        submissionError: `Submit each story to the database first (${saved} of ${required} submitted).`,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: true, submissionError: null }));

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

    try {
      const res = await fetch(`${apiBase}/api/dialect-evaluation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: s.user.name,
          email: s.user.email,
          target_dialect: s.selectedDialect,
          finalize: true,
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
        throw new Error(detail || "Could not finish evaluation.");
      }

      setState((prev) => {
        const next = {
          ...prev,
          isSubmitting: false,
          submissionError: null,
          phase: "completion" as const,
        };
        persist(next);
        return next;
      });
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
    <DialectEvalContext.Provider
      value={{
        state,
        cases,
        storyCount,
        setPhase,
        setUser,
        setSelectedDialect,
        setStoryScores,
        submitStoryRating,
        finishDialectEvaluation,
      }}
    >
      {children}
    </DialectEvalContext.Provider>
  );
}

export function useDialectEval() {
  const ctx = useContext(DialectEvalContext);
  if (!ctx) {
    throw new Error("useDialectEval must be used within DialectEvalProvider");
  }
  return ctx;
}
