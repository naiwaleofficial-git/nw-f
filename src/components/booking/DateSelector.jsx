import { formatDateLabel, toISODate } from "../../utils/formatters.js";

export default function DateSelector({ selectedDate, onSelect, daysAhead = 10 }) {
  const dates = Array.from({ length: daysAhead }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div aria-label="Available dates" className="flex w-full min-w-0 gap-2 overflow-x-auto overscroll-x-contain pb-2">
      {dates.map((d) => {
        const iso = toISODate(d);
        const checked = selectedDate === iso;
        return (
          <button
            type="button"
            key={iso}
            aria-pressed={checked}
            onClick={() => onSelect(iso)}
            className={`flex min-h-11 min-w-[72px] shrink-0 flex-col items-center justify-center rounded-md border px-3 py-2 text-sm transition-colors ${
              checked ? "border-brass bg-brass text-ink" : "border-line text-ink-soft hover:border-ink/30"
            }`}
          >
            <span className="font-semibold">{formatDateLabel(d)}</span>
          </button>
        );
      })}
    </div>
  );
}
