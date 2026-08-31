import api from "./axios.js";

export const fetchSalons = (params) => api.get("/salons", { params }).then((r) => r.data);
export const fetchNearbySalons = (params) => api.get("/salons/nearby", { params }).then((r) => r.data);
export const fetchSalon = (id) => api.get(`/salons/${id}`).then((r) => r.data);
export const fetchMySalons = () => api.get("/salons/my/list").then((r) => r.data);
export const createSalon = (payload) => api.post("/salons", payload).then((r) => r.data);
export const updateSalon = (id, payload) => api.put(`/salons/${id}`, payload).then((r) => r.data);
export const deleteSalon = (id) => api.delete(`/salons/${id}`).then((r) => r.data);

export const fetchBarbers = (salonId) => api.get(`/salons/${salonId}/barbers`).then((r) => r.data);
export const createBarber = (salonId, payload) => api.post(`/salons/${salonId}/barbers`, payload).then((r) => r.data);
export const updateBarber = (id, payload) => api.put(`/barbers/${id}`, payload).then((r) => r.data);
export const deleteBarber = (id) => api.delete(`/barbers/${id}`).then((r) => r.data);

export const fetchServices = (salonId) => api.get(`/salons/${salonId}/services`).then((r) => r.data);
export const createService = (salonId, payload) => api.post(`/salons/${salonId}/services`, payload).then((r) => r.data);
export const updateService = (id, payload) => api.put(`/services/${id}`, payload).then((r) => r.data);
export const deleteService = (id) => api.delete(`/services/${id}`).then((r) => r.data);

export const fetchReviews = (salonId) => api.get(`/salons/${salonId}/reviews`).then((r) => r.data);
export const fetchSalonBookings = (salonId, params) =>
  api.get(`/salons/${salonId}/bookings`, { params }).then((r) => r.data);
