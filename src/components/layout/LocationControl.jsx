import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocationStore } from "../../store/locationStore.js";

export default function LocationControl() {
  const { status, error, locationActive, locate } = useLocationStore();
  const [promptOpen, setPromptOpen] = useState(false);
  const [permission, setPermission] = useState("prompt");
  const dialogRef = useRef(null);
  const busy = status === "locating" || status === "loading";

  useEffect(() => {
    let cancelled = false;
    let permissionStatus;
    const updatePermission = () => {
      if (cancelled) return;
      setPermission(permissionStatus.state);
      if (permissionStatus.state === "granted") {
        setPromptOpen(false);
        locate();
      } else {
        useLocationStore.setState({ locationActive: false });
        setPromptOpen(true);
      }
    };
    const checkPermission = async () => {
      try {
        permissionStatus = await navigator.permissions.query({ name: "geolocation" });
        if (cancelled) return;
        updatePermission();
        permissionStatus.addEventListener("change", updatePermission);
      } catch {
        // Browsers without permission queries need an explicit user action.
        if (!cancelled) setPromptOpen(true);
      }
    };
    checkPermission();
    return () => {
      cancelled = true;
      permissionStatus?.removeEventListener("change", updatePermission);
    };
  }, [locate]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (promptOpen && !dialog.open) dialog.showModal();
    if (!promptOpen && dialog.open) dialog.close();
  }, [promptOpen]);

  const label = busy ? "Finding your location" : locationActive ? "Location is on. Refresh location" : "Enable location";
  return (
    <>
      <button
        type="button"
        onClick={() => locationActive ? locate() : setPromptOpen(true)}
        disabled={busy}
        aria-label={label}
        title={error || label}
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-brass/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${locationActive ? "text-ink" : "text-clay"}`}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-5 w-5 ${!locationActive ? "motion-safe:animate-pulse" : ""}`}>
          <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      </button>
      {createPortal(
        <dialog ref={dialogRef} onCancel={() => setPromptOpen(false)} onClose={() => setPromptOpen(false)} aria-labelledby="location-prompt-title" aria-describedby="location-prompt-description" className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-line bg-paper p-6 text-ink shadow-xl backdrop:bg-ink/50">
          <h2 id="location-prompt-title" className="text-xl font-semibold">Find salons near you</h2>
          <p id="location-prompt-description" className="mt-3 text-sm text-ink-soft">
            {permission === "denied" ? "Location is blocked for this site. Allow location in your browser settings, then try again." : "Enable your device location and allow access to discover salons within 10 km."}
          </p>
          {error && <p role="alert" className="mt-3 text-sm text-clay">{error}</p>}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={() => setPromptOpen(false)} className="btn-secondary">Not now</button>
            <button type="button" disabled={busy} onClick={() => { locate(); setPromptOpen(false); }} className="btn-primary">{permission === "denied" ? "Try again" : "Enable location"}</button>
          </div>
        </dialog>, document.body
      )}
    </>
  );
}
