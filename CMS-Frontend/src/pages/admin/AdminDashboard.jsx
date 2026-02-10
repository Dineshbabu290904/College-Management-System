import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Home, Users, BookOpen, Calendar, FileText, DollarSign,
  Bell, Settings, LogOut, Menu, User, GitBranch, Database,
  BarChart2, Download, Plus, ChevronRight
} from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { dashboardAPI } from '@/services/api'
import { cn } from '@/utils/cn'

const SIDEBAR_WIDTH = 280

// Sidebar navigation items for admin
const navItems = [
  { path: '', label: 'Dashboard', icon: Home },
  { path: 'students', label: 'Students', icon: Users },
  { path: 'faculty', label: 'Faculty', icon: BookOpen },
  { path: 'branches', label: 'Branches', icon: GitBranch },
  { path: 'subjects', label: 'Subjects', icon: Database },
  { path: 'fees', label: 'Fee Management', icon: DollarSign },
  { path: 'exams', label: 'Exams', icon: Calendar },
  { path: 'notices', label: 'Notices', icon: FileText },
  { path: 'reports', label: 'Reports', icon: BarChart2 },
  { path: 'settings', label: 'Settings', icon: Settings },
]

// Loading skeleton
function Skeleton({ className }) {
  return (
    <div className={cn('animate-pulse bg-slate-200 rounded', className)} />
  )
}

// Stat Card Component
function StatCard({ title, value, subtitle, icon: Icon, gradient }) {
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
      </div>
    </motion.div>
  )
}

// Main Dashboard Content
function DashboardHome() {
  const { user } = useAuthStore()

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const response = await dashboardAPI.getAdminDashboard()
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

  const userCounts = dashboardData?.userCounts || {}
  const systemStats = dashboardData?.systemStats || {}

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Overview of your institution's management system.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Students"
          value={userCounts.student || 0}
          subtitle="Total Students"
          icon={Users}
          gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
        />
        <StatCard
          title="Faculty"
          value={userCounts.faculty || 0}
          subtitle="Total Faculty"
          icon={BookOpen}
          gradient="bg-gradient-to-br from-emerald-500 to-green-600"
        />
        <StatCard
          title="Branches"
          value={systemStats.totalBranches || 0}
          subtitle="Departments"
          icon={GitBranch}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
        />
        <StatCard
          title="Subjects"
          value={systemStats.totalSubjects || 0}
          subtitle="Total Subjects"
          icon={Database}
          gradient="bg-gradient-to-br from-red-500 to-pink-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Attendance Overview (Last 7 Days)
          </h3>
          <div className="space-y-4">
            {(dashboardData?.attendanceOverview || []).map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 text-sm text-slate-600">{day._id}</div>
                <div className="flex-1 flex gap-2">
                  <div
                    className="h-6 bg-emerald-500 rounded"
                    style={{ width: `${(day.present / (day.present + day.absent)) * 100}%` }}
                    title={`Present: ${day.present}`}
                  />
                  <div
                    className="h-6 bg-red-500 rounded"
                    style={{ width: `${(day.absent / (day.present + day.absent)) * 100}%` }}
                    title={`Absent: ${day.absent}`}
                  />
                </div>
                <div className="w-20 text-sm text-right">
                  <span className="text-emerald-600">{day.present}</span>
                  <span className="text-slate-400"> / </span>
                  <span className="text-red-600">{day.absent}</span>
                </div>
              </div>
            ))}
            {(!dashboardData?.attendanceOverview || dashboardData.attendanceOverview.length === 0) && (
              <div className="text-center py-8 text-slate-500">
                No attendance data available
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded" />
              <span className="text-slate-600">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="text-slate-600">Absent</span>
            </div>
          </div>
        </div>

        {/* Branch Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Students by Branch
          </h3>
          <div className="space-y-4">
            {(dashboardData?.branchDistribution || []).map((branch, index) => {
              const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 'bg-purple-500']
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700">{branch.branch}</span>
                    <span className="font-medium text-slate-900">{branch.count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', colors[index % colors.length])}
                      style={{ width: `${(branch.count / (dashboardData?.userCounts?.student || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {(!dashboardData?.branchDistribution || dashboardData.branchDistribution.length === 0) && (
              <div className="text-center py-8 text-slate-500">
                No branch data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Registrations and Semester Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Recent Registrations
            </h3>
            <button className="text-sm text-red-600 hover:text-red-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {(dashboardData?.recentRegistrations || []).slice(0, 5).map((user, index) => {
              const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 'bg-purple-500']
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold',
                    colors[index % colors.length]
                  )}>
                    {user.firstName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-slate-500 truncate">{user.email}</p>
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    user.role === 'student'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-emerald-100 text-emerald-700'
                  )}>
                    {user.role}
                  </span>
                </div>
              )
            })}
            {(!dashboardData?.recentRegistrations || dashboardData.recentRegistrations.length === 0) && (
              <div className="text-center py-8 text-slate-500">
                No recent registrations
              </div>
            )}
          </div>
        </div>

        {/* Semester Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Students by Semester
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {(dashboardData?.semesterDistribution || []).map((sem, index) => (
              <div
                key={index}
                className="p-4 bg-slate-50 rounded-lg text-center hover:bg-slate-100 transition-colors"
              >
                <p className="text-2xl font-bold text-indigo-600">{sem.count}</p>
                <p className="text-sm text-slate-600 mt-1">Sem {sem._id}</p>
              </div>
            ))}
            {(!dashboardData?.semesterDistribution || dashboardData.semesterDistribution.length === 0) && (
              <div className="col-span-4 text-center py-8 text-slate-500">
                No semester data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Coming Soon placeholder
function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
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
            <h1 className="text-xl font-bold text-red-600">College CMS</h1>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
              Admin
            </span>
          </div>

          {/* User Profile */}
          <div className="p-4 flex items-center gap-3 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-semibold">
              {user?.firstName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-slate-500 truncate">{user?.role}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === `/admin${item.path ? '/' + item.path : ''}`
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
                          ? 'bg-red-500 text-white'
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
export default function AdminDashboard() {
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
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-semibold">
                {user?.firstName?.[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Routes>
            <Route path="" element={<DashboardHome />} />
            <Route path="students" element={<ComingSoon title="Students Management" />} />
            <Route path="faculty" element={<ComingSoon title="Faculty Management" />} />
            <Route path="branches" element={<ComingSoon title="Branch Management" />} />
            <Route path="subjects" element={<ComingSoon title="Subject Management" />} />
            <Route path="fees" element={<ComingSoon title="Fee Management" />} />
            <Route path="exams" element={<ComingSoon title="Exam Management" />} />
            <Route path="notices" element={<ComingSoon title="Notice Management" />} />
            <Route path="reports" element={<ComingSoon title="Reports" />} />
            <Route path="settings" element={<ComingSoon title="Settings" />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
