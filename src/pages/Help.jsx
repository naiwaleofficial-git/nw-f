import { Link } from "react-router-dom";

const FAQS = [
  {
    question: "How do I find a salon for a specific service?",
    answer: "Use the service filter for Haircut, Massage, Manicure, Pedicure, Beard, Facial, and more.",
  },
  {
    question: "Can I filter by male or female salons?",
    answer: "Yes. Open the salon finder and choose Male, Female, or Unisex in the gender filter.",
  },
  {
    question: "Can salon owners add services?",
    answer: "Yes. Owners can open their dashboard, select a salon, and add services from the Services tab.",
  },
  {
    question: "Is this a production booking service?",
    answer: "This project is set up as a demo application with seeded salons, bookings, and reviews.",
  },
];

export default function Help() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="section-eyebrow">Help center</p>
          <h1 className="mt-2 text-3xl font-semibold">Support for booking and salon management</h1>
          <p className="mt-3 text-ink-soft">
            Find quick answers for customers, salon owners, and admins using NaiWale.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/search" className="btn-primary">
              Search salons
            </Link>
            <Link to="/register" className="btn-secondary">
              Create account
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq) => (
            <details key={faq.question} className="card p-4">
              <summary className="cursor-pointer font-semibold text-ink">{faq.question}</summary>
              <p className="mt-3 text-sm text-ink-soft">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="section-eyebrow">Email</p>
          <a href="mailto:support@naiwale.app" className="mt-2 block font-semibold text-ink hover:text-clay">
            support@naiwale.app
          </a>
        </div>
        <div className="card p-5">
          <p className="section-eyebrow">Phone</p>
          <a href="tel:+919000000000" className="mt-2 block font-semibold text-ink hover:text-clay">
            +91 90000 00000
          </a>
        </div>
        <div className="card p-5">
          <p className="section-eyebrow">Hours</p>
          <p className="mt-2 font-semibold text-ink">Mon-Sat, 9:00 AM - 7:00 PM</p>
        </div>
      </section>
    </div>
  );
}
