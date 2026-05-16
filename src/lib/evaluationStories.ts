import type { Db } from "mongodb";
import type { TranslationDialect } from "@/context/AppContext";
import { stories } from "@/data/stories";
import type { ComparisonSide, EvaluationStoryRound } from "@/types/evaluation";

const STORY_TRANSLATIONS_COLLECTION = "story_translations";
const SUBMISSIONS_COLLECTION = "submissions";

const DIALECT_VALUES: TranslationDialect[] = ["MSA", "Saudi", "Egyptian", "Lebanese"];

function isDialect(x: string): x is TranslationDialect {
  return DIALECT_VALUES.includes(x as TranslationDialect);
}

interface StoredTranslation {
  story_id: number;
  dialect: TranslationDialect;
  translation_title: string;
  translation_content: string;
  source_key: string;
}

function translationFingerprint(title: string, content: string): string {
  return `${title}\n${content}`;
}

function pickOrder<T>(a: T, b: T): [T, T] {
  return Math.random() < 0.5 ? [a, b] : [b, a];
}

function parseStoryTranslationDoc(
  doc: Record<string, unknown>,
  storyId: number,
  dialect: TranslationDialect
): StoredTranslation | null {
  const title = String(doc.translation_title ?? "").trim();
  const content = String(doc.translation_content ?? "").trim();
  if (!title || !content) return null;

  const id = doc._id != null ? String(doc._id) : "";
  const source_key =
    typeof doc.source_key === "string" && doc.source_key.trim()
      ? doc.source_key.trim()
      : id
        ? `story_translation:${id}`
        : `story_translation:${storyId}:${dialect}:${translationFingerprint(title, content).slice(0, 32)}`;

  return {
    story_id: storyId,
    dialect,
    translation_title: title,
    translation_content: content,
    source_key,
  };
}

async function findAllInStoryTranslations(
  db: Db,
  storyId: number,
  dialect: TranslationDialect
): Promise<StoredTranslation[]> {
  const col = db.collection(STORY_TRANSLATIONS_COLLECTION);
  const docs = await col.find({ story_id: storyId, dialect }).toArray();
  const out: StoredTranslation[] = [];
  for (const doc of docs) {
    const row = parseStoryTranslationDoc(doc as Record<string, unknown>, storyId, dialect);
    if (row) out.push(row);
  }
  return out;
}

async function findAllInSubmissions(
  db: Db,
  storyId: number,
  dialect: TranslationDialect
): Promise<StoredTranslation[]> {
  const col = db.collection(SUBMISSIONS_COLLECTION);
  const cursor = col.find({ target_dialect: dialect }).sort({ submitted_at: -1 });
  const out: StoredTranslation[] = [];

  for await (const submission of cursor) {
    const subId = submission._id != null ? String(submission._id) : "";
    const rows = submission.translated_story;
    if (!Array.isArray(rows) || !subId) continue;

    for (const row of rows) {
      if (typeof row !== "object" || row === null) continue;
      const r = row as Record<string, unknown>;
      if (Number(r.story_id) !== storyId) continue;
      const title = String(r.translation_title ?? "").trim();
      const content = String(r.translation ?? "").trim();
      if (!title || !content) continue;
      out.push({
        story_id: storyId,
        dialect,
        translation_title: title,
        translation_content: content,
        source_key: `submission:${subId}`,
      });
    }
  }

  return out;
}

/** Merge sources and drop duplicate text (keep first occurrence). */
function dedupeTranslations(rows: StoredTranslation[]): StoredTranslation[] {
  const seenText = new Set<string>();
  const seenKeys = new Set<string>();
  const out: StoredTranslation[] = [];

  for (const row of rows) {
    const fp = translationFingerprint(row.translation_title, row.translation_content);
    if (seenText.has(fp) || seenKeys.has(row.source_key)) continue;
    seenText.add(fp);
    seenKeys.add(row.source_key);
    out.push(row);
  }

  return out;
}

async function loadTranslationsForStoryDialect(
  db: Db,
  storyId: number,
  dialect: TranslationDialect
): Promise<StoredTranslation[]> {
  const fromStore = await findAllInStoryTranslations(db, storyId, dialect);
  const fromSubs = await findAllInSubmissions(db, storyId, dialect);
  return dedupeTranslations([...fromStore, ...fromSubs]);
}

function toComparisonSide(row: StoredTranslation): ComparisonSide {
  return {
    title: row.translation_title,
    content: row.translation_content,
    dialect: row.dialect,
    sourceKey: row.source_key,
  };
}

export async function buildEvaluationStoryRounds(
  db: Db,
  targetDialect: TranslationDialect
): Promise<EvaluationStoryRound[]> {
  const rounds: EvaluationStoryRound[] = [];

  let roundIndex = 0;
  for (const story of stories) {
    const translations = await loadTranslationsForStoryDialect(db, story.id, targetDialect);

    if (translations.length < 2) {
      rounds.push({
        roundIndex: roundIndex++,
        storyId: story.id,
        englishTitle: story.title,
        englishContent: story.content,
        status: "missing",
      });
      continue;
    }

    const [first, second] = translations;
    const sideA = toComparisonSide(first);
    const sideB = toComparisonSide(second);
    const [left, right] = pickOrder(sideA, sideB);

    rounds.push({
      roundIndex: roundIndex++,
      storyId: story.id,
      englishTitle: story.title,
      englishContent: story.content,
      status: "ready",
      left,
      right,
    });
  }

  return rounds;
}

export function parseTargetDialectParam(value: string | null): TranslationDialect | null {
  const trimmed = (value ?? "").trim();
  return trimmed && isDialect(trimmed) ? trimmed : null;
}
