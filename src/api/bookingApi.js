import api from "./axios.js";

export const fetchAvailableSlots = (params) =>
  api.get("/bookings/available-slots", { params }).then((r) => r.data);

export const createBooking = (payload) => api.post("/bookings", payload).then((r) => r.data);
export const fetchMyBookings = (params) => api.get("/bookings/my-bookings", { params }).then((r) => r.data);
export const fetchBooking = (id) => api.get(`/bookings/${id}`).then((r) => r.data);
export const cancelBooking = (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }).then((r) => r.data);
export const updateBookingStatus = (id, status) =>
  api.put(`/bookings/${id}/status`, { status }).then((r) => r.data);
