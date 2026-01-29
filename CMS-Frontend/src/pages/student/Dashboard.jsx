import React, { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  IconButton,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Skeleton,
} from "@mui/material";
import {
  FiHome,
  FiBook,
  FiCalendar,
  FiFileText,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiBell,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiSun,
  FiMoon,
  FiUser,
  FiBookOpen,
  FiAward,
} from "react-icons/fi";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import useAuthStore from "../../store/authStore";
import useThemeStore from "../../store/themeStore";
import { dashboardAPI } from "../../services/api";

const DRAWER_WIDTH = 280;
const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#6366f1"];

// Sidebar navigation items
const navItems = [
  { path: "", label: "Dashboard", icon: <FiHome /> },
  { path: "attendance", label: "Attendance", icon: <FiCalendar /> },
  { path: "assignments", label: "Assignments", icon: <FiFileText /> },
  { path: "courses", label: "Courses", icon: <FiBook /> },
  { path: "results", label: "Results", icon: <FiAward /> },
  { path: "fees", label: "Fees", icon: <FiDollarSign /> },
  { path: "materials", label: "Study Materials", icon: <FiBookOpen /> },
  { path: "profile", label: "Profile", icon: <FiUser /> },
];

// Main Dashboard Content Component
const DashboardHome = () => {
  const { user } = useAuthStore();
  const theme = useTheme();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["studentDashboard"],
    queryFn: async () => {
      const response = await dashboardAPI.getStudentDashboard();
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Skeleton variant="rounded" height={140} />
          </Grid>
        ))}
        <Grid item xs={12} md={8}>
          <Skeleton variant="rounded" height={300} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Skeleton variant="rounded" height={300} />
        </Grid>
      </Grid>
    );
  }

  const quickStats = dashboardData?.quickStats || {};
  const attendance = dashboardData?.attendance || { overall: { percentage: 0 } };

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your academics today.
        </Typography>
      </Box>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="white">
                      {attendance.overall?.percentage || 0}%
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Overall Attendance
                    </Typography>
                  </Box>
                  <FiCalendar size={32} color="rgba(255,255,255,0.5)" />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(attendance.overall?.percentage) || 0}
                  sx={{
                    mt: 2,
                    bgcolor: "rgba(255,255,255,0.2)",
                    "& .MuiLinearProgress-bar": { bgcolor: "white" },
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card sx={{ background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="white">
                      {quickStats.pendingAssignmentsCount || 0}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Pending Assignments
                    </Typography>
                  </Box>
                  <FiFileText size={32} color="rgba(255,255,255,0.5)" />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card sx={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="white">
                      {dashboardData?.cgpa || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Current CGPA
                    </Typography>
                  </Box>
                  <FiAward size={32} color="rgba(255,255,255,0.5)" />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card sx={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="white">
                      {quickStats.totalSubjects || 0}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Active Subjects
                    </Typography>
                  </Box>
                  <FiBook size={32} color="rgba(255,255,255,0.5)" />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Charts and Lists */}
      <Grid container spacing={3}>
        {/* Attendance by Subject */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Subject-wise Attendance
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendance.subjects || []}>
                    <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Assignments */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Upcoming Deadlines
              </Typography>
              <List>
                {(dashboardData?.pendingAssignments || []).slice(0, 4).map((assignment, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton sx={{ borderRadius: 2, bgcolor: "action.hover" }}>
                      <ListItemIcon>
                        <FiClock color={theme.palette.warning.main} />
                      </ListItemIcon>
                      <ListItemText
                        primary={assignment.title}
                        secondary={`Due: ${new Date(assignment.dueDate).toLocaleDateString()}`}
                        primaryTypographyProps={{ fontWeight: 500, fontSize: 14 }}
                        secondaryTypographyProps={{ fontSize: 12 }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
                {(!dashboardData?.pendingAssignments || dashboardData.pendingAssignments.length === 0) && (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <FiCheckCircle size={40} color={theme.palette.success.main} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      No pending assignments!
                    </Typography>
                  </Box>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Notices */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Notices
              </Typography>
              <Grid container spacing={2}>
                {(dashboardData?.recentNotices || []).map((notice, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <Box>
                            <Chip
                              label={notice.type}
                              size="small"
                              color={notice.priority === "urgent" ? "error" : "primary"}
                              sx={{ mb: 1 }}
                            />
                            <Typography variant="subtitle1" fontWeight="bold">
                              {notice.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {notice.description}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Main Dashboard Layout
const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, logout } = useAuthStore();
  const { toggleTheme, getActualTheme } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const isDark = getActualTheme() === "dark";

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo */}
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          College CMS
        </Typography>
        <Chip label="Student" size="small" color="primary" sx={{ mt: 1 }} />
      </Box>

      <Divider />

      {/* User Profile */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar
          src={user?.profileImage?.url}
          sx={{ width: 48, height: 48, bgcolor: "primary.main" }}
        >
          {user?.firstName?.[0]}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.enrollmentNo}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ flex: 1, px: 2, py: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === `/student${item.path ? "/" + item.path : ""}`;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? "primary.main" : "transparent",
                  color: isActive ? "white" : "text.primary",
                  "&:hover": {
                    bgcolor: isActive ? "primary.dark" : "action.hover",
                  },
                }}
              >
                <ListItemIcon
                  sx={{ color: isActive ? "white" : "text.secondary", minWidth: 40 }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Bottom Actions */}
      <Box sx={{ p: 2 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: "error.main" }}>
          <ListItemIcon sx={{ color: "error.main", minWidth: 40 }}>
            <FiLogOut />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* App Bar (Mobile) */}
      <AppBar
        position="fixed"
        sx={{
          display: { md: "none" },
          bgcolor: "background.paper",
          color: "text.primary",
        }}
        elevation={1}
      >
        <Toolbar>
          <IconButton edge="start" onClick={handleDrawerToggle}>
            <FiMenu />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1 }}>
            College CMS
          </Typography>
          <IconButton onClick={toggleTheme}>
            {isDark ? <FiSun /> : <FiMoon />}
          </IconButton>
          <IconButton>
            <Badge badgeContent={3} color="error">
              <FiBell />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              border: "none",
              boxShadow: 1,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: 8, md: 0 },
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        {/* Desktop Header */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={toggleTheme}>
              {isDark ? <FiSun /> : <FiMoon />}
            </IconButton>
            <IconButton>
              <Badge badgeContent={3} color="error">
                <FiBell />
              </Badge>
            </IconButton>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar src={user?.profileImage?.url} sx={{ width: 36, height: 36 }}>
                {user?.firstName?.[0]}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => navigate("profile")}>
                <FiUser style={{ marginRight: 8 }} /> Profile
              </MenuItem>
              <MenuItem onClick={() => navigate("settings")}>
                <FiSettings style={{ marginRight: 8 }} /> Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                <FiLogOut style={{ marginRight: 8 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Page Content */}
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
      </Box>
    </Box>
  );
};

// Coming Soon placeholder
const ComingSoon = ({ title }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "60vh",
    }}
  >
    <Typography variant="h4" fontWeight="bold" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body1" color="text.secondary">
      This feature is coming soon!
    </Typography>
  </Box>
);

export default StudentDashboard;
