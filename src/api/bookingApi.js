import api from "./axios.js";

export const fetchAvailableSlots = (params) =>
  api.get("/bookings/available-slots", { params }).then((r) => r.data);

export const createBooking = (payload) => api.post("/bookings", payload).then((r) => r.data);
export const fetchMyBookings = (params) => api.get("/bookings/my-bookings", { params }).then((r) => r.data);
export const fetchBooking = (id) => api.get(`/bookings/${id}`).then((r) => r.data);
export const cancelBooking = (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }).then((r) => r.data);
export const updateBookingStatus = (id, status, details = {}) =>
  api.put(`/bookings/${id}/status`, { status, ...details }).then((r) => r.data);
export const holdSlot = (payload) => api.post('/bookings/holds', payload).then((r) => r.data);
export const releaseHold = (id) => api.delete(`/bookings/holds/${id}`).then((r) => r.data);
export const fetchHolds = (salonId) => api.get(`/bookings/holds/salon/${salonId}`).then((r) => r.data);
export const createWalkIn = (payload) => api.post('/bookings/walk-in', payload).then((r) => r.data);
