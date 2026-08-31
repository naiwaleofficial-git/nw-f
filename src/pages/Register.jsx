import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore.js";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "CUSTOMER" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuthStore();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to NaiWale, ${user.name.split(" ")[0]}!`);
      navigate(user.role === "SALON_OWNER" ? "/owner" : "/", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-ink-soft">Book appointments, or list your salon.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Full name</label>
          <input required value={form.name} onChange={update("name")} className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Email (optional)</label>
          <input type="email" value={form.email} onChange={update("email")} className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Phone number</label>
          <input required value={form.phone} onChange={update("phone")} className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={update("password")}
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">I want to</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "CUSTOMER", label: "Book appointments" },
              { value: "SALON_OWNER", label: "List my salon" },
            ].map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setForm((f) => ({ ...f, role: opt.value }))}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  form.role === opt.value ? "border-brass bg-brass/10 text-ink" : "border-line text-ink-soft"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-clay hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
