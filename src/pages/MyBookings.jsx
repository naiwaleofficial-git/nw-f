import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchMyBookings, cancelBooking } from "../api/bookingApi.js";
import { submitReview } from "../api/reviewApi.js";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import Badge from "../components/common/Badge.jsx";
import StarRating from "../components/common/StarRating.jsx";
import { formatCurrency, formatDateLabel, formatTime, statusColor } from "../utils/formatters.js";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const load = () => {
    setIsLoading(true);
    fetchMyBookings()
      .then((res) => setBookings(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await cancelBooking(id, "Cancelled by customer");
      toast.success("Booking cancelled");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReviewSubmit = async () => {
    try {
      await submitReview({ bookingId: reviewTarget._id, rating: reviewRating, comment: reviewComment });
      toast.success("Thanks for your review!");
      setReviewTarget(null);
      setReviewComment("");
      setReviewRating(5);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading your bookings..." />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No bookings yet"
            description="When you book an appointment, it'll show up here."
            action={
              <Link to="/search" className="btn-primary">
                Find a barber
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold">{b.salonId?.name}</p>
                  <p className="text-sm text-ink-soft">with {b.barberId?.name}</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {formatDateLabel(b.startTime)} · {formatTime(b.startTime)} – {formatTime(b.endTime)}
                  </p>
                </div>
                <Badge className={statusColor(b.bookingStatus)}>{b.bookingStatus.replace("_", " ")}</Badge>
              </div>

              <ul className="mt-3 space-y-1 text-sm text-ink-soft">
                {b.services.map((s, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{s.name}</span>
                    <span>{formatCurrency(s.price)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <span className="text-sm font-semibold text-ink">Total: {formatCurrency(b.totalAmount)}</span>
                <span className="text-xs text-ink-soft">#{b.bookingNumber}</span>
              </div>

              <div className="mt-3 flex gap-2">
                {["PENDING", "CONFIRMED"].includes(b.bookingStatus) && (
                  <button onClick={() => handleCancel(b._id)} className="btn-danger">
                    Cancel Booking
                  </button>
                )}
                {b.bookingStatus === "COMPLETED" && (
                  <button onClick={() => setReviewTarget(b)} className="btn-secondary text-sm">
                    Rate & Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
          <div className="w-full max-w-sm rounded-lg bg-paper p-6">
            <h3 className="font-display text-lg font-semibold">Rate {reviewTarget.salonId?.name}</h3>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setReviewRating(n)} className="text-2xl">
                  <span className={n <= reviewRating ? "text-brass" : "text-line"}>★</span>
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="How was your experience?"
              rows={3}
              className="input-field mt-3"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setReviewTarget(null)} className="btn-secondary text-sm">
                Cancel
              </button>
              <button onClick={handleReviewSubmit} className="btn-primary text-sm">
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
