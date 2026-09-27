export default function BrandLogo({ inverse = false }) {
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 sm:gap-2 lg:gap-2.5">
      <img src="/brand-logo.png" alt="" className="h-8 w-8 shrink-0 rounded-md object-contain sm:h-10 sm:w-10 lg:h-12 lg:w-12" width="48" height="48" />
      <span className={`whitespace-nowrap font-display text-base font-semibold leading-none tracking-tight min-[360px]:text-lg sm:text-xl lg:text-2xl ${inverse ? "text-paper" : "text-ink"}`}>
        Nai<span className={inverse ? "text-brass" : "text-clay"}>Wale</span>
      </span>
    </span>
  );
}
