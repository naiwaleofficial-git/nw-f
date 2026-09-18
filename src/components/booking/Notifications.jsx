import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import { useAuthStore } from '../../store/authStore.js';

export default function Notifications() {
  const { token, user, isAuthenticated } = useAuthStore();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const audio = useRef(null);
  const seen = useRef(new Set());
  useEffect(() => {
    if (!isAuthenticated) { setItems([]); setUnread(0); return; }
    let disposed = false;
    let retry;
    const abort = new AbortController();
    seen.current = new Set();
    let initialized = false;
    const receive = (item, alert = true) => {
      if (disposed || seen.current.has(item._id)) return;
      seen.current.add(item._id);
      if (!alert) return;
      window.dispatchEvent(new Event('booking-updated'));
      toast(item.message);
      if (audio.current && item.kind === 'NEW_BOOKING' && user.role === 'SALON_OWNER') {
        const context = audio.current;
        [0, 0.3, 0.6].forEach((delay) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.connect(gain); gain.connect(context.destination);
          oscillator.frequency.value = 880;
          gain.gain.setValueAtTime(0.12, context.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + delay + 0.22);
          oscillator.start(context.currentTime + delay); oscillator.stop(context.currentTime + delay + 0.25);
        });
      }
      if ('Notification' in window && Notification.permission === 'granted') new Notification('CutBook', { body: item.message, tag: item._id });
    };
    const sync = async () => {
      try {
        const { data } = await api.get('/notifications');
        if (disposed) return;
        data.data.slice().reverse().forEach((item) => receive(item, initialized && !item.read));
        initialized = true; setItems(data.data); setUnread(data.unread);
      } catch { /* Stream reconnect and periodic sync recover network interruptions. */ }
    };
    const connect = async () => {
      try {
        const response = await fetch(`${api.defaults.baseURL}/notifications/stream`, { headers: { Authorization: `Bearer ${token}` }, credentials: 'include', signal: abort.signal });
        if (!response.ok) throw new Error('Stream unavailable');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (!disposed) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let boundary;
          while ((boundary = buffer.indexOf('\n\n')) >= 0) {
            const frame = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 2);
            if (frame.startsWith('data: ')) { receive(JSON.parse(frame.slice(6))); sync(); }
          }
        }
      } catch { /* Retry with fresh authorization and refresh the persisted inbox. */ }
      if (!disposed) retry = setTimeout(() => { sync(); connect(); }, 5000);
    };
    sync().then(() => { if (!disposed) connect(); });
    const poll = setInterval(sync, 15000);
    return () => { disposed = true; abort.abort(); clearTimeout(retry); clearInterval(poll); };
  }, [token, isAuthenticated, user?.role]);

  const enable = async () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) { audio.current ||= new AudioContext(); await audio.current.resume(); }
      if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
      setEnabled(true);
    } catch { toast.error('Browser alerts are unavailable. Your inbox will still update.'); }
  };
  if (!isAuthenticated) return null;
  return <div className="relative">
    <button className="btn-secondary !px-3" onClick={() => setOpen(!open)} aria-label={`Notifications, ${unread} unread`}>🔔 {unread > 0 && <span>{unread}</span>}</button>
    {open && <div className="absolute right-0 top-12 z-50 max-h-96 w-72 overflow-auto rounded-lg border border-line bg-white p-4 shadow-xl">
      <div className="flex items-center justify-between"><strong>Notifications</strong><button onClick={() => setOpen(false)} aria-label="Close notifications">✕</button></div>
      <button className="mt-2 text-sm text-clay" onClick={enable}>{enabled ? 'Alerts enabled' : 'Enable sound & browser alerts'}</button>
      <button className="mt-2 block text-xs" onClick={async () => { try { await api.put('/notifications/read', { ids: items.map((n) => n._id) }); setItems(items.map((n) => ({ ...n, read: true }))); setUnread(Math.max(0, unread - items.filter((n) => !n.read).length)); } catch (e) { toast.error(e.message); } }}>Mark displayed notifications as read</button>
      {!items.length && <p className="mt-3 text-sm">No notifications yet.</p>}
      {items.map((item) => <Link key={item._id} to={user.role === 'SALON_OWNER' ? '/owner' : '/my-bookings'} onClick={() => setOpen(false)} className={`mt-2 block rounded p-2 text-sm ${item.read ? 'bg-paper' : 'bg-amber-50'}`}>{item.message}</Link>)}
    </div>}
  </div>;
}
