import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  fetchPlatformStats,
  fetchSalonsAdmin,
  approveSalonAdmin,
  deactivateSalonAdmin,
  fetchUsersAdmin,
  deactivateUserAdmin,
} from "../../api/adminApi.js";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import Badge from "../../components/common/Badge.jsx";
import StarRating from "../../components/common/StarRating.jsx";
import { formatCurrency } from "../../utils/formatters.js";

const TABS = ["Overview", "Salons", "Users"];

export default function AdminDashboard() {
  const [tab, setTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [salons, setSalons] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAll = () => {
    setIsLoading(true);
    Promise.all([fetchPlatformStats(), fetchSalonsAdmin(), fetchUsersAdmin()])
      .then(([st, sl, us]) => {
        setStats(st.data);
        setSalons(sl.data);
        setUsers(us.data);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadAll, []);

  const handleApprove = async (id) => {
    try {
      await approveSalonAdmin(id);
      toast.success("Salon approved");
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeactivateSalon = async (id) => {
    if (!confirm("Deactivate this salon?")) return;
    try {
      await deactivateSalonAdmin(id);
      toast.success("Salon deactivated");
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeactivateUser = async (id) => {
    if (!confirm("Deactivate this user?")) return;
    try {
      await deactivateUserAdmin(id);
      toast.success("User deactivated");
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading admin dashboard..." />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      <div className="mt-6 flex gap-2 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t ? "border-brass text-ink" : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && stats && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Users" value={stats.totalUsers} />
          <StatCard label="Customers" value={stats.totalCustomers} />
          <StatCard label="Salon Owners" value={stats.totalOwners} />
          <StatCard label="Total Salons" value={stats.totalSalons} />
          <StatCard label="Approved Salons" value={stats.approvedSalons} />
          <StatCard label="Pending Approval" value={stats.pendingSalons} />
          <StatCard label="Completed Bookings" value={stats.completedBookings} />
          <StatCard label="Platform Revenue" value={formatCurrency(stats.totalRevenue)} />
        </div>
      )}

      {tab === "Salons" && (
        <div className="mt-6 space-y-3">
          {salons.map((s) => (
            <div key={s._id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium text-ink">{s.name}</p>
                <p className="text-xs text-ink-soft">{s.address?.city} · owner: {s.ownerId?.name}</p>
                <StarRating rating={s.ratingAverage} totalReviews={s.totalReviews} size="text-xs" />
              </div>
              <div className="flex items-center gap-2">
                <Badge className={s.isApproved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                  {s.isApproved ? "Approved" : "Pending"}
                </Badge>
                <Badge className={s.isActive ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-700"}>
                  {s.isActive ? "Active" : "Inactive"}
                </Badge>
                {!s.isApproved && (
                  <button onClick={() => handleApprove(s._id)} className="btn-secondary text-xs">Approve</button>
                )}
                {s.isActive && (
                  <button onClick={() => handleDeactivateSalon(s._id)} className="btn-danger text-xs">Deactivate</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Users" && (
        <div className="mt-6 divide-y divide-line rounded-lg border border-line">
          {users.map((u) => (
            <div key={u._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium text-ink">{u.name} <span className="text-xs text-ink-soft">· {u.role}</span></p>
                <p className="text-xs text-ink-soft">{u.phone} {u.email ? `· ${u.email}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={u.isActive ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-700"}>
                  {u.isActive ? "Active" : "Inactive"}
                </Badge>
                {u.isActive && u.role !== "ADMIN" && (
                  <button onClick={() => handleDeactivateUser(u._id)} className="btn-danger text-xs">Deactivate</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
