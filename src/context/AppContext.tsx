import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { stories } from "../data/stories";
import { educationQuizQuestions } from "../data/quiz";

export type AppPhase =
  | "signup"
  | "intro"
  | "education"
  | "quiz"
  | "dialect"
  | "translation_example"
  | "workspace"
  | "completion";

/** Arabic dialect options — participant must match the dialect assigned in their email. */
export type TranslationDialect = "MSA" | "Saudi" | "Egyptian" | "Lebanese";

export interface UserInfo {
  name: string;
  email: string;
}

export interface QuizResult {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
}

/** Participant translation for one story: localized title and body. */
export interface StoryTranslation {
  title: string;
  content: string;
}

export function getStoryTranslationEntry(
  translations: Record<number, StoryTranslation>,
  storyId: number
): StoryTranslation {
  return translations[storyId] ?? { title: "", content: "" };
}

export function isStoryTranslationComplete(t: StoryTranslation): boolean {
  return t.title.trim().length > 0 && t.content.trim().length > 0;
}

export interface AppState {
  phase: AppPhase;
  user: UserInfo | null;
  quizResults: QuizResult[];
  translations: Record<number, StoryTranslation>;
  /** Declared assigned dialect before entering the translation workspace. */
  selectedDialect: TranslationDialect | null;
  isSubmitting: boolean;
  submissionError: string | null;
}

interface AppContextType {
  state: AppState;
  setPhase: (phase: AppPhase) => void;
  setUser: (user: UserInfo) => void;
  setQuizResults: (results: QuizResult[]) => void;
  setSelectedDialect: (dialect: TranslationDialect) => void;
  setStoryTranslation: (storyId: number, updates: Partial<StoryTranslation>) => void;
  submitTranslations: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

/** Persisted with `localStorage` — workspace uses {@link WORKSPACE_STORY_STORAGE_KEY} for the open story tab. */
export const APP_SESSION_STORAGE_KEY = "translation-task-session-v1";
export const WORKSPACE_STORY_STORAGE_KEY = `${APP_SESSION_STORAGE_KEY}-workspace-story-id`;

const PHASE_VALUES: AppPhase[] = [
  "signup",
  "intro",
  "education",
  "quiz",
  "dialect",
  "translation_example",
  "workspace",
  "completion",
];

const DIALECT_VALUES: TranslationDialect[] = ["MSA", "Saudi", "Egyptian", "Lebanese"];

type PersistedFields = Pick<
  AppState,
  "phase" | "user" | "quizResults" | "translations" | "selectedDialect"
>;

function isPhase(x: unknown): x is AppPhase {
  return typeof x === "string" && PHASE_VALUES.includes(x as AppPhase);
}

function parseUser(x: unknown): UserInfo | null {
  if (x === null) return null;
  if (typeof x !== "object" || x === null) return null;
  const u = x as Record<string, unknown>;
  if (typeof u.name !== "string" || typeof u.email !== "string") return null;
  return { name: u.name, email: u.email };
}

function parseTranslations(x: unknown): Record<number, StoryTranslation> {
  if (typeof x !== "object" || x === null || Array.isArray(x)) return {};
  const out: Record<number, StoryTranslation> = {};
  for (const [k, v] of Object.entries(x)) {
    const id = Number(k);
    if (!Number.isFinite(id)) continue;
    if (typeof v === "string") {
      out[id] = { title: "", content: v };
      continue;
    }
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      const o = v as Record<string, unknown>;
      const title = typeof o.title === "string" ? o.title : "";
      const content = typeof o.content === "string" ? o.content : "";
      out[id] = { title, content };
    }
  }
  return out;
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

function loadPersistedSession(): PersistedFields | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(APP_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (typeof data !== "object" || data === null) return null;
    const o = data as Record<string, unknown>;
    if (!isPhase(o.phase)) return null;
    return {
      phase: o.phase,
      user: parseUser(o.user),
      quizResults: parseQuizResults(o.quizResults),
      translations: parseTranslations(o.translations),
      selectedDialect: parseDialect(o.selectedDialect),
    };
  } catch {
    return null;
  }
}

function serializeForStorage(state: AppState): PersistedFields {
  return {
    phase: state.phase,
    user: state.user,
    quizResults: state.quizResults,
    translations: state.translations,
    selectedDialect: state.selectedDialect,
  };
}

/** Clears saved progress (e.g. call from a “start over” control). */
export function clearPersistedAppSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(APP_SESSION_STORAGE_KEY);
    localStorage.removeItem(WORKSPACE_STORY_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    phase: "signup",
    user: null,
    quizResults: [],
    translations: {},
    selectedDialect: null,
    isSubmitting: false,
    submissionError: null,
  });

  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const loaded = loadPersistedSession();
    queueMicrotask(() => {
      if (loaded) {
        setState((prev) => ({
          ...prev,
          ...loaded,
          isSubmitting: false,
          submissionError: null,
        }));
      }
      setStorageReady(true);
    });
  }, []);

  useEffect(() => {
    if (!storageReady || typeof window === "undefined") return;
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(APP_SESSION_STORAGE_KEY, JSON.stringify(serializeForStorage(state)));
      } catch {
        /* quota / private mode */
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [state, storageReady]);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setPhase = useCallback((phase: AppPhase) => {
    setState((prev) => ({ ...prev, phase }));
  }, []);

  const setUser = useCallback((user: UserInfo) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  const setQuizResults = useCallback((quizResults: QuizResult[]) => {
    setState((prev) => ({ ...prev, quizResults }));
  }, []);

  const setSelectedDialect = useCallback((selectedDialect: TranslationDialect) => {
    setState((prev) => ({ ...prev, selectedDialect }));
  }, []);

  const setStoryTranslation = useCallback(
    (storyId: number, updates: Partial<StoryTranslation>) => {
      setState((prev) => {
        const prevEntry = getStoryTranslationEntry(prev.translations, storyId);
        return {
          ...prev,
          translations: {
            ...prev.translations,
            [storyId]: { ...prevEntry, ...updates },
          },
        };
      });
    },
    []
  );

  const submitTranslations = useCallback(async () => {
    const s = stateRef.current;
    if (!s.user || !s.selectedDialect) {
      setState((prev) => ({
        ...prev,
        submissionError: "Missing participant details or dialect. Go back and complete those steps.",
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isSubmitting: true,
      submissionError: null,
    }));

    const quiz_score = s.quizResults.filter((r) => r.isCorrect).length;
    const translated_story = stories.map((story) => {
      const entry = getStoryTranslationEntry(s.translations, story.id);
      return {
        story_id: story.id,
        story_title: story.title,
        translation_title: entry.title.trim(),
        translation: entry.content.trim(),
      };
    });

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

    try {
      const res = await fetch(`${apiBase}/api/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: s.user.name,
          email: s.user.email,
          quiz_score,
          quiz_total: educationQuizQuestions.length,
          target_dialect: s.selectedDialect,
          translated_story,
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
    <AppContext.Provider
      value={{
        state,
        setPhase,
        setUser,
        setQuizResults,
        setSelectedDialect,
        setStoryTranslation,
        submitTranslations,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
