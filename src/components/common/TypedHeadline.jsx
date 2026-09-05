import { useEffect, useState } from "react";

const FIRST_LINE = "Find your chair.";
const SECOND_LINE = "Book your next cut.";
const TEXT = `${FIRST_LINE} ${SECOND_LINE}`;

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
        if (count < TEXT.length) {
          timer = window.setTimeout(type, 90);
        } else {
          timer = window.setTimeout(() => {
            count = 0;
            setLength(0);
            timer = window.setTimeout(type, 500);
          }, 2500);
        }
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
      <span aria-hidden="true" className="relative block">
        <span className="invisible block">{FIRST_LINE}<br />{SECOND_LINE}</span>
        <span className="absolute inset-0">
          {FIRST_LINE.slice(0, length)}
          {length <= FIRST_LINE.length && <span className="hero-caret" />}
          <br />
          <span className="hero-typed">
            {SECOND_LINE.slice(0, Math.max(0, length - FIRST_LINE.length - 1))}
            {length > FIRST_LINE.length && <span className="hero-caret" />}
          </span>
        </span>
      </span>
    </h1>
  );
}
