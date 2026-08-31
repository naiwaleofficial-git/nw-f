import { Link } from "react-router-dom";
import StarRating from "../common/StarRating.jsx";
import Badge from "../common/Badge.jsx";

const PRICE_LABEL = { 1: "Budget", 2: "Mid-range", 3: "Premium" };
const CATEGORY_LABEL = { MEN: "Male", WOMEN: "Female", UNISEX: "Unisex" };

export default function SalonCard({ salon }) {
  return (
    <Link
      to={`/salons/${salon._id}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative h-40 w-full overflow-hidden bg-line">
        <img
          src={salon.coverImage || salon.images?.[0]}
          alt={salon.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <Badge className="absolute left-2 top-2 bg-ink/80 text-paper">
          {CATEGORY_LABEL[salon.category] || salon.category}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display text-lg font-semibold leading-tight text-ink">{salon.name}</h3>
        <p className="text-sm text-ink-soft">
          {salon.address?.city}
          {salon.address?.landmark ? ` - ${salon.address.landmark}` : ""}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <StarRating rating={salon.ratingAverage} totalReviews={salon.totalReviews} />
          <span className="text-xs font-medium text-ink-soft">{PRICE_LABEL[salon.priceLevel]}</span>
        </div>
        {salon.tags?.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {salon.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded border border-line px-2 py-0.5 text-[11px] text-ink-soft">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
