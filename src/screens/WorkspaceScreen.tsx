import { useState, useCallback, useEffect } from "react";
import {
  useApp,
  WORKSPACE_STORY_STORAGE_KEY,
  getStoryTranslationEntry,
  isStoryTranslationComplete,
} from "../context/AppContext";
import { stories } from "../data/stories";
import { getDialectLabel } from "../data/dialects";
import { STORY_RULES, TRANSLATION_CHECKLIST } from "../data/socialStoryGuidelines";

export default function WorkspaceScreen() {
  const { state, setStoryTranslation, submitTranslations } = useApp();
  const { isSubmitting, submissionError } = state;
  const dialectLabel = state.selectedDialect
    ? getDialectLabel(state.selectedDialect)
    : null;
  const [currentStoryId, setCurrentStoryId] = useState(
    () => stories[0]?.id ?? 0
  );
  const [storyStorageReady, setStoryStorageReady] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(WORKSPACE_STORY_STORAGE_KEY);
        const id = raw ? Number(raw) : NaN;
        if (Number.isFinite(id) && stories.some((s) => s.id === id)) {
          setCurrentStoryId(id);
        }
      } catch {
        /* ignore */
      } finally {
        setStoryStorageReady(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!storyStorageReady || !currentStoryId) return;
    try {
      localStorage.setItem(WORKSPACE_STORY_STORAGE_KEY, String(currentStoryId));
    } catch {
      /* ignore */
    }
  }, [currentStoryId, storyStorageReady]);

  const storyIndex = stories.findIndex((s) => s.id === currentStoryId);
  const safeIndex = storyIndex >= 0 ? storyIndex : 0;
  const currentStory = stories[safeIndex];
  const currentEntry = getStoryTranslationEntry(state.translations, currentStoryId);
  const completedCount = Object.values(state.translations).filter((t) =>
    isStoryTranslationComplete(t)
  ).length;
  const incompleteCount = stories.length - completedCount;
  const allStoriesComplete = stories.every((story) =>
    isStoryTranslationComplete(
      getStoryTranslationEntry(state.translations, story.id)
    )
  );

  const handleStoryChange = useCallback((storyId: number) => {
    setCurrentStoryId(storyId);
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStoryTranslation(currentStoryId, { title: e.target.value });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStoryTranslation(currentStoryId, { content: e.target.value });
  };

  const handlePrev = () => {
    if (safeIndex > 0) handleStoryChange(stories[safeIndex - 1].id);
  };

  const handleNext = () => {
    if (safeIndex < stories.length - 1) handleStoryChange(stories[safeIndex + 1].id);
  };

  const handleSubmit = async () => {
    if (!allStoriesComplete) {
      setValidationError(
        "Please complete the translated title and story body for all stories before submitting."
      );
      return;
    }

    setValidationError(null);
    await submitTranslations();
  };

  if (stories.length === 0 || !currentStory) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-6">
        <p className="text-sm text-neutral-600">No stories are available to translate.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 md:flex-row">
      {/* Story list — always visible on desktop, stacked on mobile */}
      <aside className="shrink-0 border-b border-neutral-200 bg-white md:w-56 md:border-b-0 md:border-r">
        <div className="p-4">
          <p className="text-xs font-medium text-neutral-500">Stories</p>
          <p className="mt-1 text-xs text-neutral-500">
            {completedCount} of {stories.length} stories complete (title &amp; body)
          </p>
          <div className="mt-3 md:hidden">
            <label htmlFor="story-select" className="sr-only">
              Choose story
            </label>
            <select
              id="story-select"
              className="w-full rounded-md border border-neutral-300 bg-white px-2 py-2 text-sm text-neutral-900"
              value={currentStoryId}
              onChange={(e) => handleStoryChange(Number(e.target.value))}
            >
              {stories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}. {s.title}
                  {isStoryTranslationComplete(getStoryTranslationEntry(state.translations, s.id))
                    ? " ✓"
                    : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
        <nav className="hidden max-h-[calc(100vh-8rem)] overflow-y-auto border-t border-neutral-100 md:block">
          {stories.map((story) => {
            const done = isStoryTranslationComplete(
              getStoryTranslationEntry(state.translations, story.id)
            );
            const isActive = story.id === currentStoryId;
            return (
              <button
                key={story.id}
                type="button"
                onClick={() => handleStoryChange(story.id)}
                className={`w-full border-l-2 px-4 py-3 text-left text-sm ${
                  isActive
                    ? "border-neutral-900 bg-neutral-50 font-medium text-neutral-900"
                    : "border-transparent text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <span className="text-neutral-400">{story.id}.</span> {story.title}
                {done ? <span className="ml-1 text-green-700">·</span> : null}
              </button>
            );
          })}
        </nav>
        <div className="hidden border-t border-neutral-200 p-4 md:block">
          <button
            type="button"
            onClick={() => setShowSubmitConfirm(true)}
              disabled={isSubmitting || !allStoriesComplete}
              className="w-full rounded-md bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
              {isSubmitting ? "Submitting…" : !allStoriesComplete ? "Complete all to submit" : "Submit all"}
          </button>
        </div>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-100 px-4 py-3">
          <div>
            <p className="text-xs text-neutral-500">
              Story {safeIndex + 1} of {stories.length}
            </p>
            <h2 className="text-base font-semibold text-neutral-900">{currentStory.title}</h2>
            {dialectLabel ? (
              <p className="mt-1 text-xs text-neutral-600">
                Translating into: <span className="font-medium text-neutral-900">{dialectLabel}</span>
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="rounded border border-purple-600 bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700"
            >
              Rules &amp; checklist
            </button>
            <button
              type="button"
              onClick={handlePrev}
              disabled={safeIndex === 0}
              className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-800 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={safeIndex >= stories.length - 1}
              className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-800 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <section className="min-h-0 flex-1 overflow-y-auto border-b border-neutral-200 bg-white p-4 lg:border-b-0 lg:border-r">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Original (English)
            </p>
            <p className="mb-1 text-xs text-neutral-500">Title</p>
            <h3 className="mb-6 text-lg font-semibold text-neutral-900">{currentStory.title}</h3>
            <p className="mb-2 text-xs text-neutral-500">Story body</p>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
              {currentStory.content}
            </div>
          </section>

          <section className="flex min-h-[40vh] flex-1 flex-col bg-neutral-50 lg:min-h-0">
            <div className="border-b border-neutral-200 px-4 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Your translation ({dialectLabel ?? "your dialect"})
              </p>
            </div>
            <div className="shrink-0 border-b border-neutral-100 px-4 py-3">
              <label
                htmlFor="translation-title"
                className="mb-1.5 block text-xs font-medium text-neutral-600"
              >
                Translated title
              </label>
              <input
                id="translation-title"
                type="text"
                value={currentEntry.title}
                onChange={handleTitleChange}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none ring-neutral-900 focus:ring-1"
                placeholder="Translate the title into your dialect."
                autoComplete="off"
              />
              <p className="mt-2 text-xs text-neutral-500">
                {currentEntry.title.trim().length > 0 ? "Entered" : "Required"}
              </p>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <label htmlFor="translation-body" className="sr-only">
                Translated story body
              </label>
              <textarea
                id="translation-body"
                value={currentEntry.content}
                onChange={handleContentChange}
                className="min-h-[200px] flex-1 resize-none bg-transparent px-4 py-3 text-sm leading-relaxed text-neutral-900 outline-none lg:min-h-0"
                placeholder="Translate the story body into your dialect."
              />
              <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-2 text-xs text-neutral-500">
                <span>{currentEntry.content.length} characters</span>
                {currentEntry.content.trim().length > 0 ? (
                  <span>Body entered</span>
                ) : null}
              </div>
            </div>
          </section>
        </div>

        <div className="border-t border-neutral-200 bg-white p-4 md:hidden">
          <button
            type="button"
            onClick={() => setShowSubmitConfirm(true)}
            disabled={isSubmitting || !allStoriesComplete}
            className="w-full rounded-md bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {isSubmitting
              ? "Submitting…"
              : !allStoriesComplete
                ? "Complete all to submit"
                : "Submit all translations"}
          </button>
        </div>
      </div>

      {showGuideModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-lg border border-neutral-200 bg-white shadow-lg sm:max-w-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 border-b border-neutral-200 px-5 py-4">
              <h3 id="guide-dialog-title" className="text-lg font-semibold text-neutral-900">
                Rules &amp; translation checklist
              </h3>
              <p className="mt-1 text-sm text-neutral-600">
                Same guidance as in the education module. Keep this open while you work if it helps.
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <section>
                <h4 className="text-sm font-semibold text-neutral-900">Social story rules</h4>
                <div className="mt-3 space-y-4">
                  {STORY_RULES.map((row, index) => (
                    <div
                      key={row.rule}
                      className="rounded-md border border-neutral-100 bg-neutral-50/80 p-3 text-sm"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                        Rule {index + 1}: {row.rule}
                      </p>
                      <p className="mt-2 leading-relaxed text-neutral-700">{row.meaning}</p>
                      <div className="mt-2 grid gap-2 border-t border-neutral-200/80 pt-2 text-xs sm:grid-cols-2">
                        <p>
                          <span className="font-medium text-green-800">Good:</span>{" "}
                          <span className="text-neutral-800">{row.correct}</span>
                        </p>
                        <p>
                          <span className="font-medium text-red-800">Avoid:</span>{" "}
                          <span className="text-neutral-800">{row.incorrect}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="mt-6 border-t border-neutral-200 pt-6">
                <h4 className="text-sm font-semibold text-neutral-900">Translation checklist</h4>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-700">
                  {TRANSLATION_CHECKLIST.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>
            <div className="shrink-0 border-t border-neutral-200 px-5 py-3">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full rounded-md bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 sm:w-auto sm:px-6"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showSubmitConfirm ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => setShowSubmitConfirm(false)}
        >
          <div
            className="max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="submit-dialog-title" className="text-lg font-semibold text-neutral-900">
              Submit translations?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              You have fully completed (translated title <strong>and</strong> story body) for{" "}
              <strong className="text-neutral-900">
                {completedCount} of {stories.length}
              </strong>{" "}
              stories. After you submit, you will not be able to edit them.
            </p>

            {completedCount < stories.length ? (
              <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                {incompleteCount}{" "}
                {incompleteCount === 1
                  ? "story is still missing a translated title or body."
                  : "stories are still missing a translated title or body."}{" "}
                Complete the remaining translations to enable submission.
              </p>
            ) : null}

            {validationError ? (
              <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                {validationError}
              </p>
            ) : null}

            {submissionError ? (
              <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                {submissionError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !allStoriesComplete}
                className="rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting…" : "Yes, submit"}
              </button>
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                disabled={isSubmitting}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50 disabled:opacity-50"
              >
                Keep editing
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
