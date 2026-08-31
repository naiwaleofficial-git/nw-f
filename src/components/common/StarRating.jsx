export default function StarRating({ rating = 0, totalReviews, size = "text-sm" }) {
  const rounded = Math.round(rating * 2) / 2;
  const stars = "\u2605".repeat(Math.floor(rounded));
  const half = rounded % 1 !== 0 ? "\u00BD" : "";

  return (
    <span className={`inline-flex items-center gap-1 ${size}`}>
      <span className="text-brass">{stars}{half}</span>
      <span className="font-semibold text-ink">{rating ? rating.toFixed(1) : "New"}</span>
      {typeof totalReviews === "number" && (
        <span className="text-ink-soft/60">({totalReviews})</span>
      )}
    </span>
  );
}
