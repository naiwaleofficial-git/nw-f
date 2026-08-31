import api from "./axios.js";

export const fetchPlatformStats = () => api.get("/admin/stats").then((r) => r.data);
export const fetchSalonsAdmin = (params) => api.get("/admin/salons", { params }).then((r) => r.data);
export const approveSalonAdmin = (id) => api.put(`/admin/salons/${id}/approve`).then((r) => r.data);
export const deactivateSalonAdmin = (id) => api.put(`/admin/salons/${id}/deactivate`).then((r) => r.data);
export const fetchUsersAdmin = (params) => api.get("/admin/users", { params }).then((r) => r.data);
export const deactivateUserAdmin = (id) => api.put(`/admin/users/${id}/deactivate`).then((r) => r.data);
