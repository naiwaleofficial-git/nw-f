import StarRating from "../common/StarRating.jsx";

export default function BarberSelector({ barbers, selectedId, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {barbers.map((barber) => {
        const checked = selectedId === barber._id;
        return (
          <button
            type="button"
            key={barber._id}
            onClick={() => onSelect(barber._id)}
            className={`flex flex-col items-center gap-2 rounded-md border p-3 text-center transition-colors ${
              checked ? "border-brass bg-brass/10" : "border-line hover:border-ink/30"
            }`}
          >
            <img
              src={barber.profileImage}
              alt={barber.name}
              className="h-14 w-14 rounded-full object-cover"
              loading="lazy"
            />
            <p className="text-sm font-medium text-ink">{barber.name}</p>
            <StarRating rating={barber.ratingAverage} size="text-xs" />
          </button>
        );
      })}
    </div>
  );
}
