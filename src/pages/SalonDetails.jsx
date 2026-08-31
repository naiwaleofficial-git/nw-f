import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchSalon, fetchServices, fetchBarbers, fetchReviews } from "../api/salonApi.js";
import { addFavorite } from "../api/reviewApi.js";
import { useAuthStore } from "../store/authStore.js";
import StarRating from "../components/common/StarRating.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import { formatCurrency, formatDuration } from "../utils/formatters.js";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SalonDetails() {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();

  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchSalon(id), fetchServices(id), fetchBarbers(id), fetchReviews(id)])
      .then(([s, sv, b, r]) => {
        setSalon(s.data);
        setServices(sv.data);
        setBarbers(b.data);
        setReviews(r.data);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleFavorite = async () => {
    if (!isAuthenticated) return toast.error("Log in to save favorites");
    try {
      await addFavorite(id);
      toast.success("Added to favorites");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading salon..." />;
  if (!salon) return <p className="py-16 text-center text-ink-soft">Salon not found.</p>;

  const grouped = services.reduce((acc, s) => {
    acc[s.category] = acc[s.category] || [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div>
      <div className="h-64 w-full overflow-hidden bg-line sm:h-80">
        <img src={salon.coverImage} alt={salon.name} className="h-full w-full object-cover" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-eyebrow">{salon.category}</p>
            <h1 className="mt-1 text-3xl font-semibold">{salon.name}</h1>
            <p className="mt-1 text-ink-soft">
              {salon.address?.fullAddress}, {salon.address?.city}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <StarRating rating={salon.ratingAverage} totalReviews={salon.totalReviews} />
              {salon.offersHomeService && (
                <span className="rounded-full bg-brass/15 px-2.5 py-0.5 text-xs font-semibold text-brass-dark">
                  Home service available
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleFavorite} className="btn-secondary">♥ Save</button>
            <Link to={`/salons/${id}/book`} className="btn-primary">Book Appointment</Link>
          </div>
        </div>

        {salon.description && <p className="mt-6 max-w-2xl text-ink-soft">{salon.description}</p>}

        {salon.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {salon.tags.map((tag) => (
              <span key={tag} className="rounded border border-line px-2.5 py-1 text-xs text-ink-soft">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            {/* Services */}
            <section>
              <h2 className="text-xl font-semibold">Services</h2>
              <div className="mt-4 space-y-6">
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <p className="section-eyebrow mb-2">{category}</p>
                    <div className="divide-y divide-line rounded-lg border border-line">
                      {items.map((s) => (
                        <div key={s._id} className="flex items-center justify-between px-4 py-3">
                          <div>
                            <p className="font-medium text-ink">{s.name}</p>
                            <p className="text-xs text-ink-soft">{formatDuration(s.durationMinutes)}</p>
                          </div>
                          <span className="font-semibold text-ink">{formatCurrency(s.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Barbers */}
            <section>
              <h2 className="text-xl font-semibold">Meet the team</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {barbers.map((b) => (
                  <div key={b._id} className="card flex flex-col items-center gap-2 p-4 text-center">
                    <img src={b.profileImage} alt={b.name} className="h-16 w-16 rounded-full object-cover" />
                    <p className="font-medium text-ink">{b.name}</p>
                    <StarRating rating={b.ratingAverage} totalReviews={b.totalReviews} size="text-xs" />
                    <p className="text-xs text-ink-soft">{b.experienceYears} yrs experience</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-xl font-semibold">Reviews</h2>
              {reviews.length === 0 ? (
                <p className="mt-3 text-sm text-ink-soft">No reviews yet.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {reviews.slice(0, 8).map((r) => (
                    <div key={r._id} className="card p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-ink">{r.customerId?.name || "Customer"}</p>
                        <StarRating rating={r.rating} size="text-xs" />
                      </div>
                      {r.comment && <p className="mt-1 text-sm text-ink-soft">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Working hours sidebar */}
          <aside className="card h-fit p-5">
            <h3 className="font-semibold text-ink">Working hours</h3>
            <ul className="mt-3 space-y-1.5 text-sm">
              {salon.workingHours?.map((wh) => (
                <li key={wh.day} className="flex justify-between text-ink-soft">
                  <span>{DAY_NAMES[wh.day]}</span>
                  <span className={wh.isOpen ? "" : "text-clay"}>
                    {wh.isOpen ? `${wh.openTime} – ${wh.closeTime}` : "Closed"}
                  </span>
                </li>
              ))}
            </ul>
            <Link to={`/salons/${id}/book`} className="btn-primary mt-5 w-full">
              Book Appointment
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
