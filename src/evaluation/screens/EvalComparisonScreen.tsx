import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EVALUATION_STORY_COUNT,
  useEvaluation,
} from "@/context/EvaluationContext";
import type { EvaluationComparisonResponse } from "@/types/evaluation";
import RulesChecklistModal from "@/components/RulesChecklistModal";
import { getDialectLabel } from "@/data/dialects";
import type { EvaluationStoryRound, EvaluationStoriesPayload } from "@/types/evaluation";

function translationCardClass(
  side: "left" | "right",
  chosenSide: "left" | "right" | null | undefined,
  reviewing: boolean
): string {
  const base =
    "flex flex-col rounded-lg border p-4 shadow-sm transition-colors duration-200";
  if (!reviewing || chosenSide == null) {
    return `${base} border-neutral-200 bg-white hover:border-neutral-400`;
  }
  if (chosenSide === side) {
    return `${base} border-green-600 bg-green-50 ring-2 ring-green-600/30`;
  }
  return `${base} border-neutral-200 bg-neutral-50/80 opacity-80`;
}

function isStoryComplete(
  round: EvaluationStoryRound,
  response: EvaluationComparisonResponse | undefined
): boolean {
  if (!response) return false;
  if (round.status === "missing") return response.skipped;
  return !response.skipped && response.chosen_side != null;
}

