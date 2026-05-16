import { NextResponse } from "next/server";
import getMongoClientPromise from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DIALECTS = ["MSA", "Saudi", "Egyptian", "Lebanese"] as const;

function isDialect(x: string): boolean {
  return DIALECTS.includes(x as (typeof DIALECTS)[number]);
}

function isChosenSide(x: string): x is "left" | "right" {
  return x === "left" || x === "right";
}

function parseComparison(row: unknown): Record<string, unknown> | null {
  if (typeof row !== "object" || row === null) return null;
  const r = row as Record<string, unknown>;
  const story_id = Number(r.story_id);
  const round_index = Number(r.round_index);
  const target_dialect = String(r.target_dialect ?? "").trim();
  const left_source_key = String(r.left_source_key ?? "").trim();
  const right_source_key = String(r.right_source_key ?? "").trim();
  const skipped = Boolean(r.skipped);

  if (!Number.isFinite(story_id) || !Number.isFinite(round_index)) return null;
  if (!isDialect(target_dialect)) return null;
  if (!left_source_key || !right_source_key) return null;

  if (skipped) {
    return {
      story_id,
      round_index,
      target_dialect,
      left_source_key,
      right_source_key,
      skipped: true,
      chosen_side: null,
    };
  }

  const chosen_side = String(r.chosen_side ?? "").trim();
  if (!isChosenSide(chosen_side)) return null;

  return {
    story_id,
    round_index,
    target_dialect,
    left_source_key,
    right_source_key,
    chosen_side,
    skipped: false,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const user_name = String(body.user_name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const quiz_score = Number(body.quiz_score);
    const quiz_total =
      body.quiz_total !== undefined ? Number(body.quiz_total) : undefined;
    const target_dialect = String(body.target_dialect ?? "").trim();
    const comparisons = body.comparisons;

    if (!user_name || !email || !target_dialect) {
      return NextResponse.json(
        { error: "user_name, email, and target_dialect are required." },
        { status: 400 }
      );
    }
    if (!isDialect(target_dialect)) {
      return NextResponse.json({ error: "target_dialect is invalid." }, { status: 400 });
    }
    if (!Number.isFinite(quiz_score) || quiz_score < 0) {
      return NextResponse.json({ error: "quiz_score must be a valid number." }, { status: 400 });
    }
    if (!Array.isArray(comparisons) || comparisons.length === 0) {
      return NextResponse.json(
        { error: "comparisons must be a non-empty array." },
        { status: 400 }
      );
    }

    const parsedComparisons = [];
    for (const row of comparisons) {
      const parsed = parseComparison(row);
      if (!parsed) {
        return NextResponse.json(
          {
            error:
              "Each comparison must include story_id, round_index, target_dialect, left_source_key, right_source_key, skipped (boolean), and chosen_side (left|right) when not skipped.",
          },
          { status: 400 }
        );
      }
      parsedComparisons.push(parsed);
    }

    const client = await getMongoClientPromise();
    const dbName = process.env.MONGODB_DB_NAME;
    const db = dbName ? client.db(dbName) : client.db();
    const col = db.collection("evaluation_submissions");

    const doc = {
      user_name,
      email,
      quiz_score,
      ...(quiz_total !== undefined && Number.isFinite(quiz_total) ? { quiz_total } : {}),
      target_dialect,
      comparisons: parsedComparisons,
      submitted_at: new Date(),
    };

    await col.insertOne(doc);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not save evaluation." }, { status: 500 });
  }
}
