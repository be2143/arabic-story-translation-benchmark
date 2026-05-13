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
