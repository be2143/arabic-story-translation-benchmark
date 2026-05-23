import { useDialectEval } from "@/context/DialectEvalContext";
import { getDialectLabel } from "@/data/dialects";

export default function DialectEvalCompletionScreen() {
  const { state, storyCount } = useDialectEval();
  const dialectLabel = state.selectedDialect
    ? getDialectLabel(state.selectedDialect)
    : "your dialect";

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-12">
      <div className="mx-auto max-w-lg">
        <p className="text-sm text-neutral-500">Submission complete</p>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">
          Thank you, {state.user?.name || "participant"}
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-neutral-700">
          Your ratings for all {storyCount} {dialectLabel} stories were submitted to the database
          and this session is marked complete for{" "}
          <span className="font-medium">{state.user?.email}</span>.
        </p>
        <p className="mt-4 text-sm text-neutral-500">You can close this window now.</p>
      </div>
    </div>
  );
}
