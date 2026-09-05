export default function TimeSlotPicker({ slots, selectedStart, onSelect }) {
  if (!slots?.length) {
    return (
      <p className="rounded-md border border-dashed border-line px-4 py-6 text-center text-sm text-ink-soft">
        No slots available for this date. Try another date or barber.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 min-[360px]:grid-cols-3 sm:grid-cols-4">
      {slots.map((slot) => {
        const checked = selectedStart === slot.startTime;
        return (
          <button
            type="button"
            key={slot.startTime}
            aria-pressed={checked}
            onClick={() => onSelect(slot)}
            className={`min-h-11 min-w-0 rounded-md border px-2 py-2 text-sm font-medium transition-colors ${
              checked ? "border-brass bg-brass text-ink" : "border-line text-ink-soft hover:border-ink/30"
            }`}
          >
            {slot.displayStart}
          </button>
        );
      })}
    </div>
  );
}
