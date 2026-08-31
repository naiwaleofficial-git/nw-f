export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-soft">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brass" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
