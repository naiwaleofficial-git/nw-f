export function formatCurrency(amount) {
  return `Rs ${Number(amount || 0).toLocaleString("en-IN")}`;
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export function formatDateLabel(date) {
  const d = new Date(date);
  if (toISODate(d) === toISODate(new Date())) return 'Today';
  if (toISODate(d) === toISODate(new Date(Date.now() + 86400000))) return 'Tomorrow';
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: 'Asia/Kolkata' });
}

export function toISODate(date) {
  const d = new Date(date);
  const local = new Date(d.getTime() + 330 * 60000);
  return local.toISOString().slice(0, 10);
}

export function statusColor(status) {
  const map = {
    PENDING: "bg-amber-100 text-amber-800",
    ACCEPTED: "bg-blue-100 text-blue-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    CHECKED_IN: "bg-indigo-100 text-indigo-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    NO_SHOW: "bg-gray-200 text-gray-700",
  };
  return map[status] || "bg-gray-100 text-gray-700";
}
