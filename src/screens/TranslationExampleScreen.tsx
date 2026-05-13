import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import { getDialectLabel, getStoryExampleJsonKey } from "../data/dialects";
import examples from "../data/story_translation_examples.json";

type ExampleTranslations = {
  msa: { title: string; content: string };
  egypt: { title: string; content: string };
  saudi: { title: string; content: string };
  lebanon: { title: string; content: string };
};

type StoryTranslationExample = {
  story_title: string;
  story_content: string;
  translations: ExampleTranslations;
};

const typedExamples = examples as StoryTranslationExample[];

export default function TranslationExampleScreen() {
  const { state, setPhase } = useApp();
  const { selectedDialect } = state;

  useEffect(() => {
    if (!selectedDialect) {
      setPhase("dialect");
    }
  }, [selectedDialect, setPhase]);

  if (!selectedDialect) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-6">
        <p className="text-sm text-neutral-600">Returning to dialect selection…</p>
      </div>
    );
  }

  const exampleStory = typedExamples[0];
  const jsonKey = getStoryExampleJsonKey(selectedDialect);
  const sample = exampleStory?.translations[jsonKey];
  const dialectLabel = getDialectLabel(selectedDialect);

  if (!exampleStory || !sample) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-100 p-6">
        <p className="text-center text-sm text-neutral-600">
          No sample translation is available for your dialect. You can continue to the task.
        </p>
        <button
          type="button"
          onClick={() => setPhase("workspace")}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Continue to translation
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Example</p>
          <h1 className="text-lg font-semibold text-neutral-900">Sample translation in your dialect</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-600">
            Below is one social story in English with a completed translation in{" "}
            <span className="font-medium text-neutral-900">{dialectLabel}</span>. This is only a
            reference for tone and format. Your task will be to translate different stories yourself.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPhase("dialect")}
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
            >
              Change dialect
            </button>
            <button
              type="button"
              onClick={() => setPhase("workspace")}
              className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Start translating
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl p-4 pb-12">
        <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm lg:flex-row">
          <section className="min-h-0 flex-1 border-b border-neutral-200 p-4 lg:border-b-0 lg:border-r">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Original (English)
            </p>
            <p className="mb-1 text-xs text-neutral-500">Title</p>
            <h2 className="mb-6 text-lg font-semibold text-neutral-900">{exampleStory.story_title}</h2>
            <p className="mb-2 text-xs text-neutral-500">Story body</p>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
              {exampleStory.story_content}
            </div>
          </section>

          <section className="min-h-0 flex-1 bg-neutral-50 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Example translation ({dialectLabel})
            </p>
            <p className="mb-1 text-xs text-neutral-500">Title</p>
            <h3 className="mb-6 text-lg font-semibold text-neutral-900" dir="rtl">
              {sample.title}
            </h3>
            <p className="mb-2 text-xs text-neutral-500">Story body</p>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800" dir="rtl">
              {sample.content}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
