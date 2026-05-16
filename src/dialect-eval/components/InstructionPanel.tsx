import type { InstructionSection } from "@/data/dialectEvalInstructions";

interface InstructionPanelProps {
  summary: string;
  anchors?: string;
  sections: InstructionSection[];
  rationale?: string;
}

function InstructionSections({ sections }: { sections: InstructionSection[] }) {
  if (sections.length === 0) return null;

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.heading}>
          <h4 className="text-xs font-semibold text-neutral-900">{section.heading}</h4>
          {section.paragraphs?.map((p) => (
            <p key={p} className="mt-1 text-xs leading-relaxed text-neutral-700">
              {p}
            </p>
          ))}
          {section.bullets ? (
            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-relaxed text-neutral-700">
              {section.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}
          {section.subsections ? (
            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-neutral-700">
              {section.subsections.map((sub) => (
                <li key={sub.label}>
                  <span className="font-medium text-neutral-900">{sub.label}:</span> {sub.text}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default function InstructionPanel({
  summary,
  anchors,
  sections,
  rationale,
}: InstructionPanelProps) {
  return (
    <div className="space-y-3 rounded-md border border-neutral-200 bg-neutral-50/80 px-4 py-3 text-xs leading-relaxed text-neutral-700">
      <p className="text-neutral-800">{summary}</p>
      {anchors ? (
        <p>
          <span className="font-medium text-neutral-900">Scoring anchors:</span> {anchors}
        </p>
      ) : null}
      <InstructionSections sections={sections} />
      {rationale ? <p className="text-neutral-600">{rationale}</p> : null}
    </div>
  );
}
