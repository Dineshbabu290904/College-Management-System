import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api/v2'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          })

          const { accessToken, refreshToken: newRefreshToken } = response.data

          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)

          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Dashboard API
export const dashboardAPI = {
  getStudentDashboard: () => api.get('/dashboard/student'),
  getFacultyDashboard: () => api.get('/dashboard/faculty'),
  getAdminDashboard: () => api.get('/dashboard/admin'),
}

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

// Attendance API
export const attendanceAPI = {
  getStudentAttendance: (params) => api.get('/attendance/student', { params }),
  markAttendance: (data) => api.post('/attendance/mark', data),
  getAttendanceReport: (params) => api.get('/attendance/report', { params }),
}

// Assignment API
export const assignmentAPI = {
  getAssignments: (params) => api.get('/assignments', { params }),
  createAssignment: (data) => api.post('/assignments', data),
  submitAssignment: (id, data) => api.post(`/assignments/${id}/submit`, data),
  gradeAssignment: (id, data) => api.put(`/assignments/${id}/grade`, data),
}

export default api
