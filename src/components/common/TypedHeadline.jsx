import { useEffect, useState } from "react";

const TEXT = "next cut.";

export default function TypedHeadline() {
  const [length, setLength] = useState(TEXT.length);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer;
    const start = () => {
      window.clearTimeout(timer);
      if (preference.matches) {
        setLength(TEXT.length);
        return;
      }
      setLength(0);
      let count = 0;
      const type = () => {
        count += 1;
        setLength(count);
        if (count < TEXT.length) timer = window.setTimeout(type, 115);
      };
      timer = window.setTimeout(type, 450);
    };
    start();
    preference.addEventListener("change", start);
    return () => {
      window.clearTimeout(timer);
      preference.removeEventListener("change", start);
    };
  }, []);

  return (
    <h1 className="hero-headline mt-3 font-display text-[clamp(2rem,7vw,3.5rem)] font-semibold leading-[1.2] tracking-tight text-paper">
      <span className="sr-only">Find your chair. Book your next cut.</span>
      <span aria-hidden="true">
        Find your chair.
        <br />
        Book your{" "}
        <span className="hero-typed relative inline-grid whitespace-nowrap text-brass">
          <span className="invisible col-start-1 row-start-1">{TEXT}</span>
          <span className="col-start-1 row-start-1">
            {TEXT.slice(0, length)}
            {length < TEXT.length && <span className="hero-caret" />}
          </span>
        </span>
      </span>
    </h1>
  );
}
