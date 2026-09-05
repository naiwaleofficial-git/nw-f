import { formatCurrency, formatDuration } from "../../utils/formatters.js";

export default function ServiceSelector({ services, selectedIds, onToggle }) {
  const grouped = services.reduce((acc, s) => {
    acc[s.category] = acc[s.category] || [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <p className="section-eyebrow mb-2">{category}</p>
          <div className="space-y-2">
            {items.map((service) => {
              const checked = selectedIds.includes(service._id);
              return (
                <label
                  key={service._id}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2.5 transition-colors ${
                    checked ? "border-brass bg-brass/10" : "border-line hover:border-ink/30"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(service._id)}
                      className="h-4 w-4 shrink-0 accent-brass"
                    />
                    <div className="min-w-0 break-words">
                      <p className="text-sm font-medium text-ink">{service.name}</p>
                      <p className="text-xs text-ink-soft">{formatDuration(service.durationMinutes)}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-ink">{formatCurrency(service.price)}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
