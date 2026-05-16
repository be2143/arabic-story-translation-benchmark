import { useState } from "react";
import {
  countCompletedStories,
  isStoryScoresComplete,
  useDialectEval,
} from "@/context/DialectEvalContext";
import { DIALECT_EVAL_STORY_COUNT } from "@/data/dialectEvalCases";
import { dialectEvalCases } from "@/data/dialectEvalCases";
import {
  CONFIDENCE_LABEL,
  DF_INSTRUCTIONS,
  DO_INSTRUCTIONS,
  SC_INSTRUCTIONS,
  SS_INSTRUCTIONS,
} from "@/data/dialectEvalInstructions";
import InstructionPanel from "@/dialect-eval/components/InstructionPanel";
import ScoreSelect from "@/dialect-eval/components/ScoreSelect";
import type { DialectEvalStoryScores } from "@/types/dialectEval";

export default function DialectEvalWorkspaceScreen() {
  const { state, setStoryScores, saveStoryRating, submitDialectEvaluation } = useDialectEval();
  const { scoresByCaseId, savedCaseIds, isSavingStory, isSubmitting, submissionError, storySaveError } =
    state;

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentCase = dialectEvalCases[currentIndex];
  const scores = scoresByCaseId[currentCase.case_id];

  const completedCount = countCompletedStories(scoresByCaseId);
  const canSubmit = completedCount >= DIALECT_EVAL_STORY_COUNT && !isSubmitting;
  const storyComplete = scores && isStoryScoresComplete(scores);
  const storySaved = Boolean(savedCaseIds[currentCase.case_id]);

  const handleSaveStory = async () => {
    if (!storyComplete) return;
    await saveStoryRating(currentCase.case_id);
  };

  const handleNextStory = async () => {
    if (storyComplete && !storySaved) {
      const ok = await saveStoryRating(currentCase.case_id);
      if (!ok) return;
    }
    setCurrentIndex((i) => Math.min(i + 1, DIALECT_EVAL_STORY_COUNT - 1));
  };

  const updateDo = (field: "descriptive_count" | "coaching_count" | "notes", value: number | string) => {
    setStoryScores(currentCase.case_id, {
      ...scores,
      descriptive_orientation: {
        ...scores.descriptive_orientation,
        [field]: value,
      },
    });
  };

  const updateDim = (
    key: "structural_clarity" | "situational_safety",
    field: string,
    value: number | string
  ) => {
    setStoryScores(currentCase.case_id, {
      ...scores,
      [key]: { ...scores[key], [field]: value },
    });
  };

  const updateDf = (field: string, value: number | string) => {
    setStoryScores(currentCase.case_id, {
      ...scores,
      dialect_fluency: { ...scores.dialect_fluency, [field]: value },
    });
  };

  if (!scores) return null;

  const doResult = scores.descriptive_orientation;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 md:flex-row">
      <aside className="flex shrink-0 flex-col border-b border-neutral-200 bg-white md:w-56 md:border-b-0 md:border-r">
        <div className="p-4">
          <p className="text-xs font-medium text-neutral-500">Stories</p>
          <p className="mt-1 text-xs text-neutral-500">
            {completedCount} of {DIALECT_EVAL_STORY_COUNT} complete
          </p>
          <nav className="mt-3 max-h-48 overflow-y-auto md:max-h-[calc(100vh-10rem)]">
            {dialectEvalCases.map((c, i) => {
              const done = isStoryScoresComplete(scoresByCaseId[c.case_id]);
              const saved = Boolean(savedCaseIds[c.case_id]);
              return (
                <button
                  key={c.case_id}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`w-full border-l-2 px-3 py-2 text-left text-sm transition-colors ${
                    i === currentIndex
                      ? "border-neutral-900 bg-neutral-50 font-medium"
                      : done
                        ? "border-green-600/50 text-neutral-700"
                        : "border-transparent text-neutral-600"
                  }`}
                >
                  <span className="text-neutral-400">{i + 1}.</span> {c.english_title.slice(0, 22)}
                  {c.english_title.length > 22 ? "…" : ""}
                  {saved ? <span className="ml-1 text-blue-700" title="Saved to database">✓</span> : null}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto border-t border-neutral-200 p-4">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void submitDialectEvaluation()}
            className="w-full rounded-md bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? "Submitting…" : "Submit all ratings"}
          </button>
          {!canSubmit ? (
            <p className="mt-2 text-xs text-neutral-500">
              Complete all {DIALECT_EVAL_STORY_COUNT} stories to submit.
            </p>
          ) : null}
        </div>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        <header className="border-b border-neutral-200 bg-white px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Story {currentIndex + 1} of {DIALECT_EVAL_STORY_COUNT} · {currentCase.case_id}
          </p>
          <h1 className="text-lg font-semibold text-neutral-900">{currentCase.english_title}</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Target dialect: <strong>{currentCase.target_dialect}</strong> · Base {currentCase.base_story_id}
          </p>
        </header>

        {submissionError || storySaveError ? (
          <div className="mx-auto w-full max-w-4xl px-4 pt-4">
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              {submissionError ?? storySaveError}
            </p>
          </div>
        ) : null}

        <div className="mx-auto w-full max-w-4xl flex-1 space-y-6 overflow-y-auto p-4 pb-20">
          {storyComplete ? (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
              All four metrics are filled for this story.
              {storySaved ? " Saved to database." : " Save or go to the next story to store your ratings."}
            </p>
          ) : null}

          <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="mb-2 text-xs font-medium uppercase text-neutral-500">
                Arabic story ({currentCase.target_dialect})
              </p>
              <div
                className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800"
                dir="rtl"
              >
                {currentCase.story_text}
              </div>
          </section>

          <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-neutral-900">1. {DO_INSTRUCTIONS.title}</h2>
            <InstructionPanel
              summary={DO_INSTRUCTIONS.summary}
              sections={DO_INSTRUCTIONS.sections}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="do-d" className="text-sm text-neutral-700">
                  Descriptive count (D)
                </label>
                <input
                  id="do-d"
                  type="number"
                  min={0}
                  value={doResult.descriptive_count}
                  onChange={(e) => updateDo("descriptive_count", Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="do-c" className="text-sm text-neutral-700">
                  Coaching count (C)
                </label>
                <input
                  id="do-c"
                  type="number"
                  min={0}
                  value={doResult.coaching_count}
                  onChange={(e) => updateDo("coaching_count", Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="rounded-md bg-neutral-50 px-3 py-2 text-sm">
              Ratio:{" "}
              {doResult.numeric_ratio != null ? doResult.numeric_ratio.toFixed(2) : "n/a"} · Result:{" "}
              <strong className={doResult.result === "pass" ? "text-green-800" : "text-red-800"}>
                {doResult.result}
              </strong>
            </div>
            <div>
              <label htmlFor="do-notes" className="text-sm text-neutral-700">
                Notes (optional)
              </label>
              <textarea
                id="do-notes"
                rows={2}
                value={doResult.notes}
                onChange={(e) => updateDo("notes", e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </section>

          <DimensionSection
            title={`2. ${SC_INSTRUCTIONS.title}`}
            instructions={SC_INSTRUCTIONS}
            scores={scores.structural_clarity}
            idPrefix="sc"
            onQ={(q, v) => updateDim("structural_clarity", q, v)}
            onField={(f, v) => updateDim("structural_clarity", f, v)}
          />

          <DimensionSection
            title={`3. ${SS_INSTRUCTIONS.title}`}
            instructions={SS_INSTRUCTIONS}
            scores={scores.situational_safety}
            idPrefix="ss"
            onQ={(q, v) => updateDim("situational_safety", q, v)}
            onField={(f, v) => updateDim("situational_safety", f, v)}
          />

          <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-neutral-900">4. {DF_INSTRUCTIONS.title}</h2>
            <InstructionPanel
              summary={DF_INSTRUCTIONS.summary}
              anchors={DF_INSTRUCTIONS.anchors}
              sections={DF_INSTRUCTIONS.sections}
            />
            {DF_INSTRUCTIONS.questions.map((q, i) => (
              <ScoreSelect
                key={q}
                id={`df-q${i + 1}`}
                label={q}
                value={scores.dialect_fluency[`Q${i + 1}` as "Q1" | "Q2"]}
                onChange={(v) => updateDf(`Q${i + 1}`, v)}
              />
            ))}
            <div>
              <label htmlFor="df-cons" className="text-sm text-neutral-700">
                Consistency note (quote evidence)
              </label>
              <textarea
                id="df-cons"
                rows={2}
                value={scores.dialect_fluency.consistency_note}
                onChange={(e) => updateDf("consistency_note", e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="df-reg" className="text-sm text-neutral-700">
                Regional appropriateness note (quote evidence)
              </label>
              <textarea
                id="df-reg"
                rows={2}
                value={scores.dialect_fluency.regional_note}
                onChange={(e) => updateDf("regional_note", e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <ConfidenceFields
              idPrefix="df"
              confidence={scores.dialect_fluency.confidence}
              confidence_note={scores.dialect_fluency.confidence_note}
              onChange={(c, n) => {
                updateDf("confidence", c);
                updateDf("confidence_note", n);
              }}
            />
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-4">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
            >
              Previous story
            </button>
            <button
              type="button"
              disabled={!storyComplete || isSavingStory}
              onClick={() => void handleSaveStory()}
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
            >
              {isSavingStory ? "Saving…" : storySaved ? "Saved" : "Save story"}
            </button>
            <button
              type="button"
              disabled={currentIndex >= DIALECT_EVAL_STORY_COUNT - 1 || isSavingStory}
              onClick={() => void handleNextStory()}
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
            >
              Next story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DimensionSection({
  title,
  instructions,
  scores,
  idPrefix,
  onQ,
  onField,
}: {
  title: string;
  instructions: typeof SC_INSTRUCTIONS;
  scores: DialectEvalStoryScores["structural_clarity"];
  idPrefix: string;
  onQ: (q: string, v: number) => void;
  onField: (f: string, v: string | number) => void;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
      <InstructionPanel
        summary={instructions.summary}
        anchors={instructions.anchors}
        sections={instructions.sections}
        rationale={instructions.rationale}
      />
      {instructions.questions.map((q, i) => (
        <ScoreSelect
          key={q}
          id={`${idPrefix}-q${i + 1}`}
          label={q}
          value={scores[`Q${i + 1}` as keyof typeof scores] as number | null}
          onChange={(v) => onQ(`Q${i + 1}`, v)}
        />
      ))}
      <div>
        <label htmlFor={`${idPrefix}-rat`} className="text-sm text-neutral-700">
          Rationale (2–4 sentences, include quote fragments)
        </label>
        <textarea
          id={`${idPrefix}-rat`}
          rows={3}
          value={scores.rationale}
          onChange={(e) => onField("rationale", e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <ConfidenceFields
        idPrefix={idPrefix}
        confidence={scores.confidence}
        confidence_note={scores.confidence_note}
        onChange={(c, n) => {
          onField("confidence", c);
          onField("confidence_note", n);
        }}
      />
    </section>
  );
}

function ConfidenceFields({
  idPrefix,
  confidence,
  confidence_note,
  onChange,
}: {
  idPrefix: string;
  confidence: 1 | 2 | 3 | null;
  confidence_note: string;
  onChange: (confidence: 1 | 2 | 3, note: string) => void;
}) {
  return (
    <div className="rounded-md border border-neutral-100 bg-neutral-50/80 p-3">
      <p className="text-xs text-neutral-600">{CONFIDENCE_LABEL}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {([1, 2, 3] as const).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n, confidence_note)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              confidence === n
                ? "bg-neutral-900 text-white"
                : "border border-neutral-300 bg-white text-neutral-800"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {confidence === 1 || confidence === 2 ? (
        <textarea
          id={`${idPrefix}-confidence-note`}
          rows={2}
          placeholder="Confidence note"
          value={confidence_note}
          onChange={(e) => onChange(confidence ?? 2, e.target.value)}
          className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      ) : null}
    </div>
  );
}
