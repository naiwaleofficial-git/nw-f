import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

// Wraps a page and requires login, optionally restricted to specific roles.
// Usage: <ProtectedRoute roles={["SALON_OWNER"]}><OwnerDashboard /></ProtectedRoute>
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner label="Checking your session..." />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
