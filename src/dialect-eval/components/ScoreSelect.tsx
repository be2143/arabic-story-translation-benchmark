const SCORE_OPTIONS = [1, 2, 3, 4, 5] as const;

export default function ScoreSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-1.5">
      <label htmlFor={id} className="max-w-[85%] text-sm text-neutral-800">
        {label}
      </label>
      <select
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900"
      >
        <option value="" disabled>
          —
        </option>
        {SCORE_OPTIONS.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  );
}
