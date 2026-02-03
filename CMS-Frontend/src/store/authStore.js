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

          // Handle different response structures
          const data = response.data?.data || response.data;
          const { user, accessToken, refreshToken } = data;

          if (!user || !accessToken) {
            throw new Error("Invalid response from server");
          }

          // Store tokens
          localStorage.setItem("accessToken", accessToken);
          if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
          }

          set({
            user,
            accessToken,
            refreshToken: refreshToken || null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, user };
        } catch (error) {
          const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Login failed. Please check your credentials.";
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          const data = response.data?.data || response.data;
          const { user, accessToken, refreshToken } = data;

          if (!user || !accessToken) {
            throw new Error("Invalid response from server");
          }

          localStorage.setItem("accessToken", accessToken);
          if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
          }

          set({
            user,
            accessToken,
            refreshToken: refreshToken || null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, user };
        } catch (error) {
          const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Registration failed";
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      logout: async () => {
        const refreshToken = get().refreshToken;

        try {
          if (refreshToken) {
            await authAPI.logout(refreshToken);
          }
        } catch (error) {
          console.error("Logout API error:", error);
        } finally {
          // Clear local storage
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("auth-storage");

          // Reset state
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      fetchUser: async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          // Check if token is expired
          const decoded = jwtDecode(accessToken);
          const isExpired = decoded.exp * 1000 < Date.now();

          if (isExpired) {
            // Token expired, try to refresh
            const refreshed = await get().refreshAccessToken();
            if (!refreshed) {
              return;
            }
          }

          const response = await authAPI.getMe();
          const user = response.data?.data || response.data;

          set({
            user,
            accessToken,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Fetch user error:", error);
          // Only logout if it's an auth error
          if (error.response?.status === 401 || error.response?.status === 403) {
            get().logout();
          }
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
          const data = response.data?.data || response.data;
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data;

          localStorage.setItem("accessToken", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          set({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken || refreshToken,
          });

          return true;
        } catch (error) {
          console.error("Token refresh failed:", error);
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

      setError: (error) => set({ error }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
