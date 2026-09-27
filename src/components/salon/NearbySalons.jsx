import { useLocationStore } from "../../store/locationStore.js";
import SalonCard from "./SalonCard.jsx";

export default function NearbySalons() {
  const { status, error, salons } = useLocationStore();
  const busy = status === "locating" || status === "loading";
  return (
    <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6" aria-labelledby="nearby-title">
      <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="nearby-title" className="text-xl font-semibold">A great salon, close to you.</h2>
          <p className="mt-1 text-sm text-ink-soft">Use your location to find salons within 10 km, nearest first.</p>
        </div>

      </div>
      <p role="status" className="mt-3 text-sm text-ink-soft">
        {error || (status === "success"
          ? salons.length ? `Found ${salons.length} salons within 10 km${salons.length === 50 ? " (showing the nearest 50)" : ""}.` : "No salons found within 10 km. Try searching by city above."
          : busy ? "Please wait while we find nearby salons." : "Select Turn on location in the navbar to find salons near you.")}
      </p>
      {status === "success" && salons.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {salons.map((salon) => <SalonCard key={salon._id} salon={salon} />)}
        </div>
      )}
    </section>
  );
}

