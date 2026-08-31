import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="font-display text-6xl font-semibold text-brass">404</p>
      <h1 className="text-xl font-semibold text-ink">This chair is empty</h1>
      <p className="text-sm text-ink-soft">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  );
}
