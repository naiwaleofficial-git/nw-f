# GroomBook (frontend)

React + Vite + Tailwind CSS frontend for GroomBook, a local barber/salon
discovery and appointment booking app.

## Setup

```bash
cd frontend
npm install
cp .env.example .env     # point VITE_API_URL at your backend if not localhost:5000
npm run dev               # http://localhost:5173
```

Make sure the backend is running first (see ../backend/README.md) and has
been seeded (`npm run seed` in backend/) so there's data to browse.

## Demo logins

- Customer: `9000000201` / `Customer@123`
- Salon owner: `9000000101` / `Owner@123`
- Admin: `9000000001` / `Admin@123`

## What's included

- **Customer flow**: browse/search salons by city, category, price and rating →
  salon detail page (services, barbers, reviews, working hours) → 5-step
  booking flow (services → barber → date/time → who it's for → confirm) →
  My Bookings (cancel, leave a review after completion).
- **Salon owner dashboard**: create salons, add/remove barbers and services,
  view and progress bookings through their lifecycle (confirm → check in →
  in progress → complete), or cancel.
- **Admin dashboard**: platform stats, approve/deactivate salons, deactivate
  users.

## Design system

Custom "barbershop" visual identity defined in `tailwind.config.js`:
ink/charcoal + brass/gold + clay-red accents, Fraunces for display type and
Inter for body text, with a repeating diagonal barber-pole stripe used as a
signature divider (see `.barber-stripe` in `src/index.css`).

## Structure

```
src/
  api/            axios instance + one module per resource
  store/          zustand auth store (JWT persisted in localStorage)
  components/     layout, common UI, salon cards, booking-flow pieces
  pages/          customer pages, pages/owner, pages/admin
  routes/         ProtectedRoute (auth + role gating)
  utils/          currency/date/status formatters
```
