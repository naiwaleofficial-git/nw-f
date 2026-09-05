import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const isLocalApiUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(configuredApiUrl || "");

const baseURL =
  configuredApiUrl && !(import.meta.env.PROD && isLocalApiUrl)
    ? configuredApiUrl
    : import.meta.env.PROD
      ? "/api"
      : "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Attach the JWT (stored by the auth store in localStorage) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("groombook_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error messages so components can just read err.message.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default api;
