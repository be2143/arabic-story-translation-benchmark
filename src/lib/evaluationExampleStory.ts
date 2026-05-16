import type { TranslationDialect } from "@/context/AppContext";
import { getStoryExampleJsonKey } from "@/data/dialects";
import examples from "@/data/story_translation_examples.json";

export type DialectExampleTranslation = {
  title: string;
  content: string;
  content_bad: string;
  bad_reasons: string[];
};

export type StoryTranslationExample = {
  story_title: string;
  story_content: string;
  translations: Record<
    "msa" | "egypt" | "saudi" | "lebanon",
    DialectExampleTranslation
  >;
};

const typedExamples = examples as StoryTranslationExample[];

export interface EvaluationExampleSides {
  englishTitle: string;
  englishContent: string;
  good: { title: string; content: string };
  bad: { title: string; content: string };
  badReasons: string[];
}

export function getEvaluationExampleStory(
  dialect: TranslationDialect
): EvaluationExampleSides | null {
  const story = typedExamples[0];
  if (!story) return null;

  const key = getStoryExampleJsonKey(dialect);
  const row = story.translations[key];
  if (!row) return null;

  const badContent = String(row.content_bad ?? "").trim();
  const goodContent = String(row.content ?? "").trim();
  if (!goodContent || !badContent) return null;

  const badReasons = Array.isArray(row.bad_reasons)
    ? row.bad_reasons.map((r) => String(r).trim()).filter(Boolean)
    : [];

  return {
    englishTitle: story.story_title,
    englishContent: story.story_content,
    good: { title: row.title, content: goodContent },
    bad: { title: row.title, content: badContent },
    badReasons,
  };
}

export function pickExampleOrder<T>(
  good: T,
  bad: T
): { left: T; right: T; goodSide: "left" | "right" } {
  if (Math.random() < 0.5) {
    return { left: good, right: bad, goodSide: "left" };
  }
  return { left: bad, right: good, goodSide: "right" };
}
