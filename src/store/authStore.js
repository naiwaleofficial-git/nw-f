import { create } from "zustand";
import { loginUser, registerUser, logoutUser, fetchMe } from "../api/authApi.js";

// Real, deployable app (not a sandboxed artifact) — localStorage is fine here
// and is what lets a page refresh keep the user logged in.
const TOKEN_KEY = "groombook_token";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY) || null,
  isLoading: true,
  isAuthenticated: false,

  init: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const { data } = await fetchMe();
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials) => {
    const { token, user } = await loginUser(credentials);
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user, isAuthenticated: true });
    return user;
  },

  register: async (payload) => {
    const { token, user } = await registerUser(payload);
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user, isAuthenticated: true });
    return user;
  },

  logout: async () => {
    try {
      await logoutUser();
    } catch {
      // ignore network errors on logout — clear local state regardless
    }
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));

export default useAuthStore;
