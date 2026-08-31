export default function TimeSlotPicker({ slots, selectedStart, onSelect }) {
  if (!slots?.length) {
    return (
      <p className="rounded-md border border-dashed border-line px-4 py-6 text-center text-sm text-ink-soft">
        No slots available for this date. Try another date or barber.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const checked = selectedStart === slot.startTime;
        return (
          <button
            type="button"
            key={slot.startTime}
            onClick={() => onSelect(slot)}
            className={`rounded-md border px-2 py-2 text-sm font-medium transition-colors ${
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
