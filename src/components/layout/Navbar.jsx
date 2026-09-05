import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";
import BrandLogo from "../common/BrandLogo.jsx";
import { dashboardFor } from "../../utils/navigation.js";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dashboard = isAuthenticated ? dashboardFor(user?.role) : null;

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? "text-clay" : "text-ink/70 hover:text-ink"}`;

  const mobileNavLinkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "bg-brass/15 text-clay" : "text-ink/75 hover:bg-ink/5 hover:text-ink"
    }`;

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="barber-stripe" />
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to={dashboard || "/"} onClick={closeMenu} className="flex items-center gap-2">
          <BrandLogo />
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {!dashboard && <>
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/search" className={navLinkClass}>
            Find a Barber
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <NavLink to="/help" className={navLinkClass}>
            Help
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/my-bookings" className={navLinkClass}>
              My Bookings
            </NavLink>
          )}
          </>}
          {isAuthenticated && user?.role === "SALON_OWNER" && (
            <NavLink to="/owner" className={navLinkClass}>
              Owner Dashboard
            </NavLink>
          )}
          {isAuthenticated && user?.role === "ADMIN" && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-ink-soft sm:inline">Hi, {user?.name?.split(" ")[0]}</span>
              <button onClick={handleLogout} className="btn-secondary !px-3 !py-1.5 text-sm">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !px-3 !py-1.5 text-sm">
                Log in
              </Link>
              <Link to="/register" className="btn-primary !px-3 !py-1.5 text-sm">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink/15 text-ink transition-colors hover:bg-ink hover:text-paper md:hidden"
        >
          <span className="relative h-4 w-5">
            <span
              className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-current transition-transform ${
                isMenuOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] h-0.5 w-5 rounded bg-current transition-opacity ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute bottom-0 left-0 h-0.5 w-5 rounded bg-current transition-transform ${
                isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-line bg-paper px-4 pb-4 pt-2 shadow-lg md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {!dashboard && <>
            <NavLink to="/" className={mobileNavLinkClass} onClick={closeMenu} end>
              Home
            </NavLink>
            <NavLink to="/search" className={mobileNavLinkClass} onClick={closeMenu}>
              Find a Barber
            </NavLink>
            <NavLink to="/about" className={mobileNavLinkClass} onClick={closeMenu}>
              About
            </NavLink>
            <NavLink to="/help" className={mobileNavLinkClass} onClick={closeMenu}>
              Help
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/my-bookings" className={mobileNavLinkClass} onClick={closeMenu}>
                My Bookings
              </NavLink>
            )}
            </>}
            {isAuthenticated && user?.role === "SALON_OWNER" && (
              <NavLink to="/owner" className={mobileNavLinkClass} onClick={closeMenu}>
                Owner Dashboard
              </NavLink>
            )}
            {isAuthenticated && user?.role === "ADMIN" && (
              <NavLink to="/admin" className={mobileNavLinkClass} onClick={closeMenu}>
                Admin
              </NavLink>
            )}

            <div className="mt-3 border-t border-line pt-3">
              {isAuthenticated ? (
                <div className="grid gap-2">
                  <span className="px-3 text-sm text-ink-soft">Hi, {user?.name?.split(" ")[0]}</span>
                  <button onClick={handleLogout} className="btn-secondary w-full !py-2 text-sm">
                    Log out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={closeMenu} className="btn-secondary !py-2 text-sm">
                    Log in
                  </Link>
                  <Link to="/register" onClick={closeMenu} className="btn-primary !py-2 text-sm">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
