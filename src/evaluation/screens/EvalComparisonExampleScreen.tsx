import { useEffect, useMemo, useState } from "react";
import { useEvaluation } from "@/context/EvaluationContext";
import { getDialectLabel } from "@/data/dialects";
import {
  getEvaluationExampleStory,
  pickExampleOrder,
} from "@/lib/evaluationExampleStory";

type ExampleSide = "left" | "right";

export default function EvalComparisonExampleScreen() {
  const { state, setPhase, startComparisons } = useEvaluation();
  const { selectedDialect } = state;

  const example = selectedDialect ? getEvaluationExampleStory(selectedDialect) : null;

  const layout = useMemo(() => {
    if (!example) return null;
    return pickExampleOrder(
      { title: example.good.title, content: example.good.content },
      { title: example.bad.title, content: example.bad.content }
    );
  }, [example]);

  const goodSide: ExampleSide | null = layout
    ? layout.goodSide
    : null;

  const [picked, setPicked] = useState<ExampleSide | null>(null);

  useEffect(() => {
    if (!selectedDialect) {
      queueMicrotask(() => setPhase("dialect"));
    }
  }, [selectedDialect, setPhase]);

  const dialectLabel = selectedDialect ? getDialectLabel(selectedDialect) : null;
  const pickedGood = picked != null && goodSide != null && picked === goodSide;

  const handlePick = (side: ExampleSide) => {
    if (picked != null || !layout) return;
    setPicked(side);
  };

  const handleStart = () => {
    if (!selectedDialect) return;
    startComparisons(selectedDialect);
  };

  if (!selectedDialect) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-6">
        <p className="text-sm text-neutral-600">Loading…</p>
      </div>
    );
  }

  if (!example || !layout || !goodSide) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-100 p-6">
        <p className="max-w-md text-center text-sm text-neutral-600">
          The practice example is not available for {dialectLabel ?? "this dialect"} yet. You can
          continue to the evaluation stories.
        </p>
        <button
          type="button"
          onClick={handleStart}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Continue to stories
        </button>
      </div>
    );
  }

  const leftIsGood = goodSide === "left";

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Practice example
          </p>
          <h1 className="text-lg font-semibold text-neutral-900">
            Which translation is better?
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-600">
            Before the real task, try one example in <strong>{dialectLabel}</strong>. Read the
            English story, then choose the Arabic translation that follows good social-story
            guidelines (calm tone, first person, no harsh “you” commands).
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 p-4 pb-16">
        <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
            English story
          </p>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">{example.englishTitle}</h2>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
            {example.englishContent}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <ExampleCard
            label="Translation A"
            title={layout.left.title}
            content={layout.left.content}
            side="left"
            picked={picked}
            isGood={leftIsGood}
            onPick={() => handlePick("left")}
          />
          <ExampleCard
            label="Translation B"
            title={layout.right.title}
            content={layout.right.content}
            side="right"
            picked={picked}
            isGood={!leftIsGood}
            onPick={() => handlePick("right")}
          />
        </div>

        {picked != null ? (
          <div
            className={`rounded-lg border p-5 text-sm leading-relaxed ${
              pickedGood
                ? "border-green-200 bg-green-50 text-green-950"
                : "border-amber-200 bg-amber-50 text-amber-950"
            }`}
          >
            <p className="font-medium">
              {pickedGood ? "Correct — well done." : "Not quite — here is the better choice."}
            </p>
            <p className="mt-2">
              The better translation is{" "}
              <strong>Translation {goodSide === "left" ? "A" : "B"}</strong>. It keeps the full
              English meaning, uses clear one-sentence-at-a-time structure, and maintains a calm,
              patient first-person tone.
            </p>
            <div className="mt-4 rounded-md border border-amber-300/60 bg-white/60 p-4">
              <p className="font-medium text-amber-950">
                Why Translation {goodSide === "left" ? "B" : "A"} is weaker
              </p>
              {example.badReasons.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-amber-950">
                  {example.badReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-amber-950">
                  It drops important ideas, merges sentences in ways that reduce clarity, and
                  weakens the reassuring learning tone of the story.
                </p>
              )}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3 border-t border-neutral-200 pt-6">
          <button
            type="button"
            onClick={() => setPhase("dialect")}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
          >
            Change dialect
          </button>
          <button
            type="button"
            onClick={handleStart}
            disabled={picked == null}
            className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start evaluating the 12 stories
          </button>
        </div>
      </div>
    </div>
  );
}

function ExampleCard({
  label,
  title,
  content,
  side,
  picked,
  isGood,
  onPick,
}: {
  label: string;
  title: string;
  content: string;
  side: ExampleSide;
  picked: ExampleSide | null;
  isGood: boolean;
  onPick: () => void;
}) {
  const isPicked = picked === side;
  const showResult = picked != null;

  let cardClass = "flex flex-col rounded-lg border p-4 shadow-sm transition-colors ";
  if (!showResult) {
    cardClass += "border-neutral-200 bg-white hover:border-neutral-400";
  } else if (isPicked && isGood) {
    cardClass += "border-green-600 bg-green-50 ring-2 ring-green-600/30";
  } else if (isPicked && !isGood) {
    cardClass += "border-amber-500 bg-amber-50 ring-2 ring-amber-500/30";
  } else if (!isPicked && isGood) {
    cardClass += "border-green-600 bg-green-50/60";
  } else {
    cardClass += "border-neutral-200 bg-neutral-50 opacity-80";
  }

  return (
    <section className={cardClass}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
        {showResult && isGood ? (
          <span className="rounded-full bg-green-700 px-2 py-0.5 text-xs font-medium text-white">
            Better translation
          </span>
        ) : null}
        {showResult && isPicked && !isGood ? (
          <span className="rounded-full bg-amber-600 px-2 py-0.5 text-xs font-medium text-white">
            Weaker translation
          </span>
        ) : null}
      </div>
      <h3 className="mt-2 text-base font-semibold text-neutral-900" dir="rtl">
        {title}
      </h3>
      <div
        className="mt-3 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800"
        dir="rtl"
      >
        {content}
      </div>
      <button
        type="button"
        onClick={onPick}
        disabled={picked != null}
        className={`mt-4 w-full rounded-md py-3 text-sm font-medium disabled:cursor-default ${
          isPicked && showResult && isGood
            ? "bg-green-800 text-white"
            : isPicked && showResult
              ? "border border-amber-600 bg-white text-amber-900"
              : "bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50"
        }`}
      >
        {picked == null ? `${label.slice(-1)} is better` : isPicked ? "Your choice" : label}
      </button>
    </section>
  );
}
