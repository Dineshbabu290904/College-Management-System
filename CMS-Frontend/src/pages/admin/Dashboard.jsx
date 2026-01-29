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
  Button,
  Paper,
} from "@mui/material";
import {
  FiHome,
  FiUsers,
  FiBook,
  FiCalendar,
  FiDollarSign,
  FiSettings,
  FiBell,
  FiLogOut,
  FiMenu,
  FiSun,
  FiMoon,
  FiUser,
  FiDatabase,
  FiBarChart2,
  FiFileText,
  FiGitBranch,
  FiPlus,
  FiDownload,
  FiUpload,
} from "react-icons/fi";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import useAuthStore from "../../store/authStore";
import useThemeStore from "../../store/themeStore";
import { dashboardAPI } from "../../services/api";

const DRAWER_WIDTH = 280;
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// Sidebar navigation items
const navItems = [
  { path: "", label: "Dashboard", icon: <FiHome /> },
  { path: "students", label: "Students", icon: <FiUsers /> },
  { path: "faculty", label: "Faculty", icon: <FiBook /> },
  { path: "branches", label: "Branches", icon: <FiGitBranch /> },
  { path: "subjects", label: "Subjects", icon: <FiDatabase /> },
  { path: "fees", label: "Fee Management", icon: <FiDollarSign /> },
  { path: "exams", label: "Exams", icon: <FiCalendar /> },
  { path: "notices", label: "Notices", icon: <FiFileText /> },
  { path: "reports", label: "Reports", icon: <FiBarChart2 /> },
  { path: "settings", label: "Settings", icon: <FiSettings /> },
];

// Main Dashboard Content Component
const DashboardHome = () => {
  const { user } = useAuthStore();
  const theme = useTheme();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const response = await dashboardAPI.getAdminDashboard();
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
          <Skeleton variant="rounded" height={350} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Skeleton variant="rounded" height={350} />
        </Grid>
      </Grid>
    );
  }

  const userCounts = dashboardData?.userCounts || {};
  const systemStats = dashboardData?.systemStats || {};

  return (
    <Box>
      {/* Header with Actions */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Overview of your institution's management system.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<FiDownload />}>
            Export Report
          </Button>
          <Button variant="contained" startIcon={<FiPlus />}>
            Add New
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="white">
                      {userCounts.student || 0}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Total Students
                    </Typography>
                  </Box>
                  <FiUsers size={40} color="rgba(255,255,255,0.3)" />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card sx={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="white">
                      {userCounts.faculty || 0}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Total Faculty
                    </Typography>
                  </Box>
                  <FiBook size={40} color="rgba(255,255,255,0.3)" />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card sx={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="white">
                      {systemStats.totalBranches || 0}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Branches
                    </Typography>
                  </Box>
                  <FiGitBranch size={40} color="rgba(255,255,255,0.3)" />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card sx={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="white">
                      {systemStats.totalSubjects || 0}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Subjects
                    </Typography>
                  </Box>
                  <FiDatabase size={40} color="rgba(255,255,255,0.3)" />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Attendance Overview */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Attendance Overview (Last 7 Days)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData?.attendanceOverview || []}>
                    <defs>
                      <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="present" stroke="#10b981" fillOpacity={1} fill="url(#colorPresent)" />
                    <Area type="monotone" dataKey="absent" stroke="#ef4444" fillOpacity={1} fill="url(#colorAbsent)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Branch Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Students by Branch
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData?.branchDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="branch"
                      label={({ branch, percent }) => `${branch} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {(dashboardData?.branchDistribution || []).map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Registrations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Registrations
                </Typography>
                <Button size="small">View All</Button>
              </Box>
              <List>
                {(dashboardData?.recentRegistrations || []).slice(0, 5).map((user, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton sx={{ borderRadius: 2 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: COLORS[index % COLORS.length], width: 36, height: 36 }}>
                          {user.firstName?.[0]}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={`${user.firstName} ${user.lastName}`}
                        secondary={user.email}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <Chip
                        label={user.role}
                        size="small"
                        color={user.role === "student" ? "primary" : "secondary"}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Semester Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Students by Semester
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData?.semesterDistribution || []}>
                    <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Main Dashboard Layout
const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, logout } = useAuthStore();
  const { toggleTheme, getActualTheme } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const isDark = getActualTheme() === "dark";

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" color="error.main">
          College CMS
        </Typography>
        <Chip label="Admin" size="small" color="error" sx={{ mt: 1 }} />
      </Box>
      <Divider />
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar src={user?.profileImage?.url} sx={{ width: 48, height: 48, bgcolor: "error.main" }}>
          {user?.firstName?.[0]}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">{user?.firstName} {user?.lastName}</Typography>
          <Typography variant="caption" color="text.secondary">{user?.role}</Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ flex: 1, px: 2, py: 1, overflowY: "auto" }}>
        {navItems.map((item) => {
          const isActive = location.pathname === `/admin${item.path ? "/" + item.path : ""}`;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? "error.main" : "transparent",
                  color: isActive ? "white" : "text.primary",
                  "&:hover": { bgcolor: isActive ? "error.dark" : "action.hover" },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? "white" : "text.secondary", minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: "error.main" }}>
          <ListItemIcon sx={{ color: "error.main", minWidth: 40 }}><FiLogOut /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" sx={{ display: { md: "none" }, bgcolor: "background.paper", color: "text.primary" }} elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={handleDrawerToggle}><FiMenu /></IconButton>
          <Typography variant="h6" sx={{ flex: 1 }}>Admin Panel</Typography>
          <IconButton onClick={toggleTheme}>{isDark ? <FiSun /> : <FiMoon />}</IconButton>
          <IconButton><Badge badgeContent={5} color="error"><FiBell /></Badge></IconButton>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}>{drawer}</Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: "none", md: "block" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, border: "none", boxShadow: 1 } }} open>{drawer}</Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, mt: { xs: 8, md: 0 }, minHeight: "100vh", bgcolor: "background.default" }}>
        <Box sx={{ display: { xs: "none", md: "flex" }, justifyContent: "flex-end", alignItems: "center", mb: 4, gap: 2 }}>
          <IconButton onClick={toggleTheme}>{isDark ? <FiSun /> : <FiMoon />}</IconButton>
          <IconButton><Badge badgeContent={5} color="error"><FiBell /></Badge></IconButton>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar src={user?.profileImage?.url} sx={{ width: 36, height: 36 }}>{user?.firstName?.[0]}</Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => navigate("profile")}><FiUser style={{ marginRight: 8 }} /> Profile</MenuItem>
            <MenuItem onClick={() => navigate("settings")}><FiSettings style={{ marginRight: 8 }} /> Settings</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}><FiLogOut style={{ marginRight: 8 }} /> Logout</MenuItem>
          </Menu>
        </Box>

        <Routes>
          <Route path="" element={<DashboardHome />} />
          <Route path="*" element={<ComingSoon />} />
        </Routes>
      </Box>
    </Box>
  );
};

const ComingSoon = () => (
  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <Typography variant="h4" fontWeight="bold">Coming Soon</Typography>
    <Typography variant="body1" color="text.secondary">This feature is under development.</Typography>
  </Box>
);

export default AdminDashboard;
