import { NextResponse } from "next/server";
import getMongoClientPromise from "@/lib/mongodb";
import {
  finalizeDialectEvaluation,
  parseStoryRating,
  upsertStoryRating,
  validateAllStoriesPresent,
} from "@/lib/dialectEvaluation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const user_name = String(body.user_name ?? "").trim();
    const email = String(body.email ?? "").trim();

    if (!user_name || !email) {
      return NextResponse.json(
        { error: "user_name and email are required." },
        { status: 400 }
      );
    }

    const client = await getMongoClientPromise();
    const dbName = process.env.MONGODB_DB_NAME;
    const db = dbName ? client.db(dbName) : client.db();

    // Save a single story rating (incremental)
    if (body.story_rating != null) {
      const rating = parseStoryRating(body.story_rating);
      if (!rating) {
        return NextResponse.json(
          { error: "story_rating must include valid case_id and all metric scores." },
          { status: 400 }
        );
      }

      await upsertStoryRating(db, email, user_name, rating);
      return NextResponse.json({ ok: true, case_id: rating.case_id }, { status: 200 });
    }

    // Finalize: save all story ratings and mark submission complete
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

    const validationError = validateAllStoriesPresent(parsed);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    await finalizeDialectEvaluation(db, email, user_name, parsed);
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
