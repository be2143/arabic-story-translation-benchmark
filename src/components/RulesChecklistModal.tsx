import { STORY_RULES, TRANSLATION_CHECKLIST } from "@/data/socialStoryGuidelines";

interface RulesChecklistModalProps {
  open: boolean;
  onClose: () => void;
  variant?: "translation" | "evaluation";
}

export default function RulesChecklistModal({
  open,
  onClose,
  variant = "translation",
}: RulesChecklistModalProps) {
  if (!open) return null;

  const subtitle =
    variant === "evaluation"
      ? "Same guidance as in the education module. Keep this open while you compare translations if it helps."
      : "Same guidance as in the education module. Keep this open while you work if it helps.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={onClose}
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
            Rules &amp; checklist
          </h3>
          <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
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
            onClick={onClose}
            className="w-full rounded-md bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 sm:w-auto sm:px-6"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
