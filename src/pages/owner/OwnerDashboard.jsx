import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchMySalons, createSalon } from "../../api/salonApi.js";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import StarRating from "../../components/common/StarRating.jsx";
import Badge from "../../components/common/Badge.jsx";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  description: "",
  category: "UNISEX",
  city: "",
  state: "",
  fullAddress: "",
  pincode: "",
  lat: "",
  lng: "",
};

export default function OwnerDashboard() {
  const [salons, setSalons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = () => {
    setIsLoading(true);
    fetchMySalons()
      .then((res) => setSalons(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createSalon({
        name: form.name,
        phone: form.phone,
        email: form.email,
        description: form.description,
        category: form.category,
        address: {
          fullAddress: form.fullAddress,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        location: {
          type: "Point",
          coordinates: [Number(form.lng) || 0, Number(form.lat) || 0],
        },
        images: ["https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=85"],
        coverImage: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1600&q=85",
      });
      toast.success("Salon created! Add barbers and services from its management page.");
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Owner Dashboard</h1>
          <p className="text-sm text-ink-soft">Manage your salons, barbers, services and bookings.</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary">
          {showForm ? "Cancel" : "+ Add Salon"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mt-6 grid gap-3 p-6 sm:grid-cols-2">
          <input required placeholder="Salon name" value={form.name} onChange={update("name")} className="input-field sm:col-span-2" />
          <input required placeholder="Phone" value={form.phone} onChange={update("phone")} className="input-field" />
          <input placeholder="Email" value={form.email} onChange={update("email")} className="input-field" />
          <select value={form.category} onChange={update("category")} className="input-field">
            <option value="UNISEX">Unisex</option>
            <option value="MEN">Men</option>
            <option value="WOMEN">Women</option>
          </select>
          <input placeholder="City" required value={form.city} onChange={update("city")} className="input-field" />
          <input placeholder="State" value={form.state} onChange={update("state")} className="input-field" />
          <input placeholder="Full address" value={form.fullAddress} onChange={update("fullAddress")} className="input-field sm:col-span-2" />
          <input placeholder="Pincode" value={form.pincode} onChange={update("pincode")} className="input-field" />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Latitude" value={form.lat} onChange={update("lat")} className="input-field" />
            <input placeholder="Longitude" value={form.lng} onChange={update("lng")} className="input-field" />
          </div>
          <textarea
            placeholder="Short description"
            value={form.description}
            onChange={update("description")}
            className="input-field sm:col-span-2"
            rows={2}
          />
          <button type="submit" disabled={isSubmitting} className="btn-primary sm:col-span-2">
            {isSubmitting ? "Creating..." : "Create Salon"}
          </button>
        </form>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : salons.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No salons yet" description="Add your first salon to start managing barbers, services and bookings." />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {salons.map((s) => (
            <Link key={s._id} to={`/owner/salons/${s._id}`} className="card p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-lg font-semibold">{s.name}</p>
                  <p className="text-sm text-ink-soft">{s.address?.city}</p>
                </div>
                <Badge className={s.isApproved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                  {s.isApproved ? "Approved" : "Pending review"}
                </Badge>
              </div>
              <div className="mt-3">
                <StarRating rating={s.ratingAverage} totalReviews={s.totalReviews} size="text-xs" />
              </div>
              <p className="mt-3 text-sm font-semibold text-clay">Manage salon →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
