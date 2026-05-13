import { NextResponse } from "next/server";
import getMongoClientPromise from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const user_name = String(body.user_name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const quiz_score = Number(body.quiz_score);
    const quiz_total =
      body.quiz_total !== undefined ? Number(body.quiz_total) : undefined;
    const target_dialect = String(body.target_dialect ?? "").trim();
    const translated_story = body.translated_story;

    if (!user_name || !email || !target_dialect) {
      return NextResponse.json(
        { error: "user_name, email, and target_dialect are required." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(quiz_score) || quiz_score < 0) {
      return NextResponse.json({ error: "quiz_score must be a valid number." }, { status: 400 });
    }
    if (!Array.isArray(translated_story) || translated_story.length === 0) {
      return NextResponse.json(
        { error: "translated_story must be a non-empty array." },
        { status: 400 }
      );
    }

    for (const row of translated_story) {
      if (
        typeof row !== "object" ||
        row === null ||
        typeof (row as { story_id?: unknown }).story_id !== "number" ||
        typeof (row as { story_title?: unknown }).story_title !== "string" ||
        typeof (row as { translation_title?: unknown }).translation_title !== "string" ||
        typeof (row as { translation?: unknown }).translation !== "string"
      ) {
        return NextResponse.json(
          {
            error:
              "Each translated_story item must have story_id (number), story_title (string), translation_title (string), and translation (string).",
          },
          { status: 400 }
        );
      }
    }

    const client = await getMongoClientPromise();
    const dbName = process.env.MONGODB_DB_NAME;
    const db = dbName ? client.db(dbName) : client.db();
    const col = db.collection("submissions");

    const doc = {
      user_name,
      email,
      quiz_score,
      ...(quiz_total !== undefined && Number.isFinite(quiz_total)
        ? { quiz_total }
        : {}),
      target_dialect,
      translated_story,
      submitted_at: new Date(),
    };

    await col.insertOne(doc);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not save submission." }, { status: 500 });
  }
}
