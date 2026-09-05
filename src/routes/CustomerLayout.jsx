import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import { dashboardFor } from "../utils/navigation.js";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

export default function CustomerLayout() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <LoadingSpinner label="Checking your session..." />;
  const dashboard = isAuthenticated ? dashboardFor(user?.role) : null;
  return dashboard ? <Navigate to={dashboard} replace /> : <Outlet />;
}
