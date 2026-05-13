import type { TranslationDialect } from "../context/AppContext";

export const DIALECT_OPTIONS: { value: TranslationDialect; label: string }[] = [
  { value: "MSA", label: "MSA (Modern Standard Arabic)" },
  { value: "Saudi", label: "Saudi Arabic" },
  { value: "Egyptian", label: "Egyptian Arabic" },
  { value: "Lebanese", label: "Lebanese Arabic" },
];

export function getDialectLabel(dialect: TranslationDialect): string {
  return DIALECT_OPTIONS.find((o) => o.value === dialect)?.label ?? dialect;
}

/** Keys used in `story_translation_examples.json` under `translations`. */
export type StoryExampleJsonDialectKey = "msa" | "egypt" | "saudi" | "lebanon";

export function getStoryExampleJsonKey(dialect: TranslationDialect): StoryExampleJsonDialectKey {
  switch (dialect) {
    case "MSA":
      return "msa";
    case "Egyptian":
      return "egypt";
    case "Saudi":
      return "saudi";
    case "Lebanese":
      return "lebanon";
  }
}
