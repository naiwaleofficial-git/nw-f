import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSalons } from "../api/salonApi.js";
import SalonCard from "../components/salon/SalonCard.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import heroImage from "../assets/images/hero-barbershop.png";

const PAGE_SIZE = 6;

const SERVICES = [
  { label: "Haircut", short: "S1" },
  { label: "Massage", short: "S2" },
  { label: "Manicure", short: "S3" },
  { label: "Pedicure", short: "S4" },
  { label: "Beard", short: "S5" },
  { label: "Facial", short: "S6" },
  { label: "Hair Spa", short: "S7" },
  { label: "Threading", short: "S8" },
];

export default function Home() {
  const [city, setCity] = useState("");
  const [feedCity, setFeedCity] = useState("");
  const [selectedService, setSelectedService] = useState("Haircut");
  const [topRated, setTopRated] = useState([]);
  const [nearbySalons, setNearbySalons] = useState([]);
  const [isTopRatedLoading, setIsTopRatedLoading] = useState(true);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const loadMoreRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSalons({ limit: 8 })
      .then((res) => setTopRated(res.data))
      .catch(() => setTopRated([]))
      .finally(() => setIsTopRatedLoading(false));
  }, []);

  useEffect(() => {
    setIsFeedLoading(true);
    setPage(1);
    fetchSalons({ city: feedCity, service: selectedService, page: 1, limit: PAGE_SIZE })
      .then((res) => {
        setNearbySalons(res.data);
        setTotal(res.pagination.total);
        setHasMore(res.pagination.page * res.pagination.limit < res.pagination.total);
      })
      .catch(() => {
        setNearbySalons([]);
        setTotal(0);
        setHasMore(false);
      })
      .finally(() => setIsFeedLoading(false));
  }, [feedCity, selectedService]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMore) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || isFeedLoading || isLoadingMore) return;

      const nextPage = page + 1;
      setIsLoadingMore(true);
      fetchSalons({ city: feedCity, service: selectedService, page: nextPage, limit: PAGE_SIZE })
        .then((res) => {
          setNearbySalons((current) => [...current, ...res.data]);
          setPage(nextPage);
          setTotal(res.pagination.total);
          setHasMore(res.pagination.page * res.pagination.limit < res.pagination.total);
        })
        .finally(() => setIsLoadingMore(false));
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [feedCity, selectedService, page, hasMore, isFeedLoading, isLoadingMore]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city.trim()) params.set("city", city.trim());
    params.set("service", selectedService);
    navigate(`/search?${params.toString()}`);
  };

  const applyNearbyCity = (e) => {
    e.preventDefault();
    setFeedCity(city.trim());
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-ink text-paper">
        <img
          src={heroImage}
          alt="A barber preparing a chair in a modern salon"
          className="absolute inset-0 h-full w-full object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,23,20,0.92)_0%,rgba(27,23,20,0.76)_42%,rgba(27,23,20,0.24)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(27,23,20,0.76)_0%,rgba(27,23,20,0)_42%)] md:hidden" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="max-w-xl">
            <p className="section-eyebrow text-brass">Local barbers, one tap away</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-paper sm:text-5xl">
              Find your chair.
              <br />
              Book your <span className="text-brass">next cut.</span>
            </h1>
            <p className="mt-4 max-w-md text-paper/75">
              Compare nearby barbers and salons, pick services, choose a barber you trust, and lock in a time slot.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter your city"
                className="min-w-0 flex-1 rounded-md border-0 bg-white px-4 py-3 text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-brass"
              />
              <button type="submit" className="btn-primary shrink-0">
                Search
              </button>
            </form>
          </div>
        </div>
        <div className="barber-stripe" />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-eyebrow">Service lanes</p>
            <h2 className="mt-1 text-xl font-semibold">Browse nearby salons by service</h2>
          </div>
          <form onSubmit={applyNearbyCity} className="flex w-full max-w-sm gap-2 sm:w-auto">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Filter by city"
              className="input-field"
            />
            <button type="submit" className="btn-secondary !px-3 !py-2 text-sm">
              Apply
            </button>
          </form>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SERVICES.map((service) => (
            <button
              key={service.label}
              onClick={() => setSelectedService(service.label)}
              className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors ${
                selectedService === service.label
                  ? "border-brass bg-brass/10 text-ink"
                  : "border-line bg-white text-ink hover:border-brass"
              }`}
            >
              <span>
                <span className="block text-xs font-semibold uppercase text-clay">{service.short}</span>
                <span className="text-sm font-medium">{service.label}</span>
              </span>
              <span className="text-xs text-ink-soft">View</span>
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{selectedService} salons</h3>
            <p className="text-sm text-ink-soft">
              {isFeedLoading ? "Loading salons..." : `${nearbySalons.length} of ${total} salons shown`}
              {feedCity ? ` in ${feedCity}` : ""}
            </p>
          </div>
          <button
            onClick={() => navigate(`/search?service=${encodeURIComponent(selectedService)}`)}
            className="text-sm font-semibold text-clay hover:underline"
          >
            Open filters
          </button>
        </div>

        {isFeedLoading ? (
          <LoadingSpinner label="Finding nearby salons..." />
        ) : nearbySalons.length === 0 ? (
          <EmptyState
            title="No salons found"
            description="Try another city or service to see more salons."
          />
        ) : (
          <div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nearbySalons.map((salon) => (
                <SalonCard key={salon._id} salon={salon} />
              ))}
            </div>
            {hasMore && (
              <div ref={loadMoreRef} className="flex min-h-16 items-center justify-center">
                {isLoadingMore && <LoadingSpinner label="Loading more salons..." />}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Top rated salons</h2>
          <button onClick={() => navigate("/search")} className="text-sm font-semibold text-clay hover:underline">
            View all
          </button>
        </div>

        {isTopRatedLoading ? (
          <LoadingSpinner label="Finding great salons..." />
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topRated.map((salon) => (
              <SalonCard key={salon._id} salon={salon} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
