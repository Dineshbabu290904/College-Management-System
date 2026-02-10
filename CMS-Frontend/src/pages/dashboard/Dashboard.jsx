import { motion } from 'framer-motion'
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import useAuthStore from '@/store/authStore'

const stats = [
  {
    title: 'Total Students',
    value: '2,847',
    change: '+12%',
    trend: 'up',
    icon: GraduationCap,
    color: 'bg-blue-500',
  },
  {
    title: 'Total Faculty',
    value: '156',
    change: '+3%',
    trend: 'up',
    icon: Users,
    color: 'bg-purple-500',
  },
  {
    title: 'Active Courses',
    value: '48',
    change: '+5%',
    trend: 'up',
    icon: BookOpen,
    color: 'bg-green-500',
  },
  {
    title: 'Attendance Rate',
    value: '94.5%',
    change: '-1.2%',
    trend: 'down',
    icon: TrendingUp,
    color: 'bg-orange-500',
  },
]

const upcomingEvents = [
  { title: 'Faculty Meeting', time: '10:00 AM', date: 'Today' },
  { title: 'Mid-term Exams', time: '9:00 AM', date: 'Feb 15' },
  { title: 'Sports Day', time: '8:00 AM', date: 'Feb 20' },
]

const recentActivities = [
  { action: 'New student registered', time: '2 hours ago', type: 'student' },
  { action: 'Exam results published', time: '5 hours ago', type: 'exam' },
  { action: 'Library book returned', time: '1 day ago', type: 'library' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function Dashboard() {
  const { user } = useAuthStore()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Message */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.firstName || 'User'}!
        </h1>
        <p className="text-slate-500 mt-1">
          Here's what's happening in your college today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === 'up' ? (
                        <ArrowUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {stat.change}
                      </span>
                      <span className="text-slate-400 text-sm">vs last month</span>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {upcomingEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{event.title}</p>
                      <p className="text-sm text-slate-500">
                        {event.date} at {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">
                      {activity.action}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
