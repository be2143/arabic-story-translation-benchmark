import { NextResponse } from "next/server";
import getMongoClientPromise from "@/lib/mongodb";
import {
  finalizeDialectEvaluation,
  finalizeDialectEvaluationInDb,
  isDialect,
  parseStoryRating,
  upsertStoryRating,
  validateAllStoriesPresent,
  validateCaseForDialect,
} from "@/lib/dialectEvaluation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const user_name = String(body.user_name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const target_dialect = String(body.target_dialect ?? "").trim();

    if (!user_name || !email) {
      return NextResponse.json(
        { error: "user_name and email are required." },
        { status: 400 }
      );
    }
    if (!isDialect(target_dialect)) {
      return NextResponse.json({ error: "target_dialect is invalid." }, { status: 400 });
    }

    const client = await getMongoClientPromise();
    const dbName = process.env.MONGODB_DB_NAME;
    const db = dbName ? client.db(dbName) : client.db();

    if (body.finalize === true) {
      const validationError = await finalizeDialectEvaluationInDb(
        db,
        email,
        user_name,
        target_dialect
      );
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }
      return NextResponse.json({ ok: true, finalized: true }, { status: 200 });
    }

    if (body.story_rating != null) {
      const rating = parseStoryRating(body.story_rating);
      if (!rating) {
        return NextResponse.json(
          { error: "story_rating must include valid case_id and all metric scores." },
          { status: 400 }
        );
      }

      if (!validateCaseForDialect(String(rating.case_id), target_dialect)) {
        return NextResponse.json(
          { error: "This story does not belong to the selected dialect." },
          { status: 400 }
        );
      }

      await upsertStoryRating(db, email, user_name, target_dialect, rating);
      return NextResponse.json({ ok: true, case_id: rating.case_id }, { status: 200 });
    }

    const story_ratings = body.story_ratings;
    if (!Array.isArray(story_ratings)) {
      return NextResponse.json(
        { error: "story_rating or story_ratings is required." },
        { status: 400 }
      );
    }

    const parsed = [];
    for (const row of story_ratings) {
      const rating = parseStoryRating(row);
      if (!rating) {
        return NextResponse.json(
          { error: "Each story rating must include valid case_id and all metric scores." },
          { status: 400 }
        );
      }
      parsed.push(rating);
    }

    const validationError = validateAllStoriesPresent(parsed, target_dialect);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    await finalizeDialectEvaluation(db, email, user_name, target_dialect, parsed);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error && err.message.includes("MONGODB_URI")
        ? err.message
        : "Could not save dialect evaluation.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
