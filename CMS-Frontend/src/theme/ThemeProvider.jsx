import React, { useMemo, useEffect } from "react";
import { ThemeProvider as MUIThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import useThemeStore from "../store/themeStore";

const ThemeProvider = ({ children }) => {
  const { mode, getActualTheme, setMode } = useThemeStore();

  // Listen for system theme changes
  useEffect(() => {
    if (mode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        setMode("system"); // This will re-apply the correct theme
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [mode, setMode]);

  // Apply initial theme
  useEffect(() => {
    const actualTheme = getActualTheme();
    document.documentElement.classList.toggle("dark", actualTheme === "dark");
  }, [mode, getActualTheme]);

  const theme = useMemo(() => {
    const actualTheme = getActualTheme();
    const isDark = actualTheme === "dark";

    return createTheme({
      palette: {
        mode: actualTheme,
        primary: {
          main: "#6366f1",
          light: "#818cf8",
          dark: "#4f46e5",
          contrastText: "#ffffff",
        },
        secondary: {
          main: "#ec4899",
          light: "#f472b6",
          dark: "#db2777",
          contrastText: "#ffffff",
        },
        success: {
          main: "#10b981",
          light: "#34d399",
          dark: "#059669",
        },
        warning: {
          main: "#f59e0b",
          light: "#fbbf24",
          dark: "#d97706",
        },
        error: {
          main: "#ef4444",
          light: "#f87171",
          dark: "#dc2626",
        },
        info: {
          main: "#3b82f6",
          light: "#60a5fa",
          dark: "#2563eb",
        },
        background: {
          default: isDark ? "#0f172a" : "#f8fafc",
          paper: isDark ? "#1e293b" : "#ffffff",
        },
        text: {
          primary: isDark ? "#f1f5f9" : "#1e293b",
          secondary: isDark ? "#94a3b8" : "#64748b",
        },
        divider: isDark ? "#334155" : "#e2e8f0",
      },
      typography: {
        fontFamily: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ].join(","),
        h1: {
          fontWeight: 700,
          fontSize: "2.5rem",
        },
        h2: {
          fontWeight: 700,
          fontSize: "2rem",
        },
        h3: {
          fontWeight: 600,
          fontSize: "1.5rem",
        },
        h4: {
          fontWeight: 600,
          fontSize: "1.25rem",
        },
        h5: {
          fontWeight: 600,
          fontSize: "1rem",
        },
        h6: {
          fontWeight: 600,
          fontSize: "0.875rem",
        },
        button: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
      shape: {
        borderRadius: 12,
      },
      shadows: isDark
        ? [
            "none",
            "0 1px 2px 0 rgb(0 0 0 / 0.3)",
            "0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)",
            "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)",
            "0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)",
            "0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)",
            ...Array(19).fill("none"),
          ]
        : undefined,
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              padding: "8px 20px",
              fontSize: "0.875rem",
            },
            contained: {
              boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
              "&:hover": {
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              boxShadow: isDark
                ? "0 1px 3px 0 rgb(0 0 0 / 0.3)"
                : "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
              border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: "none",
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              "& .MuiOutlinedInput-root": {
                borderRadius: 8,
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 8,
            },
          },
        },
        MuiAvatar: {
          styleOverrides: {
            root: {
              borderRadius: 8,
            },
          },
        },
        MuiDataGrid: {
          styleOverrides: {
            root: {
              border: "none",
              borderRadius: 12,
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
                borderRadius: "12px 12px 0 0",
              },
              "& .MuiDataGrid-cell": {
                borderColor: isDark ? "#334155" : "#e2e8f0",
              },
            },
          },
        },
      },
    });
  }, [mode, getActualTheme]);

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
};

export default ThemeProvider;
