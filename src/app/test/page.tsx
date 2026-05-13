import type { Metadata } from "next";
import examples from "@/data/story_translation_examples.json";

export const metadata: Metadata = {
  title: "Story & translation examples",
  description: "Reference layout from story_translation_examples.json",
};

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

const DIALECT_ORDER: { key: keyof ExampleTranslations; label: string }[] = [
  { key: "msa", label: "MSA (Modern Standard Arabic)" },
  { key: "egypt", label: "Egyptian Arabic" },
  { key: "saudi", label: "Saudi Arabic" },
  { key: "lebanon", label: "Lebanese Arabic" },
];

export default function TestPage() {
  const story = typedExamples[0];

  if (!story) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-6">
        <p className="text-sm text-neutral-600">No example stories are defined.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Test / examples</p>
        <h1 className="text-base font-semibold text-neutral-900">Story and translations (reference data)</h1>
        <p className="mt-1 text-xs text-neutral-600">
          Loaded from <code className="rounded bg-neutral-100 px-1 py-0.5">story_translation_examples.json</code> — not
          the main study stories.
        </p>
      </header>

      <div className="mx-auto max-w-6xl p-4 pb-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-0 lg:overflow-hidden lg:rounded-lg lg:border lg:border-neutral-200 lg:bg-white lg:shadow-sm">
          <section className="min-h-0 flex-1 overflow-y-auto border border-neutral-200 bg-white p-4 shadow-sm lg:border-0 lg:shadow-none">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">Original (English)</p>
            <p className="mb-1 text-xs text-neutral-500">Title</p>
            <h2 className="mb-6 text-lg font-semibold text-neutral-900">{story.story_title}</h2>
            <p className="mb-2 text-xs text-neutral-500">Story body</p>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">{story.story_content}</div>
          </section>

          <div className="hidden w-px shrink-0 bg-neutral-200 lg:block" aria-hidden />

          <section className="min-h-0 flex-1 overflow-y-auto border border-neutral-200 bg-neutral-50 p-4 shadow-sm lg:border-0 lg:shadow-none">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-neutral-500">Translations (all dialects)</p>
            <div className="space-y-8">
              {DIALECT_ORDER.map(({ key, label }) => {
                const t = story.translations[key];
                return (
                  <div key={key} className="border-b border-neutral-200 pb-8 last:border-0 last:pb-0">
                    <p className="mb-3 text-xs font-semibold text-neutral-700">{label}</p>
                    <p className="mb-1 text-xs text-neutral-500">Title</p>
                    <h3 className="mb-4 text-base font-semibold text-neutral-900" dir="rtl">
                      {t.title}
                    </h3>
                    <p className="mb-2 text-xs text-neutral-500">Story body</p>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800" dir="rtl">
                      {t.content}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
