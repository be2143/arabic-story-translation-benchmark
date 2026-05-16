import type { TranslationDialect } from "@/context/AppContext";

export interface ComparisonSide {
  title: string;
  content: string;
  dialect: TranslationDialect;
  /** Stable id for this translation (submission id or story_translations doc id). */
  sourceKey: string;
}

export interface EvaluationStoryRound {
  roundIndex: number;
  storyId: number;
  englishTitle: string;
  englishContent: string;
  status: "ready" | "missing";
  left?: ComparisonSide;
  right?: ComparisonSide;
}

export interface EvaluationComparisonResponse {
  story_id: number;
  round_index: number;
  target_dialect: TranslationDialect;
  left_source_key: string;
  right_source_key: string;
  chosen_side: "left" | "right" | null;
  skipped: boolean;
}

export interface EvaluationStoriesPayload {
  target_dialect: TranslationDialect;
  rounds: EvaluationStoryRound[];
}
