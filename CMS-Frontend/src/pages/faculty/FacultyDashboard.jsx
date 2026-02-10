import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Home, Users, BookOpen, Calendar, FileText, Clock,
  Bell, Settings, LogOut, Menu, User, CheckCircle,
  ChevronRight, ClipboardList, GraduationCap
} from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { dashboardAPI } from '@/services/api'
import { cn } from '@/utils/cn'

const SIDEBAR_WIDTH = 280

// Sidebar navigation items for faculty
const navItems = [
  { path: '', label: 'Dashboard', icon: Home },
  { path: 'students', label: 'My Students', icon: Users },
  { path: 'attendance', label: 'Attendance', icon: Calendar },
  { path: 'assignments', label: 'Assignments', icon: FileText },
  { path: 'marks', label: 'Marks Entry', icon: ClipboardList },
  { path: 'materials', label: 'Study Materials', icon: BookOpen },
  { path: 'timetable', label: 'Timetable', icon: Clock },
  { path: 'profile', label: 'Profile', icon: User },
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
    queryKey: ['facultyDashboard'],
    queryFn: async () => {
      const response = await dashboardAPI.getFacultyDashboard()
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  const stats = dashboardData?.stats || {}
  const subjects = dashboardData?.subjects || []
  const pendingTasks = dashboardData?.pendingTasks || []

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, {user?.firstName}!
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your classes and track student progress.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Students"
          value={stats.totalStudents || 0}
          subtitle="Total Students"
          icon={Users}
          gradient="bg-gradient-to-br from-emerald-500 to-green-600"
        />
        <StatCard
          title="Subjects"
          value={stats.totalSubjects || 0}
          subtitle="Assigned Subjects"
          icon={BookOpen}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Classes"
          value={stats.classesToday || 0}
          subtitle="Classes Today"
          icon={Calendar}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
        />
        <StatCard
          title="Pending"
          value={stats.pendingGrading || 0}
          subtitle="Assignments to Grade"
          icon={FileText}
          gradient="bg-gradient-to-br from-purple-500 to-pink-600"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Subjects */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            My Subjects
          </h3>
          <div className="space-y-3">
            {subjects.slice(0, 5).map((subject, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{subject.name}</p>
                  <p className="text-sm text-slate-500">
                    {subject.branch} - Sem {subject.semester}
                  </p>
                </div>
                <span className="text-sm text-slate-500">{subject.students} students</span>
              </div>
            ))}
            {subjects.length === 0 && (
              <div className="text-center py-8">
                <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">No subjects assigned</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Pending Tasks
          </h3>
          <div className="space-y-3">
            {pendingTasks.slice(0, 5).map((task, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  task.type === 'grading' ? 'bg-amber-100' : 'bg-blue-100'
                )}>
                  {task.type === 'grading' ? (
                    <ClipboardList className="w-5 h-5 text-amber-600" />
                  ) : (
                    <Calendar className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{task.title}</p>
                  <p className="text-sm text-slate-500">{task.subject}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <p className="text-slate-500">All tasks completed!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Today's Schedule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(dashboardData?.todaySchedule || []).map((schedule, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                <Clock className="w-4 h-4" />
                <span>{schedule.time}</span>
              </div>
              <h4 className="font-semibold text-slate-900">{schedule.subject}</h4>
              <p className="text-sm text-slate-500 mt-1">
                {schedule.branch} - {schedule.room}
              </p>
            </div>
          ))}
          {(!dashboardData?.todaySchedule || dashboardData.todaySchedule.length === 0) && (
            <div className="col-span-full text-center py-8">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No classes scheduled for today</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Coming Soon placeholder
function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
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
            <h1 className="text-xl font-bold text-emerald-600">College CMS</h1>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
              Faculty
            </span>
          </div>

          {/* User Profile */}
          <div className="p-4 flex items-center gap-3 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold">
              {user?.firstName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-slate-500 truncate">{user?.department || 'Faculty'}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === `/faculty${item.path ? '/' + item.path : ''}`
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
                          ? 'bg-emerald-500 text-white'
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
export default function FacultyDashboard() {
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
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold">
                {user?.firstName?.[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Routes>
            <Route path="" element={<DashboardHome />} />
            <Route path="students" element={<ComingSoon title="My Students" />} />
            <Route path="attendance" element={<ComingSoon title="Attendance" />} />
            <Route path="assignments" element={<ComingSoon title="Assignments" />} />
            <Route path="marks" element={<ComingSoon title="Marks Entry" />} />
            <Route path="materials" element={<ComingSoon title="Study Materials" />} />
            <Route path="timetable" element={<ComingSoon title="Timetable" />} />
            <Route path="profile" element={<ComingSoon title="Profile" />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
