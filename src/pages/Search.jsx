import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchSalons } from "../api/salonApi.js";
import SalonCard from "../components/salon/SalonCard.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ShopsMap from '../components/salon/ShopsMap.jsx';

const PAGE_SIZE = 12;

const SERVICE_OPTIONS = [
  "Haircut",
  "Massage",
  "Manicure",
  "Pedicure",
  "Beard",
  "Hair Spa",
  "Facial",
  "Hair Coloring",
  "Threading",
  "Waxing",
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [salons, setSalons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const loadMoreRef = useRef(null);

  const city = searchParams.get("city") || "";
  const area = searchParams.get('area') || '';
  const q = searchParams.get("q") || "";
  const service = searchParams.get("service") || "";
  const category = searchParams.get("category") || "";
  const priceLevel = searchParams.get("priceLevel") || "";
  const minRating = searchParams.get("minRating") || "";

  useEffect(() => {
    setIsLoading(true);
    setPage(1);
    fetchSalons({ city, area, q, service, category, priceLevel, minRating, page: 1, limit: PAGE_SIZE })
      .then((res) => {
        setSalons(res.data);
        setTotal(res.pagination.total);
        setHasMore(res.pagination.page * res.pagination.limit < res.pagination.total);
      })
      .catch(() => {
        setSalons([]);
        setTotal(0);
        setHasMore(false);
      })
      .finally(() => setIsLoading(false));
  }, [city, area, q, service, category, priceLevel, minRating]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMore) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || isLoading || isLoadingMore) return;

      const nextPage = page + 1;
      setIsLoadingMore(true);
      fetchSalons({ city, area, q, service, category, priceLevel, minRating, page: nextPage, limit: PAGE_SIZE })
        .then((res) => {
          setSalons((current) => [...current, ...res.data]);
          setPage(nextPage);
          setTotal(res.pagination.total);
          setHasMore(res.pagination.page * res.pagination.limit < res.pagination.total);
        })
        .finally(() => setIsLoadingMore(false));
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [city, area, q, service, category, priceLevel, minRating, page, hasMore, isLoading, isLoadingMore]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    const cleanValue = value.trim?.() ?? value;
    if (cleanValue) next.set(key, cleanValue);
    else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">Salon finder</p>
          <h1 className="mt-1 text-2xl font-semibold">Find a barber or salon</h1>
        </div>
        <button onClick={clearFilters} className="btn-secondary !px-3 !py-2 text-sm">
          Clear filters
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-6">
        <input aria-label="Area" key={`area-${area}`} defaultValue={area} onBlur={(e) => updateParam('area', e.target.value)} placeholder="Area / street" className="input-field" />
        <input
          key={`city-${city}`}
          defaultValue={city}
          onBlur={(e) => updateParam("city", e.target.value)}
          placeholder="City"
          className="input-field"
        />
        <input
          key={`q-${q}`}
          defaultValue={q}
          onBlur={(e) => updateParam("q", e.target.value)}
          placeholder="Salon name or tag"
          className="input-field"
        />
        <select value={service} onChange={(e) => updateParam("service", e.target.value)} className="input-field">
          <option value="">Any service</option>
          {SERVICE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select value={category} onChange={(e) => updateParam("category", e.target.value)} className="input-field">
          <option value="">Any gender</option>
          <option value="MEN">Male</option>
          <option value="WOMEN">Female</option>
          <option value="UNISEX">Unisex</option>
        </select>
        <select value={priceLevel} onChange={(e) => updateParam("priceLevel", e.target.value)} className="input-field">
          <option value="">Any price</option>
          <option value="1">Budget</option>
          <option value="2">Mid-range</option>
          <option value="3">Premium</option>
        </select>
        <select value={minRating} onChange={(e) => updateParam("minRating", e.target.value)} className="input-field">
          <option value="">Any rating</option>
          <option value="3">3+ rating</option>
          <option value="4">4+ rating</option>
          <option value="4.5">4.5+ rating</option>
        </select>
      </div>

      <p className="mt-4 text-sm text-ink-soft">
        {isLoading ? "Searching..." : `Showing ${salons.length} of ${total} salons`}
      </p>
      <button className="btn-secondary mt-3" onClick={() => setShowMap(!showMap)}>{showMap ? 'Hide map' : 'View shops on map'}</button>
      {showMap && !isLoading && <ShopsMap salons={salons} />}

      {isLoading ? (
        <LoadingSpinner />
      ) : salons.length === 0 ? (
        <EmptyState
          title="No salons match those filters"
          description="Try a different service, city, price, or rating to see more results."
        />
      ) : (
        <div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {salons.map((salon) => (
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
    </div>
  );
}
