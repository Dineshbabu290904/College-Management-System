import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Home, BookOpen, Calendar, FileText, DollarSign, Award,
  Clock, Bell, Settings, LogOut, Menu, X, User, CheckCircle,
  ChevronRight, TrendingUp
} from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { dashboardAPI } from '@/services/api'
import { cn } from '@/utils/cn'

const SIDEBAR_WIDTH = 280

// Sidebar navigation items
const navItems = [
  { path: '', label: 'Dashboard', icon: Home },
  { path: 'attendance', label: 'Attendance', icon: Calendar },
  { path: 'assignments', label: 'Assignments', icon: FileText },
  { path: 'courses', label: 'Courses', icon: BookOpen },
  { path: 'results', label: 'Results', icon: Award },
  { path: 'fees', label: 'Fees', icon: DollarSign },
  { path: 'materials', label: 'Study Materials', icon: BookOpen },
  { path: 'profile', label: 'Profile', icon: User },
]

// Loading skeleton
function Skeleton({ className }) {
  return (
    <div className={cn('animate-pulse bg-slate-200 rounded', className)} />
  )
}

// Stat Card Component
function StatCard({ title, value, subtitle, icon: Icon, gradient, progress }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <div className={cn('rounded-xl p-6 text-white', gradient)}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-4xl font-bold">{value}</p>
            <p className="text-white/80 text-sm mt-1">{subtitle}</p>
          </div>
          <Icon className="w-10 h-10 text-white/30" />
        </div>
        {progress !== undefined && (
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Main Dashboard Content
function DashboardHome() {
  const { user } = useAuthStore()

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: async () => {
      const response = await dashboardAPI.getStudentDashboard()
      return response.data.data
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  const quickStats = dashboardData?.quickStats || {}
  const attendance = dashboardData?.attendance || { overall: { percentage: 0 } }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-slate-500 mt-1">
          Here's what's happening with your academics today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance"
          value={`${attendance.overall?.percentage || 0}%`}
          subtitle="Overall Attendance"
          icon={Calendar}
          gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
          progress={parseFloat(attendance.overall?.percentage) || 0}
        />
        <StatCard
          title="Assignments"
          value={quickStats.pendingAssignmentsCount || 0}
          subtitle="Pending Assignments"
          icon={FileText}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
        />
        <StatCard
          title="CGPA"
          value={dashboardData?.cgpa || 'N/A'}
          subtitle="Current CGPA"
          icon={Award}
          gradient="bg-gradient-to-br from-emerald-500 to-green-600"
        />
        <StatCard
          title="Subjects"
          value={quickStats.totalSubjects || 0}
          subtitle="Active Subjects"
          icon={BookOpen}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-wise Attendance */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Subject-wise Attendance
          </h3>
          <div className="space-y-4">
            {(attendance.subjects || []).map((subject, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700">{subject.subject}</span>
                  <span className="font-medium text-slate-900">{subject.percentage}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      subject.percentage >= 75 ? 'bg-emerald-500' :
                      subject.percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                    style={{ width: `${subject.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            {(!attendance.subjects || attendance.subjects.length === 0) && (
              <div className="text-center py-8 text-slate-500">
                No attendance data available
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Upcoming Deadlines
          </h3>
          <div className="space-y-3">
            {(dashboardData?.pendingAssignments || []).slice(0, 4).map((assignment, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{assignment.title}</p>
                  <p className="text-sm text-slate-500">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            ))}
            {(!dashboardData?.pendingAssignments || dashboardData.pendingAssignments.length === 0) && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <p className="text-slate-500">No pending assignments!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Notices */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Recent Notices
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(dashboardData?.recentNotices || []).map((notice, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={cn(
                    'inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-2',
                    notice.priority === 'urgent'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  )}>
                    {notice.type}
                  </span>
                  <h4 className="font-semibold text-slate-900">{notice.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                    {notice.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Coming Soon placeholder
function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
        <span className="text-3xl">🚧</span>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-slate-500">This feature is coming soon!</p>
    </div>
  )
}

// Sidebar Component
function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-50 transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 text-center border-b border-slate-100">
            <h1 className="text-xl font-bold text-indigo-600">College CMS</h1>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
              Student
            </span>
          </div>

          {/* User Profile */}
          <div className="p-4 flex items-center gap-3 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
              {user?.firstName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-slate-500 truncate">{user?.enrollmentNo}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === `/student${item.path ? '/' + item.path : ''}`
                const Icon = item.icon
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => {
                        navigate(item.path)
                        onClose()
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                        isActive
                          ? 'bg-indigo-500 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

// Main Layout
export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:ml-[280px]">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-4 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-slate-100">
                <Bell className="w-6 h-6 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                {user?.firstName?.[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Routes>
            <Route path="" element={<DashboardHome />} />
            <Route path="attendance" element={<ComingSoon title="Attendance" />} />
            <Route path="assignments" element={<ComingSoon title="Assignments" />} />
            <Route path="courses" element={<ComingSoon title="Courses" />} />
            <Route path="results" element={<ComingSoon title="Results" />} />
            <Route path="fees" element={<ComingSoon title="Fees" />} />
            <Route path="materials" element={<ComingSoon title="Study Materials" />} />
            <Route path="profile" element={<ComingSoon title="Profile" />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
