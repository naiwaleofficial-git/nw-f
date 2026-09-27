import { create } from "zustand";
import { fetchNearbySalons } from "../api/salonApi.js";

export const useLocationStore = create((set, get) => {
  const setStatus = (status) => set({ status });
  const setError = (error) => set({ error });
  const setSalons = (salons) => set({ salons });
  return {
    status: "idle",
    error: "",
    salons: [],
    locate: () => {
      if (["locating", "loading"].includes(get().status)) return;
      setError("");
      if (!navigator.geolocation || !window.isSecureContext) {
        setStatus("error");
        setError("Location is unavailable in this browser. Enter your city on the home page to search.");
        return;
      }
      setStatus("locating");
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          setStatus("loading");
          try {
            const result = await fetchNearbySalons({ lat: coords.latitude, lng: coords.longitude, maxDistance: 10000 });
            setSalons(result.data);
            setStatus("success");
          } catch {
            setStatus("error");
            setError("Nearby salons could not be loaded. Try again or search by city on the home page.");
          }
        },
        (failure) => {
          setStatus("error");
          setError(failure.code === 1
            ? "Location permission was denied. Allow location in your browser settings or enter your city on the home page."
            : failure.code === 3
              ? "Finding your location took too long. Try again or enter your city on the home page."
              : "Your location could not be found. Try again or enter your city on the home page.");
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    },

  };
});

