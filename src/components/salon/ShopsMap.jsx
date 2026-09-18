import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ShopsMap({ salons }) {
  const [selectedId, setSelectedId] = useState('');
  const located = salons.filter((s) => s.location?.coordinates?.length === 2);
  const selected = located.find((s) => s._id === selectedId) || located[0];
  if (!selected) return <p className="mt-4 rounded border p-4 text-sm">These shops have not added map locations yet.</p>;
  const [lng, lat] = selected.location.coordinates;
  return <section className="mt-4 space-y-3 rounded-lg border border-line p-4"><label className="block text-sm">View shop on map<select value={selected._id} onChange={(e) => setSelectedId(e.target.value)} className="input-field">{located.map((s) => <option key={s._id} value={s._id}>{s.name} · {s.address?.city}</option>)}</select></label><iframe title={`${selected.name} map location`} className="h-80 w-full rounded" loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.015},${lat - 0.015},${lng + 0.015},${lat + 0.015}&layer=mapnik&marker=${lat},${lng}`} /><Link className="btn-primary" to={`/salons/${selected._id}`}>View {selected.name}</Link><a className="ml-3 text-sm text-clay" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`}>Open map</a></section>;
}
