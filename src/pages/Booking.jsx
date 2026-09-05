import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchSalon, fetchServices, fetchBarbers } from "../api/salonApi.js";
import { fetchAvailableSlots, createBooking } from "../api/bookingApi.js";
import { useAuthStore } from "../store/authStore.js";
import ServiceSelector from "../components/booking/ServiceSelector.jsx";
import BarberSelector from "../components/booking/BarberSelector.jsx";
import DateSelector from "../components/booking/DateSelector.jsx";
import TimeSlotPicker from "../components/booking/TimeSlotPicker.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import { formatCurrency, formatDuration, toISODate } from "../utils/formatters.js";

const STEPS = ["Services", "Barber", "Date & Time", "Details", "Confirm"];

export default function Booking() {
  const { id: salonId } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [step, setStep] = useState(0);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [barberId, setBarberId] = useState("");
  const [date, setDate] = useState(toISODate(new Date()));
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [bookingFor, setBookingFor] = useState("SELF");
  const [otherDetails, setOtherDetails] = useState({ name: "", phone: "", gender: "MALE" });
  const [paymentMethod, setPaymentMethod] = useState("PAY_AT_SALON");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([fetchSalon(salonId), fetchServices(salonId), fetchBarbers(salonId)])
      .then(([s, sv, b]) => {
        setSalon(s.data);
        setServices(sv.data);
        setBarbers(b.data);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }, [salonId]);

  const selectedServices = useMemo(
    () => services.filter((s) => selectedServiceIds.includes(s._id)),
    [services, selectedServiceIds]
  );

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);

  const toggleService = (serviceId) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  // Fetch slots whenever barber + services + date are all chosen
  useEffect(() => {
    if (!barberId || !selectedServiceIds.length || !date) return;

    setSlotsLoading(true);
    setSelectedSlot(null);

    fetchAvailableSlots({
      salonId,
      barberId,
      serviceIds: selectedServiceIds.join(","),
      date,
    })
      .then((res) => setSlots(res.data.slots))
      .catch((err) => {
        toast.error(err.message);
        setSlots([]);
      })
      .finally(() => setSlotsLoading(false));
  }, [barberId, selectedServiceIds, date, salonId]);

  const canGoNext = () => {
    if (step === 0) return selectedServiceIds.length > 0;
    if (step === 1) return !!barberId;
    if (step === 2) return !!selectedSlot;
    if (step === 3) return bookingFor === "SELF" || (otherDetails.name && otherDetails.phone);
    return true;
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to complete your booking");
      navigate("/login", { state: { from: { pathname: `/salons/${salonId}/book` } } });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        salonId,
        barberId,
        serviceIds: selectedServiceIds,
        startTime: selectedSlot.startTime,
        bookingFor:
          bookingFor === "SELF"
            ? { type: "SELF" }
            : { type: "OTHER", name: otherDetails.name, phone: otherDetails.phone, gender: otherDetails.gender },
        paymentMethod,
      };

      const res = await createBooking(payload);
      toast.success("Booking confirmed!");
      navigate(`/my-bookings`, { state: { newBookingId: res.data._id } });
    } catch (err) {
      toast.error(err.message);
      // slot may have just been taken — refresh slots
      setStep(2);
      setSelectedSlot(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading booking options..." />;
  if (!salon) return <p className="py-16 text-center text-ink-soft">Salon not found.</p>;

  const selectedBarber = barbers.find((b) => b._id === barberId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link to={`/salons/${salonId}`} className="text-sm text-ink-soft hover:text-ink">← Back to {salon.name}</Link>
      <h1 className="mt-2 text-2xl font-semibold">Book an appointment</h1>

      {/* Step indicator */}
      <div aria-label="Booking progress" className="mt-6 grid grid-cols-5 gap-1 sm:gap-2">
        {STEPS.map((label, i) => (
          <div key={label} aria-current={i === step ? "step" : undefined} className="flex min-w-0 flex-col items-center gap-2 text-center">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                i <= step ? "bg-brass text-ink" : "bg-line text-ink-soft"
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-xs sm:text-sm ${i === step ? "font-semibold text-ink" : "text-ink-soft"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 lg:grid-cols-3 lg:gap-8">
        <div className="min-w-0 lg:col-span-2">
          {step === 0 && (
            <ServiceSelector services={services} selectedIds={selectedServiceIds} onToggle={toggleService} />
          )}

          {step === 1 && (
            <div>
              <p className="mb-3 text-sm text-ink-soft">
                Pick a barber to see their real-time availability for the services you selected.
              </p>
              <BarberSelector barbers={barbers} selectedId={barberId} onSelect={setBarberId} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <p className="section-eyebrow mb-2">Date</p>
                <DateSelector selectedDate={date} onSelect={setDate} />
              </div>
              <div>
                <p className="section-eyebrow mb-2">Available times</p>
                {slotsLoading ? (
                  <LoadingSpinner label="Checking availability..." />
                ) : (
                  <TimeSlotPicker slots={slots} selectedStart={selectedSlot?.startTime} onSelect={setSelectedSlot} />
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <p className="section-eyebrow mb-2">Who is this appointment for?</p>
                <div className="grid grid-cols-2 gap-2">
                  {["SELF", "OTHER"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setBookingFor(opt)}
                      className={`rounded-md border px-3 py-2 text-sm font-medium ${
                        bookingFor === opt ? "border-brass bg-brass/10" : "border-line text-ink-soft"
                      }`}
                    >
                      {opt === "SELF" ? "Myself" : "Someone else"}
                    </button>
                  ))}
                </div>
              </div>

              {bookingFor === "OTHER" && (
                <div className="space-y-3">
                  <input
                    placeholder="Their name"
                    value={otherDetails.name}
                    onChange={(e) => setOtherDetails((d) => ({ ...d, name: e.target.value }))}
                    className="input-field"
                  />
                  <input
                    placeholder="Their phone number"
                    value={otherDetails.phone}
                    onChange={(e) => setOtherDetails((d) => ({ ...d, phone: e.target.value }))}
                    className="input-field"
                  />
                  <select
                    value={otherDetails.gender}
                    onChange={(e) => setOtherDetails((d) => ({ ...d, gender: e.target.value }))}
                    className="input-field"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              )}

              <div>
                <p className="section-eyebrow mb-2">Payment</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "PAY_AT_SALON", label: "Pay at salon" },
                    { value: "ONLINE", label: "Pay online now" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPaymentMethod(opt.value)}
                      className={`rounded-md border px-3 py-2 text-sm font-medium ${
                        paymentMethod === opt.value ? "border-brass bg-brass/10" : "border-line text-ink-soft"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="card p-6">
              <h3 className="font-display text-lg font-semibold">Review your booking</h3>
              <dl className="mt-4 space-y-2 text-sm">
                <Row label="Salon" value={salon.name} />
                <Row label="Barber" value={selectedBarber?.name || "Any available"} />
                <Row label="Date" value={date} />
                <Row label="Time" value={`${selectedSlot?.displayStart} – ${selectedSlot?.displayEnd}`} />
                <Row label="Services" value={selectedServices.map((s) => s.name).join(", ")} />
                <Row label="Duration" value={formatDuration(totalDuration)} />
                <Row label="Booking for" value={bookingFor === "SELF" ? "Myself" : otherDetails.name} />
                <Row label="Payment" value={paymentMethod === "ONLINE" ? "Pay online" : "Pay at salon"} />
              </dl>
              <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary mt-6 w-full">
                {isSubmitting ? "Confirming..." : `Confirm Booking · ${formatCurrency(totalPrice)}`}
              </button>
              {!isAuthenticated && (
                <p className="mt-2 text-center text-xs text-ink-soft">You'll be asked to log in first.</p>
              )}
            </div>
          )}

          {step < 4 && (
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="btn-secondary disabled:opacity-0"
              >
                Back
              </button>
              <button onClick={() => setStep((s) => s + 1)} disabled={!canGoNext()} className="btn-primary">
                Continue
              </button>
            </div>
          )}
        </div>

        {/* Ticket-style summary sidebar */}
        <aside className="min-w-0 h-fit break-words rounded-lg border border-line bg-white p-5 shadow-sm">
          <p className="section-eyebrow">Your booking</p>
          <p className="mt-2 font-display text-lg font-semibold">{salon.name}</p>
          {selectedServices.length > 0 ? (
            <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
              {selectedServices.map((s) => (
                <li key={s._id} className="flex justify-between gap-3">
                  <span>{s.name}</span>
                  <span className="shrink-0">{formatCurrency(s.price)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">No services selected yet.</p>
          )}
          <div className="mt-3 border-t border-dashed border-line pt-3 text-sm">
            <div className="flex justify-between font-semibold text-ink">
              <span>Total</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            {totalDuration > 0 && <p className="mt-1 text-xs text-ink-soft">≈ {formatDuration(totalDuration)}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line/70 pb-2 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="min-w-0 break-words font-medium text-ink sm:text-right">{value}</dd>
    </div>
  );
}
