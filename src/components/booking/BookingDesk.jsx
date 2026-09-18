import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchSalonBookings, updateSalon } from '../../api/salonApi.js';
import { updateBookingStatus, fetchHolds, releaseHold, createWalkIn, fetchAvailableSlots } from '../../api/bookingApi.js';
import { formatCurrency, formatTime, formatDateLabel } from '../../utils/formatters.js';

const today = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
const windowFor = (booking, now) => { const minutes = (+new Date(booking.startTime) - now) / 60000; return minutes > 10 ? 'EARLY' : minutes > 0 ? 'LOCKED' : minutes >= -30 ? 'START' : 'EXPIRED'; };
function elapsed(booking, now) { const seconds = Math.max(0, Math.floor(((booking.completedAt ? +new Date(booking.completedAt) : now) - +new Date(booking.startedAt)) / 1000)); return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; }

export default function BookingDesk({ salon, barbers, services }) {
  const [bookings, setBookings] = useState([]);
  const [holds, setHolds] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [autoAccept, setAutoAccept] = useState(salon.autoAccept);
  const [busy, setBusy] = useState(false);
  const [target, setTarget] = useState(null);
  const [assignment, setAssignment] = useState({ barberId: '', chair: 1 });
  const [reason, setReason] = useState('');
  const [walkIn, setWalkIn] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', barberId: '', date: today(), serviceIds: [], startTime: '' });
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const load = async () => {
    try { const [b, h] = await Promise.all([fetchSalonBookings(salon._id), fetchHolds(salon._id)]); setBookings(b.data); setHolds(h.data); setError(''); }
    catch (e) { setError(e.message); }
  };
  useEffect(() => { load(); const timer = setInterval(load, 10000); const clock = setInterval(() => setNow(Date.now()), 1000); window.addEventListener('booking-updated', load); return () => { clearInterval(timer); clearInterval(clock); window.removeEventListener('booking-updated', load); }; }, [salon._id]);
  useEffect(() => {
    let active = true; setSlots([]); setForm((f) => ({ ...f, startTime: '' }));
    if (walkIn && form.barberId && form.serviceIds.length) fetchAvailableSlots({ salonId: salon._id, barberId: form.barberId, serviceIds: form.serviceIds.join(','), date: form.date, walkIn: 'true' }).then((r) => { if (active) setSlots(r.data.slots); }).catch((e) => { if (active) toast.error(e.message); });
    return () => { active = false; };
  }, [walkIn, form.barberId, form.serviceIds, form.date, salon._id, refresh]);
  const act = async (booking, status, details = {}) => {
    setBusy(true);
    try { await updateBookingStatus(booking._id, status, details); setTarget(null); await load(); toast.success('Booking updated'); }
    catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };
  const cancelled = bookings.filter((b) => b.cancelledBy !== 'CUSTOMER' && b.cancelledAt && new Date(+new Date(b.cancelledAt) + 330 * 60000).toISOString().slice(0, 10) === today()).length;
  const earnings = bookings.filter((b) => b.bookingStatus === 'COMPLETED').reduce((sum, b) => sum + b.totalAmount, 0);
  return <div className="mt-6 space-y-4">
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <div className="card flex flex-wrap items-center justify-between gap-4 p-4">
      <div><p className="text-sm text-ink-soft">Completed earnings</p><strong id="st-earn" className="text-xl">{formatCurrency(earnings)}</strong><p className="text-xs">Shop cancellations today: {cancelled}/3</p></div>
      <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(autoAccept)} disabled={busy} onChange={async (e) => { const value = e.target.checked; setBusy(true); try { await updateSalon(salon._id, { autoAccept: value }); setAutoAccept(value); } catch (err) { toast.error(err.message); } finally { setBusy(false); } }} />Auto accept new bookings</label>
      <button className="btn-primary" onClick={() => setWalkIn(true)} disabled={!salon.isApproved}>＋ Walk-in booking</button>
    </div>
    {!salon.isApproved && <p className="rounded bg-amber-50 p-4">Your shop is awaiting admin approval. Bookings open after approval.</p>}
    {holds.filter((h) => +new Date(h.expiresAt) > now).length > 0 && <section className="card p-4"><h3 className="font-semibold">Active slot holds</h3>{holds.filter((h) => +new Date(h.expiresAt) > now).map((h) => <div key={h._id} className="mt-2 flex flex-wrap justify-between gap-2 text-sm"><span>{h.barberId?.name} · {formatTime(h.startTime)} · {Math.ceil((+new Date(h.expiresAt) - now) / 60000)} min left</span><button className="text-red-700" disabled={busy} onClick={async () => { if (!window.confirm('Release this customer’s slot hold?')) return; setBusy(true); try { await releaseHold(h._id); await load(); } catch (e) { toast.error(e.message); } finally { setBusy(false); } }}>Force release</button></div>)}</section>}
    {!bookings.length && <p>No bookings yet.</p>}
    {bookings.map((b) => {
      const accepted = ['ACCEPTED', 'CONFIRMED', 'CHECKED_IN'].includes(b.bookingStatus);
      const zone = windowFor(b, now);
      return <article key={b._id} className="card flex flex-wrap items-center justify-between gap-4 p-4">
        <div><p className="font-semibold">{b.customerName || b.bookingFor?.name || b.customerId?.name} · {b.customerPhone || b.customerId?.phone}</p><p className="text-sm">{formatDateLabel(b.startTime)} · {formatTime(b.startTime)} IST · {b.barberName || b.barberId?.name}{b.chair ? ` · Chair ${b.chair}` : ''}</p><p className="text-sm text-ink-soft">{b.services.map((s) => s.name).join(', ')} · {formatCurrency(b.totalAmount)}{b.isWalkIn ? ' · Walk-in' : ''}</p><p className="mt-1 text-xs font-semibold">{accepted ? 'ACCEPTED' : b.bookingStatus.replaceAll('_', ' ')}</p>{b.startedAt && <p className="mt-1 font-mono">Work timer {elapsed(b, now)}</p>}{b.cancellationReason && <p className="text-xs">Reason: {b.cancellationReason}</p>}</div>
        <div className="flex flex-wrap gap-2">
          {b.bookingStatus === 'PENDING' && <button disabled={busy} className="btn-primary" onClick={() => act(b, 'ACCEPTED')}>✓ Accept</button>}
          {(b.bookingStatus === 'PENDING' || (accepted && zone === 'EARLY')) && <button disabled={busy || cancelled >= 3} className="btn-danger" onClick={() => { setReason(''); setTarget({ booking: b, action: 'CANCELLED' }); }}>✕ Reject</button>}
          {accepted && zone === 'LOCKED' && <span className="text-sm">🔒 Lock zone</span>}
          {accepted && zone === 'EXPIRED' && <span className="text-sm">⏰ Start window expired</span>}
          {accepted && zone === 'START' && <button disabled={busy} className="btn-primary" onClick={() => { setAssignment({ barberId: b.barberId?._id || '', chair: b.chair || 1 }); setTarget({ booking: b, action: 'IN_PROGRESS' }); }}>▶ Shuru Karo</button>}
          {b.bookingStatus === 'IN_PROGRESS' && <button disabled={busy} className="btn-primary" onClick={() => setTarget({ booking: b, action: 'COMPLETED' })}>✓ Kaam Pura Hua</button>}
        </div>
      </article>;
    })}
    {target && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div role="dialog" aria-modal="true" aria-labelledby="booking-action" className="w-full max-w-md space-y-4 rounded-lg bg-white p-6"><h3 id="booking-action" className="text-lg font-semibold">{target.action === 'IN_PROGRESS' ? 'Assign barber and chair' : target.action === 'COMPLETED' ? 'Confirm work is complete?' : 'Reject booking'}</h3>
      {target.action === 'IN_PROGRESS' && <><label className="block">Barber<select className="input-field" value={assignment.barberId} onChange={(e) => setAssignment({ ...assignment, barberId: e.target.value })}>{barbers.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}</select></label><label className="block">Chair<select className="input-field" value={assignment.chair} onChange={(e) => setAssignment({ ...assignment, chair: Number(e.target.value) })}>{Array.from({ length: salon.chairCount || 1 }, (_, i) => <option key={i} value={i + 1}>Chair {i + 1}</option>)}</select></label></>}
      {target.action === 'CANCELLED' && <label className="block">Reason (optional)<select className="input-field" value={reason} onChange={(e) => setReason(e.target.value)}>{['', 'Barber unavailable', 'Shop emergency', 'Customer requested cancellation', 'Other'].map((r) => <option key={r} value={r}>{r || 'No reason'}</option>)}</select></label>}
      <div className="flex justify-end gap-2"><button disabled={busy} className="btn-secondary" onClick={() => setTarget(null)}>Back</button><button disabled={busy} className="btn-primary" onClick={() => act(target.booking, target.action, { ...assignment, reason })}>{busy ? 'Saving…' : 'Confirm'}</button></div>
    </div></div>}
    {walkIn && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form role="dialog" aria-modal="true" aria-label="Walk-in booking" className="max-h-[90vh] w-full max-w-lg space-y-3 overflow-auto rounded-lg bg-white p-6" onSubmit={async (e) => { e.preventDefault(); setBusy(true); try { await createWalkIn({ ...form, salonId: salon._id }); setWalkIn(false); await load(); toast.success('Walk-in booking accepted'); } catch (err) { toast.error(err.message); setRefresh((n) => n + 1); } finally { setBusy(false); } }}>
      <h3 className="text-lg font-semibold">Walk-in / manual booking</h3>
      <label className="block">Customer name<input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label className="block">Phone<input required type="tel" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
      <fieldset><legend>Services</legend>{services.map((s) => <label key={s._id} className="flex items-center gap-2 py-1 text-sm"><input type="checkbox" checked={form.serviceIds.includes(s._id)} onChange={(e) => setForm({ ...form, serviceIds: e.target.checked ? [...form.serviceIds, s._id] : form.serviceIds.filter((id) => id !== s._id) })} />{s.name} · {formatCurrency(s.price)}</label>)}</fieldset>
      <p className="font-semibold">Total {formatCurrency(services.filter((s) => form.serviceIds.includes(s._id)).reduce((sum, s) => sum + s.price, 0))}</p>
      <label className="block">Barber<select required className="input-field" value={form.barberId} onChange={(e) => setForm({ ...form, barberId: e.target.value })}><option value="">Select barber</option>{barbers.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}</select></label>
      <label className="block">Date<input required type="date" min={today()} className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
      <label className="block">Time (IST)<select required className="input-field" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}><option value="">{slots.length ? 'Select time' : 'No available slots'}</option>{slots.map((s) => <option key={s.startTime} value={s.startTime}>{s.displayStart}</option>)}</select></label>
      <div className="flex justify-end gap-2"><button type="button" disabled={busy} className="btn-secondary" onClick={() => setWalkIn(false)}>Cancel</button><button disabled={busy || !form.startTime || !form.serviceIds.length} className="btn-primary">{busy ? 'Booking…' : 'Confirm walk-in'}</button></div>
    </form></div>}
  </div>;
}
