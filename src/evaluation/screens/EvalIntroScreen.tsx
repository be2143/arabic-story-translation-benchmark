import { useEvaluation } from "@/context/EvaluationContext";

export default function EvalIntroScreen() {
  const { setPhase } = useEvaluation();

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <p className="mb-2 text-sm text-neutral-500">Task introduction</p>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">
          Evaluating Arabic translations of social stories
        </h1>

        <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6 text-sm leading-relaxed text-neutral-700 shadow-sm">
          <p>
            In this session you will read <b>12 social stories</b> in English and two Arabic translations of the same story. You task is to choose the best translation between the two options. The dialect you will be working with is indicated in your invitation email.
          </p>
          <p>
          First you will complete a brief module on social stories, then take a short quiz to check your understanding. After that, you can begin evaluating the translations of the stories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPhase("education")}
          className="mt-8 rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Go to education module
        </button>
      </div>
    </div>
  );
}
