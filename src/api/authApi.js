import api from "./axios.js";

export const registerUser = (payload) => api.post("/auth/register", payload).then((r) => r.data);
export const loginUser = (payload) => api.post("/auth/login", payload).then((r) => r.data);
export const logoutUser = () => api.post("/auth/logout").then((r) => r.data);
export const fetchMe = () => api.get("/auth/me").then((r) => r.data);
export const updateMe = (payload) => api.put("/auth/me", payload).then((r) => r.data);
