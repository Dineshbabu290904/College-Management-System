import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { authAPI } from "../services/api";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login({ email, password });
          const { user, accessToken, refreshToken } = response.data.data;

          // Store tokens
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true, user };
        } catch (error) {
          const message = error.response?.data?.message || "Login failed";
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          const { user, accessToken, refreshToken } = response.data.data;

          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true, user };
        } catch (error) {
          const message = error.response?.data?.message || "Registration failed";
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      logout: async () => {
        try {
          const refreshToken = get().refreshToken;
          if (refreshToken) {
            await authAPI.logout(refreshToken);
          }
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      },

      fetchUser: async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          // Check if token is expired
          const decoded = jwtDecode(accessToken);
          if (decoded.exp * 1000 < Date.now()) {
            // Token expired, try to refresh
            await get().refreshAccessToken();
            return;
          }

          const response = await authAPI.getMe();
          set({
            user: response.data.data,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Fetch user error:", error);
          get().logout();
        }
      },

      refreshAccessToken: async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          get().logout();
          return false;
        }

        try {
          const response = await authAPI.refreshToken(refreshToken);
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          set({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          });

          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
