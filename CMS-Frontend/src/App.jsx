import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Auth pages
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'

// Dashboard
import Dashboard from '@/pages/dashboard/Dashboard'

// Layout
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProtectedRoute from '@/components/ProtectedRoute'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<ComingSoon title="Courses" />} />
            <Route path="/students" element={<ComingSoon title="Students" />} />
            <Route path="/faculty" element={<ComingSoon title="Faculty" />} />
            <Route path="/attendance" element={<ComingSoon title="Attendance" />} />
            <Route path="/exams" element={<ComingSoon title="Exams" />} />
            <Route path="/library" element={<ComingSoon title="Library" />} />
            <Route path="/fees" element={<ComingSoon title="Fees" />} />
            <Route path="/leave" element={<ComingSoon title="Leave" />} />
            <Route path="/users" element={<ComingSoon title="Users" />} />
            <Route path="/settings" element={<ComingSoon title="Settings" />} />
          </Route>

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              borderRadius: '10px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#f8fafc',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f8fafc',
              },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// Placeholder component for pages not yet implemented
function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
        <span className="text-3xl">🚧</span>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-slate-500">This page is coming soon.</p>
    </div>
  )
}

export default App