export default function EvalComparisonScreen() {
  const { state, setPhase, upsertComparisonResponse, submitEvaluation } = useEvaluation();
  const { selectedDialect, comparisonResponses, isSubmitting, submissionError } = state;

  const [rounds, setRounds] = useState<EvaluationStoryRound[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  useEffect(() => {
    if (!selectedDialect) {
      queueMicrotask(() => setPhase("dialect"));
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      setIsLoading(true);
      setLoadError(null);
    });

    void (async () => {
      try {
        const res = await fetch(
          `${apiBase}/api/evaluation/stories?dialect=${encodeURIComponent(selectedDialect)}`
        );
        if (!res.ok) {
          let detail = res.statusText;
          try {
            const j = (await res.json()) as { error?: string };
            if (j.error) detail = j.error;
          } catch {
            /* ignore */
          }
          throw new Error(detail || "Could not load stories.");
        }
        const data = (await res.json()) as EvaluationStoriesPayload;
        if (cancelled) return;
        setRounds(data.rounds);
      } catch (e) {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : "Could not load stories.");
        setRounds([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedDialect, setPhase, apiBase]);

  const responsesByStoryId = useMemo(() => {
    const map = new Map<number, EvaluationComparisonResponse>();
    for (const r of comparisonResponses) {
      map.set(r.story_id, r);
    }
    return map;
  }, [comparisonResponses]);

  const totalRounds = rounds.length;
  const safeIndex =
    totalRounds > 0 ? Math.min(Math.max(currentIndex, 0), totalRounds - 1) : 0;
  const current = rounds[safeIndex];
  const currentResponse = current ? responsesByStoryId.get(current.storyId) : undefined;
  const chosenSide = currentResponse?.skipped ? null : currentResponse?.chosen_side;

  const completedCount = useMemo(
    () => rounds.filter((round) => isStoryComplete(round, responsesByStoryId.get(round.storyId))).length,
    [rounds, responsesByStoryId]
  );

  const canSubmit =
    totalRounds >= EVALUATION_STORY_COUNT &&
    completedCount >= EVALUATION_STORY_COUNT &&
    !isSubmitting;

  const dialectLabel = selectedDialect ? getDialectLabel(selectedDialect) : null;

  const recordSkip = useCallback(
    (round: EvaluationStoryRound) => {
      if (!selectedDialect) return;
      upsertComparisonResponse({
        story_id: round.storyId,
        round_index: round.roundIndex,
        target_dialect: selectedDialect,
        left_source_key: round.left?.sourceKey ?? "missing",
        right_source_key: round.right?.sourceKey ?? "missing",
        chosen_side: null,
        skipped: true,
      });
    },
    [upsertComparisonResponse, selectedDialect]
  );

  const handlePick = (side: "left" | "right") => {
    if (!current || current.status !== "ready" || !selectedDialect || isSubmitting) return;
    upsertComparisonResponse({
      story_id: current.storyId,
      round_index: current.roundIndex,
      target_dialect: selectedDialect,
      left_source_key: current.left!.sourceKey,
      right_source_key: current.right!.sourceKey,
      chosen_side: side,
      skipped: false,
    });
  };

  const handleSkipMissing = () => {
    if (!current || isSubmitting) return;
    recordSkip(current);
  };

  const goToStory = (index: number) => {
    if (index < 0 || index >= totalRounds) return;
    setCurrentIndex(index);
  };

  if (!selectedDialect) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-6">
        <p className="text-sm text-neutral-600">Loading…</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-6">
        <p className="text-sm text-neutral-600">Loading stories from the database…</p>
      </div>
    );
  }

  if (loadError || rounds.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-100 p-6">
        <p className="max-w-md text-center text-sm text-neutral-600">
          {loadError ?? "No stories are available for comparison yet."}
        </p>
        <button
          type="button"
          onClick={() => setPhase("dialect")}
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-800"
        >
          Back to dialect selection
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 md:flex-row">
      <aside className="flex shrink-0 flex-col border-b border-neutral-200 bg-white md:w-56 md:border-b-0 md:border-r">
        <div className="p-4">
          <p className="text-xs font-medium text-neutral-500">Stories</p>
          <p className="mt-1 text-xs text-neutral-500">
            {completedCount} of {totalRounds} complete
          </p>
          <nav className="mt-3 max-h-48 overflow-y-auto md:max-h-[calc(100vh-10rem)]">
            {rounds.map((round, index) => {
              const response = responsesByStoryId.get(round.storyId);
              const done = isStoryComplete(round, response);
              const isActive = index === safeIndex;
              const choiceLabel =
                response?.chosen_side === "left"
                  ? "A"
                  : response?.chosen_side === "right"
                    ? "B"
                    : response?.skipped
                      ? "—"
                      : null;

              return (
                <button
                  key={round.storyId}
                  type="button"
                  onClick={() => goToStory(index)}
                  className={`w-full border-l-2 px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? "border-neutral-900 bg-neutral-50 font-medium text-neutral-900"
                      : done
                        ? "border-green-600/50 text-neutral-700 hover:bg-neutral-50"
                        : "border-transparent text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  <span className="text-neutral-400">{round.storyId}.</span>{" "}
                  {round.englishTitle.length > 24
                    ? `${round.englishTitle.slice(0, 24)}…`
                    : round.englishTitle}
                  {round.status === "missing" ? (
                    <span className="ml-1 text-xs text-amber-700">· n/a</span>
                  ) : choiceLabel ? (
                    <span
                      className={`ml-1 text-xs font-medium ${done ? "text-green-700" : "text-neutral-500"}`}
                    >
                      · {choiceLabel}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto border-t border-neutral-200 p-4">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void submitEvaluation()}
            className="w-full rounded-md bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? "Submitting…" : "Submit all choices"}
          </button>
          {!canSubmit ? (
            <p className="mt-2 text-xs leading-relaxed text-neutral-500">
              Complete all {EVALUATION_STORY_COUNT} stories to enable submission.
            </p>
          ) : null}
        </div>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        <header className="border-b border-neutral-200 bg-white px-4 py-4">
          <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Story {safeIndex + 1} of {totalRounds}
              </p>
              <h1 className="text-lg font-semibold text-neutral-900">
                Which Arabic translation is better?
              </h1>
              {dialectLabel ? (
                <p className="mt-2 max-w-3xl text-sm text-neutral-600">
                  Both options are in <strong>{dialectLabel}</strong> from different translators.
                  Choose the version that better matches a good social story for the English text.
                  You can revisit any story from the list on the left.
                </p>
              ) : null}
              <div className="mt-3 h-1.5 max-w-md overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full rounded-full bg-neutral-900 transition-[width] duration-200"
                  style={{ width: `${(completedCount / totalRounds) * 100}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="rounded border border-purple-600 bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700"
            >
              Rules &amp; checklist
            </button>
          </div>
        </header>

        {submissionError ? (
          <div className="mx-auto w-full max-w-6xl px-4 pt-4">
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              <p className="font-medium">Could not save your responses</p>
              <p className="mt-1">{submissionError}</p>
            </div>
          </div>
        ) : null}

        {current ? (
          <div className="mx-auto w-full max-w-6xl flex-1 space-y-6 p-4 pb-24">
            {chosenSide ? (
              <p className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-900">
                Your choice for this story:{" "}
                <strong>Translation {chosenSide === "left" ? "A" : "B"}</strong>. Click the other
                option to change your answer.
              </p>
            ) : null}

            <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                English story
              </p>
              <p className="mb-1 text-xs text-neutral-500">Title</p>
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">{current.englishTitle}</h2>
              <p className="mb-2 text-xs text-neutral-500">Story body</p>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
                {current.englishContent}
              </div>
            </section>

            {current.status === "missing" ? (
              <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
                <p className="text-sm font-medium text-amber-950">No story yet</p>
                <p className="mt-2 text-sm leading-relaxed text-amber-900">
                  Fewer than two {dialectLabel ?? "dialect"} translations for this story are in the
                  database yet. Mark as unavailable to count this story toward submission.
                </p>
                <button
                  type="button"
                  onClick={handleSkipMissing}
                  disabled={isSubmitting || currentResponse?.skipped}
                  className="mt-6 rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  {currentResponse?.skipped ? "Marked unavailable" : "Mark unavailable & continue"}
                </button>
              </section>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                <section className={translationCardClass("left", chosenSide, Boolean(chosenSide))}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Translation A
                    </p>
                    {chosenSide === "left" ? (
                      <span className="rounded-full bg-green-700 px-2 py-0.5 text-xs font-medium text-white">
                        Your choice
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-neutral-900" dir="rtl">
                    {current.left!.title}
                  </h3>
                  <div
                    className="mt-3 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800"
                    dir="rtl"
                  >
                    {current.left!.content}
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePick("left")}
                    disabled={isSubmitting}
                    className={`mt-4 w-full rounded-md py-3 text-sm font-medium disabled:opacity-50 ${
                      chosenSide === "left"
                        ? "bg-green-800 text-white hover:bg-green-900"
                        : "bg-neutral-900 text-white hover:bg-neutral-800"
                    }`}
                  >
                    {chosenSide === "left" ? "A selected" : "A is better"}
                  </button>
                </section>

                <section className={translationCardClass("right", chosenSide, Boolean(chosenSide))}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Translation B
                    </p>
                    {chosenSide === "right" ? (
                      <span className="rounded-full bg-green-700 px-2 py-0.5 text-xs font-medium text-white">
                        Your choice
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-neutral-900" dir="rtl">
                    {current.right!.title}
                  </h3>
                  <div
                    className="mt-3 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800"
                    dir="rtl"
                  >
                    {current.right!.content}
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePick("right")}
                    disabled={isSubmitting}
                    className={`mt-4 w-full rounded-md py-3 text-sm font-medium disabled:opacity-50 ${
                      chosenSide === "right"
                        ? "bg-green-800 text-white hover:bg-green-900"
                        : "border border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    {chosenSide === "right" ? "B selected" : "B is better"}
                  </button>
                </section>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-4">
              <button
                type="button"
                onClick={() => goToStory(safeIndex - 1)}
                disabled={safeIndex === 0}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-800 disabled:opacity-40"
              >
                Previous story
              </button>
              <p className="text-xs text-neutral-500">
                {completedCount} / {totalRounds} stories complete
              </p>
              <button
                type="button"
                onClick={() => goToStory(safeIndex + 1)}
                disabled={safeIndex >= totalRounds - 1}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-800 disabled:opacity-40"
              >
                Next story
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <RulesChecklistModal
        open={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        variant="evaluation"
      />
    </div>
  );
}
