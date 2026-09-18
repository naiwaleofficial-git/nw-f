import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMySalons } from '../../api/salonApi.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

export default function OwnerDashboard() {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    let prior = null;
    const load = async () => {
      try {
        const result = await fetchMySalons();
        if (!active) return;
        if (prior) { const approved = result.data.find((s) => s.isApproved && s.isActive && prior.some((p) => p._id === s._id && !p.isApproved)); if (approved) navigate('/owner/salons/' + approved._id, { replace: true }); }
        prior = result.data; setSalons(result.data); setError('');
      } catch (e) { if (active) setError(e.message); }
      finally { if (active) setLoading(false); }
    };
    load(); const timer = setInterval(load, 10000);
    return () => { active = false; clearInterval(timer); };
  }, [navigate]);
  if (loading) return <LoadingSpinner />;
  return <div className="mx-auto max-w-5xl space-y-5 px-4 py-8">
    <h1 className="text-2xl font-semibold">Owner Dashboard</h1>
    <p className="text-sm text-ink-soft">Manage your shop, barbers, services and bookings.</p>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {!salons.length && !error && <div className="card space-y-4 p-6"><p>Complete your shop registration to start receiving bookings.</p><Link className="btn-primary" to="/owner/register">Shuru Karein ? Register shop</Link></div>}
    <div className="grid gap-4 sm:grid-cols-2">{salons.map((s) => <div className="card space-y-3 p-5" key={s._id}><h2 className="text-lg font-semibold">{s.name}</h2><p>{s.address?.city}</p><p className={s.isApproved ? 'text-green-700' : 'text-amber-700'}>{s.isApproved ? 'Approved' : 'Pending admin approval'}</p>{s.isApproved ? <Link to={'/owner/salons/' + s._id} className="btn-primary">Manage shop</Link> : <p className="text-sm text-ink-soft">Checking approval every 10 seconds. Your dashboard opens automatically after approval.</p>}</div>)}</div>
  </div>;
}
