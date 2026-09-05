import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store/authStore.js";

import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import CustomerLayout from "./routes/CustomerLayout.jsx";

import Home from "./pages/Home.jsx";
import Search from "./pages/Search.jsx";
import SalonDetails from "./pages/SalonDetails.jsx";
import Booking from "./pages/Booking.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import About from "./pages/About.jsx";
import Help from "./pages/Help.jsx";
import NotFound from "./pages/NotFound.jsx";

import OwnerDashboard from "./pages/owner/OwnerDashboard.jsx";
import ManageSalon from "./pages/owner/ManageSalon.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

export default function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/salons/:id" element={<SalonDetails />} />
          <Route path="/salons/:id/book" element={<Booking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          </Route>

          <Route
            path="/owner"
            element={
              <ProtectedRoute roles={["SALON_OWNER", "ADMIN"]}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/salons/:salonId"
            element={
              <ProtectedRoute roles={["SALON_OWNER", "ADMIN"]}>
                <ManageSalon />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
