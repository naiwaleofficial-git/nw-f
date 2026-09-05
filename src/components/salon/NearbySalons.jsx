import { useEffect, useRef, useState } from "react";
import { fetchNearbySalons } from "../../api/salonApi.js";
import SalonCard from "./SalonCard.jsx";

export default function NearbySalons() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [salons, setSalons] = useState([]);
  const request = useRef(0);
  useEffect(() => () => { request.current += 1; }, []);

  const locate = () => {
    const id = ++request.current;
    setError("");
    if (!navigator.geolocation || !window.isSecureContext) {
      setStatus("error");
      setError("Location is unavailable in this browser. Enter your city above to search.");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        if (id !== request.current) return;
        setStatus("loading");
        try {
          const result = await fetchNearbySalons({ lat: coords.latitude, lng: coords.longitude, maxDistance: 10000 });
          if (id !== request.current) return;
          setSalons(result.data);
          setStatus("success");
        } catch {
          if (id !== request.current) return;
          setStatus("error");
          setError("Nearby salons could not be loaded. Try again or search by city above.");
        }
      },
      (failure) => {
        if (id !== request.current) return;
        setStatus("error");
        setError(failure.code === 1
          ? "Location permission was denied. Allow location in your browser settings or enter your city above."
          : failure.code === 3
            ? "Finding your location took too long. Try again or enter your city above."
            : "Your location could not be found. Try again or enter your city above.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  const busy = status === "locating" || status === "loading";
  return (
    <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6" aria-labelledby="nearby-title">
      <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="nearby-title" className="text-xl font-semibold">A great salon, close to you.</h2>
          <p className="mt-1 text-sm text-ink-soft">Use your location to find salons within 10 km, nearest first.</p>
        </div>
        <button type="button" onClick={locate} disabled={busy} className="btn-primary min-h-11 shrink-0">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2" />
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
          </svg>
          {status === "locating" ? "Finding your location..." : status === "loading" ? "Finding salons..." : "Use my location"}
        </button>
      </div>
      <p role="status" className="mt-3 text-sm text-ink-soft">
        {error || (status === "success"
          ? salons.length ? `Found ${salons.length} salons within 10 km${salons.length === 50 ? " (showing the nearest 50)" : ""}.` : "No salons found within 10 km. Try searching by city above."
          : busy ? "Please wait while we find nearby salons." : "Your browser will ask for permission when needed.")}
      </p>
      {status === "success" && salons.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {salons.map((salon) => <SalonCard key={salon._id} salon={salon} />)}
        </div>
      )}
    </section>
  );
}
