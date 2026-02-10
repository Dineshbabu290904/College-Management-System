import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import useAuthStore from '@/store/authStore'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  Library,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  X,
} from 'lucide-react'

const menuItems = {
  student: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Courses', path: '/courses' },
    { icon: Calendar, label: 'Attendance', path: '/attendance' },
    { icon: ClipboardList, label: 'Exams', path: '/exams' },
    { icon: Library, label: 'Library', path: '/library' },
    { icon: CreditCard, label: 'Fees', path: '/fees' },
  ],
  faculty: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Students', path: '/students' },
    { icon: BookOpen, label: 'Courses', path: '/courses' },
    { icon: Calendar, label: 'Attendance', path: '/attendance' },
    { icon: ClipboardList, label: 'Exams', path: '/exams' },
    { icon: Calendar, label: 'Leave', path: '/leave' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: GraduationCap, label: 'Students', path: '/students' },
    { icon: Users, label: 'Faculty', path: '/faculty' },
    { icon: BookOpen, label: 'Courses', path: '/courses' },
    { icon: Library, label: 'Library', path: '/library' },
    { icon: CreditCard, label: 'Fees', path: '/fees' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ],
  superadmin: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'All Users', path: '/users' },
    { icon: GraduationCap, label: 'Students', path: '/students' },
    { icon: Users, label: 'Faculty', path: '/faculty' },
    { icon: BookOpen, label: 'Courses', path: '/courses' },
    { icon: Library, label: 'Library', path: '/library' },
    { icon: CreditCard, label: 'Fees', path: '/fees' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ],
}

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const role = user?.role || 'student'
  const items = menuItems[role] || menuItems.student

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 260,
          x: isOpen ? 0 : '-100%',
        }}
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-50',
          'flex flex-col bg-white border-r border-slate-200',
          'transition-all duration-300',
          'lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-slate-900">CMS</span>
            </Link>
          )}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 rounded-lg hover:bg-slate-100"
          >
            <ChevronLeft
              className={cn(
                'w-5 h-5 text-slate-500 transition-transform',
                isCollapsed && 'rotate-180'
              )}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                      'text-sm font-medium',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary-600')} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User & Logout */}
        <div className="border-t border-slate-100 p-3">
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg',
              'text-sm font-medium text-slate-600',
              'hover:bg-red-50 hover:text-red-600 transition-all'
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>
    </>
  )
}
