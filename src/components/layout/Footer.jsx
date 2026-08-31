import { Link } from "react-router-dom";

const SOCIAL_LINKS = [
  { label: "Instagram", handle: "@naiwaleapp", href: "https://instagram.com/naiwaleapp" },
  { label: "Facebook", handle: "/naiwaleapp", href: "https://facebook.com/naiwaleapp" },
  { label: "X", handle: "@naiwaleapp", href: "https://x.com/naiwaleapp" },
  { label: "LinkedIn", handle: "/company/naiwale", href: "https://linkedin.com/company/naiwale" },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-ink text-paper/80">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg font-semibold text-paper">
              Nai<span className="text-brass">Wale</span>
            </p>
            <p className="mt-2 max-w-xs text-sm text-paper/60">
              Discover nearby barbers and salons, compare services, and book a chair in a couple of taps.
            </p>
          </div>
          <div>
            <p className="section-eyebrow text-brass">Explore</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/search" className="hover:text-brass">
                  Find a Barber
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brass">
                  About
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-brass">
                  Help
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="section-eyebrow text-brass">Account</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/login" className="hover:text-brass">
                  Log In
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-brass">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brass">
                  List Your Salon
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="section-eyebrow text-brass">Social</p>
            <ul className="mt-3 space-y-2 text-sm">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a href={social.href} target="_blank" rel="noreferrer" className="hover:text-brass">
                    {social.label} {social.handle}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-paper/10 pt-6 text-xs text-paper/40">
          Copyright {new Date().getFullYear()} NaiWale. Demo project, not a real booking service.
        </p>
      </div>
    </footer>
  );
}
