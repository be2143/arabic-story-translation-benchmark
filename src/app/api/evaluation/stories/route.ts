import { NextResponse } from "next/server";
import getMongoClientPromise from "@/lib/mongodb";
import { buildEvaluationStoryRounds, parseTargetDialectParam } from "@/lib/evaluationStories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetDialect = parseTargetDialectParam(searchParams.get("dialect"));

    if (!targetDialect) {
      return NextResponse.json(
        { error: "Query parameter dialect is required (MSA, Saudi, Egyptian, or Lebanese)." },
        { status: 400 }
      );
    }

    const client = await getMongoClientPromise();
    const dbName = process.env.MONGODB_DB_NAME;
    const db = dbName ? client.db(dbName) : client.db();

    const rounds = await buildEvaluationStoryRounds(db, targetDialect);

    return NextResponse.json({
      target_dialect: targetDialect,
      rounds,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not load evaluation stories." },
      { status: 500 }
    );
  }
}
