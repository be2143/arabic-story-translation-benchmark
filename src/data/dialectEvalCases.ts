import type { TranslationDialect } from "@/context/AppContext";
import { getDialectLabel } from "@/data/dialects";
import raw from "../../human_eval_stories.json";

export type HumanEvalDialectKey =
  | "arabic_egypt"
  | "arabic_msa"
  | "arabic_saudi"
  | "arabic_lebanon";

interface HumanEvalSelection {
  model: string;
  task: string;
  story_id: number;
  story_title: string;
  story_category: string;
  situation_target_behavior: string;
  content: string;
  source_file: string;
  dialect: HumanEvalDialectKey;
}

interface HumanEvalStoriesFile {
  selections: HumanEvalSelection[];
}

const manifest = raw as HumanEvalStoriesFile;

export function translationDialectToHumanEvalKey(
  dialect: TranslationDialect
): HumanEvalDialectKey {
  switch (dialect) {
    case "MSA":
      return "arabic_msa";
    case "Egyptian":
      return "arabic_egypt";
    case "Saudi":
      return "arabic_saudi";
    case "Lebanese":
      return "arabic_lebanon";
  }
}

export interface DialectEvalCase {
  case_id: string;
  story_id: number;
  model: string;
  task: string;
  target_dialect: string;
  dialect_key: HumanEvalDialectKey;
  story_text: string;
  english_title: string;
  english_category: string;
  english_situation: string;
  source_file: string;
  index: number;
}

function buildCaseId(selection: HumanEvalSelection): string {
  return `${selection.model}|${selection.task}|${selection.story_id}`;
}

const casesByDialectKey = new Map<HumanEvalDialectKey, DialectEvalCase[]>();

for (const key of [
  "arabic_egypt",
  "arabic_msa",
  "arabic_saudi",
  "arabic_lebanon",
] as HumanEvalDialectKey[]) {
  const rows = manifest.selections
    .filter((s) => s.dialect === key)
    .map((selection, index) => ({
      case_id: buildCaseId(selection),
      story_id: selection.story_id,
      model: selection.model,
      task: selection.task,
      target_dialect: getDialectLabel(humanEvalKeyToTranslationDialect(key)),
      dialect_key: key,
      story_text: selection.content,
      english_title: selection.story_title,
      english_category: selection.story_category,
      english_situation: selection.situation_target_behavior,
      source_file: selection.source_file,
      index,
    }));
  casesByDialectKey.set(key, rows);
}

export function humanEvalKeyToTranslationDialect(
  key: HumanEvalDialectKey
): TranslationDialect {
  switch (key) {
    case "arabic_msa":
      return "MSA";
    case "arabic_egypt":
      return "Egyptian";
    case "arabic_saudi":
      return "Saudi";
    case "arabic_lebanon":
      return "Lebanese";
  }
}

export function getDialectEvalCases(dialect: TranslationDialect): DialectEvalCase[] {
  const key = translationDialectToHumanEvalKey(dialect);
  return casesByDialectKey.get(key) ?? [];
}

export function getDialectEvalStoryCount(dialect: TranslationDialect): number {
  return getDialectEvalCases(dialect).length;
}

/** All cases across dialects (for API lookup). */
export const allDialectEvalCases: DialectEvalCase[] = manifest.selections.map(
  (selection, index) => {
    const key = selection.dialect;
    return {
      case_id: buildCaseId(selection),
      story_id: selection.story_id,
      model: selection.model,
      task: selection.task,
      target_dialect: getDialectLabel(humanEvalKeyToTranslationDialect(key)),
      dialect_key: key,
      story_text: selection.content,
      english_title: selection.story_title,
      english_category: selection.story_category,
      english_situation: selection.situation_target_behavior,
      source_file: selection.source_file,
      index,
    };
  }
);

export const caseById = new Map(allDialectEvalCases.map((c) => [c.case_id, c]));
