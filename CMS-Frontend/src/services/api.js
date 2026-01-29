import axios from "axios";

const API_URL = process.env.REACT_APP_APILINK || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/v2/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect to login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/v2/auth/login", credentials),
  register: (userData) => api.post("/v2/auth/register", userData),
  logout: (refreshToken) => api.post("/v2/auth/logout", { refreshToken }),
  refreshToken: (refreshToken) => api.post("/v2/auth/refresh-token", { refreshToken }),
  forgotPassword: (email) => api.post("/v2/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) => api.post("/v2/auth/reset-password", { token, newPassword }),
  getMe: () => api.get("/v2/auth/me"),
  updateProfile: (data) => api.put("/v2/auth/profile", data),
  changePassword: (data) => api.put("/v2/auth/change-password", data),
};

// Dashboard API
export const dashboardAPI = {
  getStudentDashboard: () => api.get("/v2/dashboard/student"),
  getFacultyDashboard: () => api.get("/v2/dashboard/faculty"),
  getAdminDashboard: () => api.get("/v2/dashboard/admin"),
  getAnalytics: (params) => api.get("/v2/dashboard/analytics", { params }),
};

// Attendance API
export const attendanceAPI = {
  markAttendance: (data) => api.post("/v2/attendance/mark", data),
  getClassAttendance: (params) => api.get("/v2/attendance/class", { params }),
  getStudentAttendance: (studentId, params) => api.get(`/v2/attendance/student/${studentId}`, { params }),
  getAttendanceReport: (params) => api.get("/v2/attendance/report", { params }),
  getDefaulters: (params) => api.get("/v2/attendance/defaulters", { params }),
  lockAttendance: (id) => api.put(`/v2/attendance/${id}/lock`),
};

// Assignment API
export const assignmentAPI = {
  getAll: (params) => api.get("/v2/assignments", { params }),
  getById: (id) => api.get(`/v2/assignments/${id}`),
  create: (data) => api.post("/v2/assignments", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  update: (id, data) => api.put(`/v2/assignments/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  delete: (id) => api.delete(`/v2/assignments/${id}`),
  submit: (id, data) => api.post(`/v2/assignments/${id}/submit`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  gradeSubmission: (assignmentId, submissionId, data) =>
    api.put(`/v2/assignments/${assignmentId}/submissions/${submissionId}/grade`, data),
  getStats: (id) => api.get(`/v2/assignments/${id}/stats`),
};

// Legacy API endpoints (backward compatibility)
export const legacyAPI = {
  // Student
  studentLogin: (data) => api.post("/student/auth/login", data),
  getStudents: (data) => api.post("/student/details/getDetails", data),
  addStudent: (data) => api.post("/student/details/addDetails", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  updateStudent: (id, data) => api.put(`/student/details/update/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),

  // Faculty
  facultyLogin: (data) => api.post("/faculty/auth/login", data),
  getFaculty: (data) => api.post("/faculty/details/getDetails", data),
  addFaculty: (data) => api.post("/faculty/details/addDetails", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),

  // Admin
  adminLogin: (data) => api.post("/admin/auth/login", data),
  getAdmins: (data) => api.post("/admin/details/getDetails", data),

  // Other
  getNotices: (data) => api.post("/notice/getNotice", data),
  addNotice: (data) => api.post("/notice/addNotice", data),
  getMaterials: (data) => api.post("/material/getMaterial", data),
  addMaterial: (data) => api.post("/material/addMaterial", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  getSubjects: () => api.get("/subject/getSubject"),
  addSubject: (data) => api.post("/subject/addSubject", data),
  getBranches: () => api.get("/branch/getBranch"),
  addBranch: (data) => api.post("/branch/addBranch", data),
  getTimetables: (data) => api.post("/timetable/getTimetable", data),
  addTimetable: (data) => api.post("/timetable/addTimetable", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  getMarks: (data) => api.post("/marks/getMarks", data),
  addMarks: (data) => api.post("/marks/addMarks", data),
};

export default api;
