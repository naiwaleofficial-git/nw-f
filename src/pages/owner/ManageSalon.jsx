import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  fetchSalon,
  fetchBarbers,
  createBarber,
  updateBarber,
  deleteBarber,
  fetchServices,
  createService,
  updateService,
  deleteService,
  fetchSalonBookings,
} from "../../api/salonApi.js";
import { updateBookingStatus } from "../../api/bookingApi.js";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import Badge from "../../components/common/Badge.jsx";
import { formatCurrency, formatDuration, formatDateLabel, formatTime, statusColor } from "../../utils/formatters.js";

const TABS = ["Barbers", "Services", "Bookings"];
const NEXT_STATUS = {
  PENDING: "CONFIRMED",
  CONFIRMED: "CHECKED_IN",
  CHECKED_IN: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
};

export default function ManageSalon() {
  const { salonId } = useParams();
  const [salon, setSalon] = useState(null);
  const [tab, setTab] = useState("Barbers");
  const [isLoading, setIsLoading] = useState(true);

  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [barberForm, setBarberForm] = useState({ name: "", phone: "", experienceYears: "" });
  const [serviceForm, setServiceForm] = useState({ name: "", category: "Haircut", price: "", durationMinutes: "" });

  const loadAll = () => {
    setIsLoading(true);
    Promise.all([fetchSalon(salonId), fetchBarbers(salonId), fetchServices(salonId), fetchSalonBookings(salonId)])
      .then(([s, b, sv, bk]) => {
        setSalon(s.data);
        setBarbers(b.data);
        setServices(sv.data);
        setBookings(bk.data);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadAll, [salonId]);

  const handleAddBarber = async (e) => {
    e.preventDefault();
    try {
      await createBarber(salonId, {
        name: barberForm.name,
        phone: barberForm.phone,
        experienceYears: Number(barberForm.experienceYears) || 0,
        profileImage: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=85",
        workingHours: Array.from({ length: 7 }, (_, day) => ({
          day,
          isWorking: true,
          startTime: "09:30",
          endTime: "20:30",
        })),
      });
      toast.success("Barber added");
      setBarberForm({ name: "", phone: "", experienceYears: "" });
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRemoveBarber = async (id) => {
    if (!confirm("Remove this barber?")) return;
    try {
      await deleteBarber(id);
      toast.success("Barber removed");
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await createService(salonId, {
        name: serviceForm.name,
        category: serviceForm.category,
        price: Number(serviceForm.price),
        durationMinutes: Number(serviceForm.durationMinutes),
      });
      toast.success("Service added");
      setServiceForm({ name: "", category: "Haircut", price: "", durationMinutes: "" });
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRemoveService = async (id) => {
    if (!confirm("Remove this service?")) return;
    try {
      await deleteService(id);
      toast.success("Service removed");
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAdvanceStatus = async (booking) => {
    const next = NEXT_STATUS[booking.bookingStatus];
    if (!next) return;
    try {
      await updateBookingStatus(booking._id, next);
      toast.success(`Marked as ${next.replace("_", " ").toLowerCase()}`);
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancelByOwner = async (booking) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await updateBookingStatus(booking._id, "CANCELLED");
      toast.success("Booking cancelled");
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading salon management..." />;
  if (!salon) return <p className="py-16 text-center text-ink-soft">Salon not found.</p>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link to="/owner" className="text-sm text-ink-soft hover:text-ink">← Back to Owner Dashboard</Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{salon.name}</h1>
        <Badge className={salon.isApproved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
          {salon.isApproved ? "Approved" : "Pending review"}
        </Badge>
      </div>

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

      {tab === "Barbers" && (
        <div className="mt-6">
          <form onSubmit={handleAddBarber} className="card mb-5 flex flex-wrap items-end gap-3 p-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Name</label>
              <input
                required
                value={barberForm.name}
                onChange={(e) => setBarberForm((f) => ({ ...f, name: e.target.value }))}
                className="input-field w-40"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Phone</label>
              <input
                value={barberForm.phone}
                onChange={(e) => setBarberForm((f) => ({ ...f, phone: e.target.value }))}
                className="input-field w-36"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Experience (yrs)</label>
              <input
                type="number"
                min="0"
                value={barberForm.experienceYears}
                onChange={(e) => setBarberForm((f) => ({ ...f, experienceYears: e.target.value }))}
                className="input-field w-28"
              />
            </div>
            <button type="submit" className="btn-primary">Add Barber</button>
          </form>

          <div className="grid gap-3 sm:grid-cols-2">
            {barbers.map((b) => (
              <div key={b._id} className="card flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <img src={b.profileImage} alt={b.name} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <p className="font-medium text-ink">{b.name}</p>
                    <p className="text-xs text-ink-soft">{b.experienceYears} yrs · {b.phone}</p>
                  </div>
                </div>
                <button onClick={() => handleRemoveBarber(b._id)} className="btn-danger text-xs">Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "Services" && (
        <div className="mt-6">
          <form onSubmit={handleAddService} className="card mb-5 flex flex-wrap items-end gap-3 p-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Service name</label>
              <input
                required
                value={serviceForm.name}
                onChange={(e) => setServiceForm((f) => ({ ...f, name: e.target.value }))}
                className="input-field w-44"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Category</label>
              <select
                value={serviceForm.category}
                onChange={(e) => setServiceForm((f) => ({ ...f, category: e.target.value }))}
                className="input-field w-40"
              >
                {[
                  "Haircut",
                  "Beard",
                  "Hair Spa",
                  "Facial",
                  "Hair Coloring",
                  "Hair Styling",
                  "Head Massage",
                  "Massage",
                  "Manicure",
                  "Pedicure",
                  "Waxing",
                  "Threading",
                  "Kids Haircut",
                  "Bridal & Grooming",
                  "Other",
                ].map(
                  (c) => (
                    <option key={c} value={c}>{c}</option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Price (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={serviceForm.price}
                onChange={(e) => setServiceForm((f) => ({ ...f, price: e.target.value }))}
                className="input-field w-28"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Duration (min)</label>
              <input
                type="number"
                required
                min="5"
                value={serviceForm.durationMinutes}
                onChange={(e) => setServiceForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                className="input-field w-28"
              />
            </div>
            <button type="submit" className="btn-primary">Add Service</button>
          </form>

          <div className="divide-y divide-line rounded-lg border border-line">
            {services.map((s) => (
              <div key={s._id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-ink">{s.name}</p>
                  <p className="text-xs text-ink-soft">{s.category} · {formatDuration(s.durationMinutes)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-ink">{formatCurrency(s.price)}</span>
                  <button onClick={() => handleRemoveService(s._id)} className="btn-danger text-xs">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "Bookings" && (
        <div className="mt-6 space-y-3">
          {bookings.length === 0 ? (
            <p className="text-sm text-ink-soft">No bookings yet.</p>
          ) : (
            bookings.map((b) => (
              <div key={b._id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-ink">{b.customerId?.name} · with {b.barberId?.name}</p>
                  <p className="text-sm text-ink-soft">
                    {formatDateLabel(b.startTime)} · {formatTime(b.startTime)} – {formatTime(b.endTime)}
                  </p>
                  <p className="text-xs text-ink-soft">{b.services.map((s) => s.name).join(", ")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColor(b.bookingStatus)}>{b.bookingStatus.replace("_", " ")}</Badge>
                  {NEXT_STATUS[b.bookingStatus] && (
                    <button onClick={() => handleAdvanceStatus(b)} className="btn-secondary text-xs">
                      Mark {NEXT_STATUS[b.bookingStatus].replace("_", " ").toLowerCase()}
                    </button>
                  )}
                  {["PENDING", "CONFIRMED"].includes(b.bookingStatus) && (
                    <button onClick={() => handleCancelByOwner(b)} className="btn-danger text-xs">Cancel</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
