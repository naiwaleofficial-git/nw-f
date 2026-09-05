export default function BrandLogo({ inverse = false }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2.5">
      <img src="/favicon.svg" alt="" className="h-10 w-10" width="40" height="40" />
      <span className={`font-display text-xl font-semibold tracking-tight ${inverse ? "text-paper" : "text-ink"}`}>
        Nai<span className={inverse ? "text-brass" : "text-clay"}>Wale</span>
      </span>
    </span>
  );
}
