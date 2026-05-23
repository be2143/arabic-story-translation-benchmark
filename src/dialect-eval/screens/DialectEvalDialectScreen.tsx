import { useState } from "react";
import { useDialectEval } from "@/context/DialectEvalContext";
import { DIALECT_OPTIONS } from "@/data/dialects";
import { getDialectEvalStoryCount } from "@/data/dialectEvalCases";
import type { TranslationDialect } from "@/context/AppContext";

export default function DialectEvalDialectScreen() {
  const { state, setSelectedDialect, setPhase } = useDialectEval();
  const [choice, setChoice] = useState<TranslationDialect | null>(
    () => state.selectedDialect
  );

  const handleContinue = () => {
    if (!choice) return;
    setSelectedDialect(choice);
    setPhase("intro");
  };

  const storyCount = choice ? getDialectEvalStoryCount(choice) : null;

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-12">
      <div className="mx-auto max-w-lg">
        <p className="mb-2 text-sm text-neutral-500">Before evaluation</p>
        <h1 className="mb-4 text-2xl font-semibold tracking-tight text-neutral-900">
          Choose your assigned dialect
        </h1>

        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
          <p className="font-medium text-amber-950">Important</p>
          <p className="mt-2">
            Your <strong>assigned dialect</strong> is stated in the invitation email you received.
          </p>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-neutral-700">
          Select the dialect you were assigned below. You will rate Arabic stories generated for
          that dialect only.
        </p>

        <fieldset className="space-y-2 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <legend className="sr-only">Assigned Arabic dialect</legend>
          {DIALECT_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-3 text-sm transition-colors ${
                choice === value
                  ? "border-neutral-900 bg-neutral-50"
                  : "border-neutral-200 hover:bg-neutral-50/80"
              }`}
            >
              <input
                type="radio"
                name="dialect-eval-dialect"
                value={value}
                checked={choice === value}
                onChange={() => setChoice(value)}
                className="h-4 w-4 border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <span className="font-medium text-neutral-900">{label}</span>
            </label>
          ))}
        </fieldset>

        {storyCount != null ? (
          <p className="mt-4 text-sm text-neutral-600">
            You will evaluate <strong>{storyCount}</strong> stories in this dialect.
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleContinue}
          disabled={!choice}
          className="mt-8 w-full rounded-md bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
