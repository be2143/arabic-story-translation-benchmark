import { useApp, isStoryTranslationComplete } from "../context/AppContext";
import { getDialectLabel } from "../data/dialects";
import { stories } from "../data/stories";

export default function CompletionScreen() {
  const { state } = useApp();
  const dialectLabel = state.selectedDialect
    ? getDialectLabel(state.selectedDialect)
    : null;

  const storyTotal = stories.length;

  const completedCount = Object.values(state.translations).filter((t) =>
    isStoryTranslationComplete(t)
  ).length;

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-12">
      <div className="mx-auto max-w-lg">
        <p className="text-sm text-neutral-500">Submission complete</p>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">
          Thank you, {state.user?.name || "participant"}
        </h1>

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-neutral-700">
          <p>
            Your translations were submitted. You completed both title and story body for{" "}
            <span className="font-medium text-neutral-900">
              {completedCount} out of {storyTotal}
            </span>{" "}
            stories.
          </p>
          <p>
            A confirmation is recorded for{" "}
            <span className="font-medium text-neutral-900">{state.user?.email}</span>.
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-5 text-sm shadow-sm">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Summary
          </h2>
          <dl className="space-y-3">
            {dialectLabel ? (
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-600">Dialect</dt>
                <dd className="text-right font-medium text-neutral-900">{dialectLabel}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-600">Participant</dt>
              <dd className="text-right font-medium text-neutral-900">{state.user?.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-600">Email</dt>
              <dd className="text-right font-medium text-neutral-900">{state.user?.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-600">Stories complete (title &amp; body)</dt>
              <dd className="text-right font-medium text-neutral-900">
                {completedCount} / {storyTotal}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-600">Quiz score</dt>
              <dd className="text-right font-medium text-neutral-900">
                {state.quizResults.filter((r) => r.isCorrect).length} /{" "}
                {state.quizResults.length || "—"}
              </dd>
            </div>
          </dl>
        </div>

        <p className="mt-8 text-sm text-neutral-500">
        You can close this window now. Thank you for your help with this study. We will look over your translations and then contact you to arrange compensation.        </p>
      </div>
    </div>
  );
}
