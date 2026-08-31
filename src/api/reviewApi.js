import api from "./axios.js";

export const submitReview = (payload) => api.post("/reviews", payload).then((r) => r.data);
export const addFavorite = (salonId) => api.post("/favorites", { salonId }).then((r) => r.data);
export const removeFavorite = (salonId) => api.delete(`/favorites/${salonId}`).then((r) => r.data);
export const fetchMyFavorites = () => api.get("/favorites").then((r) => r.data);
