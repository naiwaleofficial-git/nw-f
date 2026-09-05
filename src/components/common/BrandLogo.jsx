export default function BrandLogo({ inverse = false }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2.5">
      <img src="/brand-logo.png" alt="" className="h-12 w-12 rounded-md object-contain sm:h-14 sm:w-14" width="56" height="56" />
      <span className={`font-display text-xl font-semibold tracking-tight ${inverse ? "text-paper" : "text-ink"}`}>
        Nai<span className={inverse ? "text-brass" : "text-clay"}>Wale</span>
      </span>
    </span>
  );
}
