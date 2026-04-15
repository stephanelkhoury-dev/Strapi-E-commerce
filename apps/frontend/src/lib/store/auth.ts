import { create } from "zustand";

interface AuthState {
  token: string | null;
  user: { id: number; username: string; email: string } | null;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("auth-token") : null,
  user:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("auth-user") || "null")
      : null,

  setAuth: (token, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth-token", token);
      localStorage.setItem("auth-user", JSON.stringify(user));
    }
    set({ token, user });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-token");
      localStorage.removeItem("auth-user");
    }
    set({ token: null, user: null });
  },

  isAuthenticated: () => !!get().token,
}));
