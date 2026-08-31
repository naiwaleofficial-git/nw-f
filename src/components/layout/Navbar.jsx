import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? "text-clay" : "text-ink/70 hover:text-ink"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="barber-stripe" />
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Nai<span className="text-clay">Wale</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
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

        <div className="flex items-center gap-3">
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
      </nav>
    </header>
  );
}
