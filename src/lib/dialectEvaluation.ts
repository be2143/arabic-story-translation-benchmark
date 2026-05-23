import {
  caseById,
  getDialectEvalCases,
} from "@/data/dialectEvalCases";
import type { TranslationDialect } from "@/context/AppContext";
import { computeDoResult } from "@/types/dialectEval";
import type { Db } from "mongodb";

export const DIALECT_EVAL_COLLECTION = "dialect_evaluation_submissions";

const DIALECTS = ["MSA", "Saudi", "Egyptian", "Lebanese"] as const;

function isDialect(x: string): x is TranslationDialect {
  return DIALECTS.includes(x as TranslationDialect);
}

function isScore(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 1 && n <= 5;
}

function parseDimension(row: unknown): Record<string, unknown> | null {
  if (typeof row !== "object" || row === null) return null;
  const r = row as Record<string, unknown>;
  for (const key of ["Q1", "Q2", "Q3", "Q4", "Q5"]) {
    if (!isScore(r[key])) return null;
  }
  return {
    Q1: r.Q1,
    Q2: r.Q2,
    Q3: r.Q3,
    Q4: r.Q4,
    Q5: r.Q5,
    rationale: String(r.rationale ?? ""),
    confidence: r.confidence == null ? null : Number(r.confidence),
    confidence_note: String(r.confidence_note ?? ""),
  };
}

function parseDialectFluency(row: unknown): Record<string, unknown> | null {
  if (typeof row !== "object" || row === null) return null;
  const r = row as Record<string, unknown>;
  if (!isScore(r.Q1) || !isScore(r.Q2)) return null;
  return {
    Q1: r.Q1,
    Q2: r.Q2,
    consistency_note: String(r.consistency_note ?? ""),
    regional_note: String(r.regional_note ?? ""),
    confidence: r.confidence == null ? null : Number(r.confidence),
    confidence_note: String(r.confidence_note ?? ""),
  };
}

export function parseStoryRating(row: unknown): Record<string, unknown> | null {
  if (typeof row !== "object" || row === null) return null;
  const r = row as Record<string, unknown>;
  const case_id = String(r.case_id ?? "").trim();
  if (!caseById.has(case_id)) return null;

  const doRow = r.descriptive_orientation;
  if (typeof doRow !== "object" || doRow === null) return null;
  const d = doRow as Record<string, unknown>;
  const descriptive_count = Number(d.descriptive_count);
  const coaching_count = Number(d.coaching_count);
  if (
    !Number.isFinite(descriptive_count) ||
    descriptive_count < 0 ||
    !Number.isFinite(coaching_count) ||
    coaching_count < 0
  ) {
    return null;
  }

  const doComputed = computeDoResult(descriptive_count, coaching_count);
  const structural_clarity = parseDimension(r.structural_clarity);
  const situational_safety = parseDimension(r.situational_safety);
  const dialect_fluency = parseDialectFluency(r.dialect_fluency);
  if (!structural_clarity || !situational_safety || !dialect_fluency) return null;

  return enrichStoryRating({
    case_id,
    descriptive_orientation: {
      descriptive_count,
      coaching_count,
      numeric_ratio: doComputed.numeric_ratio,
      result: doComputed.result,
      notes: String(d.notes ?? ""),
    },
    structural_clarity,
    situational_safety,
    dialect_fluency,
  });
}

export function enrichStoryRating(rating: Record<string, unknown>): Record<string, unknown> {
  const case_id = String(rating.case_id ?? "");
  const meta = caseById.get(case_id);
  if (!meta) return rating;
  return {
    ...rating,
    story_id: meta.story_id,
    model: meta.model,
    task: meta.task,
    target_dialect: meta.target_dialect,
    dialect_key: meta.dialect_key,
    story_index: meta.index,
    english_title: meta.english_title,
    source_file: meta.source_file,
  };
}

export async function upsertStoryRating(
  db: Db,
  email: string,
  user_name: string,
  target_dialect: TranslationDialect,
  rating: Record<string, unknown>
): Promise<void> {
  const col = db.collection(DIALECT_EVAL_COLLECTION);
  const case_id = String(rating.case_id);
  const now = new Date();

  const existing = await col.findOne({ email });
  const current = Array.isArray(existing?.story_ratings)
    ? (existing.story_ratings as Record<string, unknown>[])
    : [];
  const story_ratings = [
    ...current.filter((r) => String(r.case_id) !== case_id),
    rating,
  ].sort((a, b) => Number(a.story_index ?? 0) - Number(b.story_index ?? 0));

  await col.updateOne(
    { email },
    {
      $set: {
        user_name,
        target_dialect,
        story_ratings,
        updated_at: now,
      },
      $setOnInsert: { status: "in_progress", created_at: now },
    },
    { upsert: true }
  );
}

export async function finalizeDialectEvaluation(
  db: Db,
  email: string,
  user_name: string,
  target_dialect: TranslationDialect,
  story_ratings: Record<string, unknown>[]
): Promise<void> {
  const col = db.collection(DIALECT_EVAL_COLLECTION);
  const now = new Date();

  await col.updateOne(
    { email },
    {
      $set: {
        user_name,
        email,
        target_dialect,
        story_ratings,
        status: "submitted",
        submitted_at: now,
        updated_at: now,
      },
      $setOnInsert: { created_at: now },
    },
    { upsert: true }
  );
}

/** Mark session complete when all per-story ratings are already in MongoDB. */
export async function finalizeDialectEvaluationInDb(
  db: Db,
  email: string,
  user_name: string,
  target_dialect: TranslationDialect
): Promise<string | null> {
  const col = db.collection(DIALECT_EVAL_COLLECTION);
  const existing = await col.findOne({ email });
  const story_ratings = Array.isArray(existing?.story_ratings)
    ? (existing.story_ratings as Record<string, unknown>[])
    : [];

  const validationError = validateAllStoriesPresent(story_ratings, target_dialect);
  if (validationError) return validationError;

  const now = new Date();
  await col.updateOne(
    { email },
    {
      $set: {
        user_name,
        email,
        target_dialect,
        status: "submitted",
        submitted_at: now,
        updated_at: now,
      },
      $setOnInsert: { created_at: now, story_ratings },
    },
    { upsert: true }
  );
  return null;
}

export function validateCaseForDialect(
  caseId: string,
  target_dialect: TranslationDialect
): boolean {
  return getDialectEvalCases(target_dialect).some((c) => c.case_id === caseId);
}

export function validateAllStoriesPresent(
  ratings: Record<string, unknown>[],
  target_dialect: TranslationDialect
): string | null {
  const expected = getDialectEvalCases(target_dialect);
  const expectedIds = new Set(expected.map((c) => c.case_id));

  for (const r of ratings) {
    if (!expectedIds.has(String(r.case_id))) {
      return "One or more ratings do not belong to the selected dialect.";
    }
  }

  const caseIds = new Set(ratings.map((r) => r.case_id));
  if (caseIds.size !== expected.length) {
    return `Expected ratings for all ${expected.length} stories.`;
  }
  return null;
}

export { isDialect };
