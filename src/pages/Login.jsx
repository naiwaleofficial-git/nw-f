import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore.js";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await login({ phone, password });
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      const redirectTo = location.state?.from?.pathname || (user.role === "ADMIN" ? "/admin" : user.role === "SALON_OWNER" ? "/owner" : "/");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Log in to NaiWale</h1>
        <p className="mt-1 text-sm text-ink-soft">Book your next appointment in seconds.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Phone number</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9000000201"
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-field"
          />
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>

        <p className="rounded-md bg-line/50 p-3 text-xs text-ink-soft">
          Demo customer: <strong>9000000201</strong> / <strong>Customer@123</strong><br />
          Demo owner: <strong>9000000101</strong> / <strong>Owner@123</strong><br />
          Demo admin: <strong>9000000001</strong> / <strong>Admin@123</strong>
        </p>
      </form>

      <p className="text-center text-sm text-ink-soft">
        New here?{" "}
        <Link to="/register" className="font-semibold text-clay hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
