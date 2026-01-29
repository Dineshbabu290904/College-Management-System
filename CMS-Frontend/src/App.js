import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { CircularProgress, Box } from "@mui/material";
import ThemeProvider from "./theme/ThemeProvider";
import useAuthStore from "./store/authStore";

// Lazy load pages for better performance
const Login = lazy(() => import("./pages/Login"));
const StudentDashboard = lazy(() => import("./pages/student/Dashboard"));
const FacultyDashboard = lazy(() => import("./pages/faculty/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));

// Legacy screens (for backward compatibility)
const LegacyStudentHome = lazy(() => import("./Screens/Student/Home"));
const LegacyFacultyHome = lazy(() => import("./Screens/Faculty/Home"));
const LegacyAdminHome = lazy(() => import("./Screens/Admin/Home"));
const LegacyLogin = lazy(() => import("./components/Login"));

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Loading component
const LoadingScreen = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    }}
  >
    <CircularProgress sx={{ color: "white" }} size={60} />
  </Box>
);

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route component (redirects to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case "student":
        return <Navigate to="/student" replace />;
      case "faculty":
        return <Navigate to="/faculty" replace />;
      case "admin":
      case "superadmin":
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

const App = () => {
  const { fetchUser, isAuthenticated } = useAuthStore();

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetchUser();
    }
  }, [fetchUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* New Modern Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              <Route
                path="/student/*"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/faculty/*"
                element={
                  <ProtectedRoute allowedRoles={["faculty"]}>
                    <FacultyDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Legacy Routes (backward compatibility) */}
              <Route path="/" element={<LegacyLogin />} />
              <Route path="/legacy/student" element={<LegacyStudentHome />} />
              <Route path="/legacy/faculty" element={<LegacyFacultyHome />} />
              <Route path="/legacy/admin" element={<LegacyAdminHome />} />

              {/* Catch all - redirect to login */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              padding: "16px",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
