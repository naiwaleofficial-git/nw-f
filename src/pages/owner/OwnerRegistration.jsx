import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import { useAuthStore } from '../../store/authStore.js';
import { fetchMySalons } from '../../api/salonApi.js';

const steps = ['Swagat', 'Owner & OTP', 'Shop details', 'Working hours', 'Barbers & chairs', 'Services', 'Photos', 'Review & submit'];
const categories = ['Haircut', 'Beard', 'Facial', 'Hair Spa', 'Other'];
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const photoUrl = (url) => url?.startsWith('/api/') ? `${api.defaults.baseURL.replace(/\/api\/?$/, '')}${url}` : url;

export default function OwnerRegistration() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [returning, setReturning] = useState(false);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState('');
  const [owner, setOwner] = useState({ name: '', phone: '', email: '' });
  const [shop, setShop] = useState({ name: '', district: '', city: '', street: '', shopNumber: '', pincode: '', lat: '', lng: '' });
  const [hours, setHours] = useState({ open: '09:00', close: '21:00', closed: [] });
  const [barbers, setBarbers] = useState([{ name: '' }]);
  const [services, setServices] = useState([]);
  const [service, setService] = useState({ name: '', category: 'Haircut', price: '', durationMinutes: '30' });
  const [coverImage, setCoverImage] = useState('');
  const [images, setImages] = useState([]);
  const [submitted, setSubmitted] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    let active = true;
    if (!isAuthenticated) { setChecking(false); return; }
    if (user.role !== 'SALON_OWNER') { navigate(user.role === 'ADMIN' ? '/admin' : '/', { replace: true }); return; }
    setOwner({ name: user.name || '', phone: user.phone || '', email: user.email || '' });
    fetchMySalons().then((r) => {
      if (!active) return;
      if (r.data.length) { if (r.data[0].isApproved) navigate(`/owner/salons/${r.data[0]._id}`, { replace: true }); else setSubmitted(r.data[0]); }
      else setStep(user.isPhoneVerified ? 2 : 1);
    }).catch((e) => toast.error(e.message)).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [isAuthenticated, isLoading, user?._id, user?.isPhoneVerified, navigate]);

  useEffect(() => {
    if (!submitted) return;
    const timer = setInterval(async () => { try { const result = await fetchMySalons(); const current = result.data.find((s) => s._id === submitted._id); if (current?.isApproved && current.isActive) { toast.success('Your shop is approved!'); navigate(`/owner/salons/${current._id}`, { replace: true }); } } catch { /* Keep the pending screen during a temporary network outage. */ } }, 10000);
    return () => clearInterval(timer);
  }, [submitted?._id, navigate]);

  const otp = async (verify) => {
    setBusy(true);
    try {
      if (!verify) { const { data } = await api.post('/auth/otp/send', { phone: owner.phone }); setSent(true); setDevCode(data.developmentCode || ''); toast.success('OTP sent'); }
      else {
        const { data } = await api.post('/auth/otp/verify', { ...owner, code });
        localStorage.setItem('groombook_token', data.token);
        useAuthStore.setState({ token: data.token, user: data.user, isAuthenticated: true, isLoading: false });
        toast.success('Phone verified'); setStep(2);
      }
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };
  const upload = async (files, board) => {
    if (!files.length) return;
    if (files.length + (board ? 0 : images.length) > (board ? 1 : 4)) { toast.error('Choose one board photo and up to four interior photos'); return; }
    setBusy(true);
    try {
      for (const file of files) {
        if (file.size > 2 * 1024 * 1024) throw new Error('Each photo must be under 2 MB');
        const image = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
        const { data } = await api.post('/salons/photos', { image });
        if (board) setCoverImage(data.data.url); else setImages((current) => [...current, data.data.url]);
      }
    } catch (e) { toast.error(e.message || 'Photo upload failed'); }
    finally { setBusy(false); }
  };
  const workingHours = days.map((_, day) => ({ day, isOpen: !hours.closed.includes(day), openTime: hours.open, closeTime: hours.close }));
  const next = (event) => {
    event.preventDefault();
    if (step === 1) return;
    if (step === 3 && hours.open >= hours.close) { toast.error('Closing time must be after opening time'); return; }
    if (step === 6 && !coverImage) { toast.error('Upload the name-board photo'); return; }
    setStep(step + 1);
  };
  const submit = async () => {
    setBusy(true);
    try {
      if ((shop.lat === '') !== (shop.lng === '')) throw new Error('Enter both map coordinates or leave both empty');
      const { name, lat, lng, ...address } = shop;
      const { data } = await api.post('/salons/registration', { name, address, workingHours, barbers, services, coverImage, images, ...(lat !== '' && lng !== '' ? { location: { coordinates: [Number(lng), Number(lat)] } } : {}) });
      setSubmitted(data.data);
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  if (isLoading || checking) return <p className="p-12 text-center">Checking your registration…</p>;
  if (submitted) return <div className="mx-auto max-w-lg space-y-4 px-4 py-16 text-center"><h1 className="text-2xl font-semibold">Registration submitted</h1><p className="rounded-lg bg-amber-50 p-5">{submitted.name} is pending admin approval.</p><p>We check every 10 seconds and open your dashboard when your shop is approved.</p><Link className="btn-secondary" to="/owner">Owner dashboard</Link></div>;
  return <div className="mx-auto max-w-2xl px-4 py-10">
    <h1 className="text-2xl font-semibold">CutBook · Shop registration</h1>
    <p className="mt-2 text-sm text-ink-soft">Step {step + 1} of {steps.length} · {steps[step]}</p>
    <div className="mt-3 h-1 rounded bg-line"><div className="h-1 rounded bg-brass" style={{ width: `${(step + 1) / steps.length * 100}%` }} /></div>
    {step === 0 ? <div className="card mt-6 space-y-4 p-6"><h2 className="text-xl font-semibold">Swagat! Apni shop online laayein.</h2><p>Add your shop, barbers, services and photos. Start receiving bookings after approval.</p><button className="btn-primary w-full" onClick={() => { setReturning(false); setStep(1); }}>Shuru Karein</button><button className="btn-secondary w-full" onClick={() => { setReturning(true); setStep(1); }}>Returning shopkeeper · Phone OTP login</button><Link className="block text-center text-sm text-clay" to="/register">Register as a customer</Link></div> :
      <form onSubmit={next} className="card mt-6 space-y-4 p-6">
        {step === 1 && <>
          {!returning && <><label className="block">Owner name<input required minLength={2} className="input-field" value={owner.name} onChange={(e) => setOwner({ ...owner, name: e.target.value })} /></label><label className="block">Email (optional)<input type="email" className="input-field" value={owner.email} onChange={(e) => setOwner({ ...owner, email: e.target.value })} /></label></>}
          <label className="block">Phone<input required type="tel" placeholder="+91…" className="input-field" value={owner.phone} onChange={(e) => { setOwner({ ...owner, phone: e.target.value }); setSent(false); setCode(''); }} /></label>
          <button type="button" disabled={busy || !owner.phone || (!returning && owner.name.trim().length < 2)} className="btn-secondary" onClick={() => otp(false)}>{sent ? 'Resend OTP' : 'OTP Bhejo'}</button>
          {devCode && <p className="text-sm text-amber-800">Local development OTP: {devCode}</p>}
          {sent && <><label className="block">OTP<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="input-field" value={code} onChange={(e) => setCode(e.target.value)} /></label><button type="button" className="btn-primary" disabled={busy || code.length !== 6} onClick={() => otp(true)}>Verify OTP</button></>}
        </>}
        {step === 2 && <><div className="grid gap-3 sm:grid-cols-2">{[['name', 'Shop name'], ['district', 'District / Jila'], ['city', 'City / Shehar'], ['street', 'Street / Gali'], ['shopNumber', 'Shop number'], ['pincode', 'PIN code']].map(([field, label]) => <label key={field} className="block text-sm">{label}<input required pattern={field === 'pincode' ? '[0-9]{6}' : undefined} className="input-field" value={shop[field]} onChange={(e) => setShop({ ...shop, [field]: e.target.value })} /></label>)}</div>
          <p className="text-sm">Map location (optional)</p><button type="button" className="btn-secondary" onClick={() => navigator.geolocation ? navigator.geolocation.getCurrentPosition((p) => setShop((s) => ({ ...s, lat: String(p.coords.latitude), lng: String(p.coords.longitude) })), () => toast.error('Location unavailable. Enter coordinates manually.')) : toast.error('GPS unavailable')}>Use GPS location</button><div className="grid grid-cols-2 gap-3"><label>Latitude<input type="number" step="any" min="-90" max="90" className="input-field" value={shop.lat} onChange={(e) => setShop({ ...shop, lat: e.target.value })} /></label><label>Longitude<input type="number" step="any" min="-180" max="180" className="input-field" value={shop.lng} onChange={(e) => setShop({ ...shop, lng: e.target.value })} /></label></div>
          {shop.lat && shop.lng && <iframe title="Shop map pin" className="h-56 w-full rounded border" src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(shop.lng) - 0.01},${Number(shop.lat) - 0.01},${Number(shop.lng) + 0.01},${Number(shop.lat) + 0.01}&layer=mapnik&marker=${shop.lat},${shop.lng}`} />}
        </>}
        {step === 3 && <><p>Working hours (India Standard Time)</p><label className="block">Opening time<input required type="time" className="input-field" value={hours.open} onChange={(e) => setHours({ ...hours, open: e.target.value })} /></label><label className="block">Closing time<input required type="time" className="input-field" value={hours.close} onChange={(e) => setHours({ ...hours, close: e.target.value })} /></label><p>Closed days (optional)</p><div className="flex flex-wrap gap-2">{days.map((d, i) => <button key={d} type="button" aria-pressed={hours.closed.includes(i)} className={hours.closed.includes(i) ? 'btn-primary' : 'btn-secondary'} onClick={() => setHours({ ...hours, closed: hours.closed.includes(i) ? hours.closed.filter((n) => n !== i) : [...hours.closed, i] })}>{d}</button>)}</div></>}
        {step === 4 && <><label className="block">Number of chairs<select className="input-field" value={barbers.length} onChange={(e) => setBarbers(Array.from({ length: Number(e.target.value) }, (_, i) => barbers[i] || { name: '' }))}>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}</select></label>{barbers.map((b, i) => <label key={i} className="block">Chair {i + 1} · Barber name<input required className="input-field" value={b.name} onChange={(e) => setBarbers(barbers.map((item, index) => index === i ? { name: e.target.value } : item))} /></label>)}</>}
        {step === 5 && <><p className="text-sm">Add services in five categories, or skip and add them later.</p><label className="block">Category<select className="input-field" value={service.category} onChange={(e) => setService({ ...service, category: e.target.value })}>{categories.map((c) => <option key={c}>{c}</option>)}</select></label><label className="block">Service name<input className="input-field" value={service.name} onChange={(e) => setService({ ...service, name: e.target.value })} /></label><div className="grid grid-cols-2 gap-3"><label>Price (₹)<input type="number" min="0" step="0.01" className="input-field" value={service.price} onChange={(e) => setService({ ...service, price: e.target.value })} /></label><label>Duration (minutes)<input type="number" min="5" max="600" className="input-field" value={service.durationMinutes} onChange={(e) => setService({ ...service, durationMinutes: e.target.value })} /></label></div><button type="button" className="btn-secondary" onClick={() => { if (!service.name.trim() || service.price === '' || Number(service.price) < 0 || Number(service.durationMinutes) < 5 || Number(service.durationMinutes) > 600) { toast.error('Enter a name, valid price and duration (5–600 min)'); return; } if (services.some((s) => s.name.toLowerCase() === service.name.trim().toLowerCase())) { toast.error('Service already added'); return; } setServices([...services, { ...service, name: service.name.trim(), price: Number(service.price), durationMinutes: Number(service.durationMinutes) }]); setService({ ...service, name: '', price: '' }); }}>Add service</button>{services.map((s, i) => <div key={i} className="flex justify-between gap-3 text-sm"><span>{s.category} · {s.name} · ₹{s.price} · {s.durationMinutes} min</span><button type="button" onClick={() => setServices(services.filter((_, index) => index !== i))}>Remove</button></div>)}</>}
        {step === 6 && <><label className="block">Name-board photo (required)<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => upload(Array.from(e.target.files), true)} className="mt-2 block w-full text-sm" /></label>{coverImage && <img src={photoUrl(coverImage)} alt="Shop name board" className="h-40 rounded object-cover" />}<label className="block">Interior photos (optional, max 4)<input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => upload(Array.from(e.target.files), false)} className="mt-2 block w-full text-sm" /></label><p className="text-xs">JPEG, PNG or WebP · maximum 2 MB each</p><div className="grid grid-cols-2 gap-3">{images.map((url) => <div key={url}><img src={photoUrl(url)} alt="Shop interior" className="h-28 w-full rounded object-cover" /><button type="button" className="text-xs" onClick={() => setImages(images.filter((p) => p !== url))}>Remove</button></div>)}</div></>}
        {step === 7 && <><h2 className="text-lg font-semibold">Review your registration</h2><dl className="space-y-3 text-sm"><div><dt className="font-semibold">Owner</dt><dd>{owner.name} · {owner.phone} · {owner.email}</dd></div><div><dt className="font-semibold">Shop</dt><dd>{shop.name} · {shop.shopNumber}, {shop.street}, {shop.city}, {shop.district} · {shop.pincode}</dd></div><div><dt className="font-semibold">Hours</dt><dd>{hours.open}–{hours.close} IST · Closed: {hours.closed.map((d) => days[d]).join(', ') || 'None'}</dd></div><div><dt className="font-semibold">Chairs & barbers</dt><dd>{barbers.map((b, i) => `${i + 1}: ${b.name}`).join(', ')}</dd></div><div><dt className="font-semibold">Services</dt><dd>{services.map((s) => `${s.name} ₹${s.price} (${s.durationMinutes} min)`).join(', ') || 'Skipped — add later'}</dd></div><div><dt className="font-semibold">Photos</dt><dd>Name board + {images.length} interior photos</dd></div></dl><button type="button" disabled={busy} className="btn-primary w-full" onClick={submit}>{busy ? 'Submitting…' : 'Submit for approval'}</button></>}
        <div className="flex justify-between gap-2 pt-3"><button type="button" disabled={busy || (isAuthenticated && step === 2)} className="btn-secondary" onClick={() => setStep(Math.max(0, step - 1))}>Back</button>{step > 1 && step < 7 && <button disabled={busy} className="btn-primary" type="submit">{step === 5 && !services.length ? 'Skip services' : 'Continue'}</button>}</div>
      </form>}
  </div>;
}
