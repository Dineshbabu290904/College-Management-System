import { create } from "zustand";
import { persist } from "zustand/middleware";

const useThemeStore = create(
  persist(
    (set, get) => ({
      mode: "system", // 'light', 'dark', or 'system'
      sidebarOpen: true,
      sidebarCollapsed: false,

      // Get actual theme based on mode and system preference
      getActualTheme: () => {
        const { mode } = get();
        if (mode === "system") {
          return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
        }
        return mode;
      },

      setMode: (mode) => {
        set({ mode });
        // Apply to document
        const actualTheme = mode === "system"
          ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
          : mode;
        document.documentElement.classList.toggle("dark", actualTheme === "dark");
      },

      toggleTheme: () => {
        const currentActual = get().getActualTheme();
        const newMode = currentActual === "dark" ? "light" : "dark";
        get().setMode(newMode);
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      toggleSidebarCollapse: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "theme-storage",
      partialize: (state) => ({
        mode: state.mode,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

export default useThemeStore;
