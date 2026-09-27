import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";
import BrandLogo from "../common/BrandLogo.jsx";
import { dashboardFor } from "../../utils/navigation.js";
import Notifications from '../booking/Notifications.jsx';
import LocationControl from "./LocationControl.jsx";

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
    `inline-flex min-h-11 items-center whitespace-nowrap text-sm font-medium transition-colors ${isActive ? "text-clay" : "text-ink/70 hover:text-ink"}`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "bg-brass/15 text-clay" : "text-ink/75 hover:bg-ink/5 hover:text-ink"
    }`;

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="barber-stripe" />
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-3">
        <Link to={dashboard || "/"} onClick={closeMenu} className="mr-auto flex min-w-0 items-center lg:mr-0">
          <BrandLogo />
        </Link>

        <div className="hidden shrink-0 items-center gap-3 lg:flex xl:gap-5">
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

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 lg:ml-0">
        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <>
              <span className="hidden max-w-28 truncate text-sm text-ink-soft xl:inline">Hi, {user?.name?.split(" ")[0]}</span>
              <button onClick={handleLogout} className="btn-secondary min-h-11 whitespace-nowrap !px-3 min-h-11 !py-2 text-sm">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary min-h-11 whitespace-nowrap !px-3 min-h-11 !py-2 text-sm">
                Log in
              </Link>
              <Link to="/register" className="btn-primary min-h-11 whitespace-nowrap !px-3 min-h-11 !py-2 text-sm">
                Sign up
              </Link>
            </>
          )}
        </div>

        <Notifications />
        {!dashboard && <LocationControl />}
        <button
          type="button"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-ink/15 text-ink transition-colors hover:bg-ink hover:text-paper lg:hidden"
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
        </div>
      </nav>

      {isMenuOpen && (
        <div id="mobile-navigation" className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-line bg-paper px-3 pb-4 pt-2 shadow-lg sm:px-6 lg:hidden">
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
                  <span className="break-words px-3 text-sm text-ink-soft">Hi, {user?.name?.split(" ")[0]}</span>
                  <button onClick={handleLogout} className="btn-secondary w-full min-h-11 !py-2 text-sm">
                    Log out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={closeMenu} className="btn-secondary min-h-11 !py-2 text-sm">
                    Log in
                  </Link>
                  <Link to="/register" onClick={closeMenu} className="btn-primary min-h-11 !py-2 text-sm">
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


