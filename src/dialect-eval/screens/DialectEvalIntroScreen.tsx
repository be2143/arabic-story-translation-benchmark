import { useDialectEval } from "@/context/DialectEvalContext";
import { getDialectLabel } from "@/data/dialects";
import {
  DF_INSTRUCTIONS,
  DO_INSTRUCTIONS,
  SC_INSTRUCTIONS,
  SS_INSTRUCTIONS,
} from "@/data/dialectEvalInstructions";

export default function DialectEvalIntroScreen() {
  const { setPhase, state, storyCount } = useDialectEval();
  const dialectLabel = state.selectedDialect
    ? getDialectLabel(state.selectedDialect)
    : "your dialect";

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <p className="mb-2 text-sm text-neutral-500">Task introduction</p>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-neutral-900">
          Dialect social story evaluation
        </h1>

        <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6 text-sm leading-relaxed text-neutral-700 shadow-sm">
          <p>
            You will evaluate <strong>{storyCount} Arabic stories</strong> in{" "}
            <strong>{dialectLabel}</strong>, one at a time. For each story, apply all{" "}
            <strong>four metrics</strong> and enter your scores before moving on.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>{DO_INSTRUCTIONS.title}</strong> — count Descriptive vs Coaching sentences;
              pass if ratio ≥ 2:1.
            </li>
            <li>
              <strong>{SC_INSTRUCTIONS.title}</strong> — five questions (1–5) on story structure.
            </li>
            <li>
              <strong>{SS_INSTRUCTIONS.title}</strong> — five questions (1–5) on tone and safety.
            </li>
            <li>
              <strong>{DF_INSTRUCTIONS.title}</strong> — two questions (1–5) on dialect
              consistency and regional fit.
            </li>
          </ul>
          <p>
            Full scoring anchors and question wording are shown on each story page. After you score
            a story, use <strong>Submit story</strong> (or <strong>Next story</strong>) to write that
            story&apos;s ratings to the database immediately — you do not wait until the end. When all{" "}
            {storyCount} stories are submitted, use <strong>Finish evaluation</strong> to close your
            session.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPhase("evaluate")}
          className="mt-8 rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Start evaluation
        </button>
      </div>
    </div>
  );
}
