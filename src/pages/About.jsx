import { Link } from "react-router-dom";

const STATS = [
  { label: "Salons seeded", value: "100+" },
  { label: "Cities covered", value: "20" },
  { label: "Booking flow", value: "Live" },
];

export default function About() {
  return (
    <div>
      <section className="bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="section-eyebrow text-brass">About NaiWale</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-paper">
              Local grooming appointments, easier to compare and book.
            </h1>
            <p className="mt-4 max-w-2xl text-paper/70">
              NaiWale brings barber shops, salons, services, ratings, prices, teams, and appointment slots into one
              clean booking experience.
            </p>
            <Link to="/search" className="btn-primary mt-7">
              Find a salon
            </Link>
          </div>
          <div className="overflow-hidden rounded-lg border border-paper/10">
            <img
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=85"
              alt="Salon interior"
              className="h-full min-h-72 w-full object-cover"
            />
          </div>
        </div>
        <div className="barber-stripe" />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {STATS.map((item) => (
            <div key={item.label} className="card p-5">
              <p className="text-3xl font-semibold text-ink">{item.value}</p>
              <p className="mt-1 text-sm text-ink-soft">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="section-eyebrow">For customers</p>
          <h2 className="mt-2 text-2xl font-semibold">Book with clearer choices</h2>
          <p className="mt-3 text-ink-soft">
            Filter salons by service, gender category, price, city, and rating. Review salon details, compare services,
            choose a barber, and reserve a time slot from the same flow.
          </p>
        </div>
        <div>
          <p className="section-eyebrow">For salon owners</p>
          <h2 className="mt-2 text-2xl font-semibold">Manage the shop from one place</h2>
          <p className="mt-3 text-ink-soft">
            Salon owners can list salon details, maintain barbers and services, and view appointment activity through
            the owner dashboard.
          </p>
        </div>
      </section>
    </div>
  );
}
