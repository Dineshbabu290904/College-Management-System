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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  FiHome,
  FiBook,
  FiCalendar,
  FiFileText,
  FiUsers,
  FiCheckSquare,
  FiBell,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiSun,
  FiMoon,
  FiUser,
  FiUpload,
  FiBarChart2,
  FiPlus,
} from "react-icons/fi";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import useAuthStore from "../../store/authStore";
import useThemeStore from "../../store/themeStore";
import { dashboardAPI } from "../../services/api";

const DRAWER_WIDTH = 280;
const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#6366f1"];

// Sidebar navigation items
const navItems = [
  { path: "", label: "Dashboard", icon: <FiHome /> },
  { path: "attendance", label: "Mark Attendance", icon: <FiCalendar /> },
  { path: "assignments", label: "Assignments", icon: <FiFileText /> },
  { path: "students", label: "Students", icon: <FiUsers /> },
  { path: "grades", label: "Grades", icon: <FiCheckSquare /> },
  { path: "materials", label: "Study Materials", icon: <FiUpload /> },
  { path: "reports", label: "Reports", icon: <FiBarChart2 /> },
  { path: "profile", label: "Profile", icon: <FiUser /> },
];

// Main Dashboard Content Component
const DashboardHome = () => {
  const { user } = useAuthStore();
  const theme = useTheme();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["facultyDashboard"],
    queryFn: async () => {
      const response = await dashboardAPI.getFacultyDashboard();
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
      </Grid>
    );
  }

  const quickStats = dashboardData?.quickStats || {};

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome, {user?.firstName}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your classes and students efficiently.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="contained" startIcon={<FiCalendar />}>
            Mark Attendance
          </Button>
          <Button variant="outlined" startIcon={<FiPlus />}>
            New Assignment
          </Button>
        </Box>
      </Box>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              <CardContent>
                <Typography variant="h3" fontWeight="bold" color="white">
                  {quickStats.totalSubjects || 0}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">
                  Subjects Assigned
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card sx={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
              <CardContent>
                <Typography variant="h3" fontWeight="bold" color="white">
                  {quickStats.totalStudents || 0}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">
                  Total Students
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card sx={{ background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)" }}>
              <CardContent>
                <Typography variant="h3" fontWeight="bold" color="white">
                  {quickStats.pendingGradingCount || 0}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">
                  Pending Grading
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card sx={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
              <CardContent>
                <Typography variant="h3" fontWeight="bold" color="white">
                  {quickStats.pendingLeavesCount || 0}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">
                  Leave Requests
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Attendance
              </Typography>
              <Paper variant="outlined" sx={{ overflow: "hidden" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell>Branch</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Present</TableCell>
                      <TableCell>Absent</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(dashboardData?.recentAttendance || []).slice(0, 5).map((att, index) => (
                      <TableRow key={index}>
                        <TableCell>{att.subject?.name || "N/A"}</TableCell>
                        <TableCell>{att.branch?.name || "N/A"}</TableCell>
                        <TableCell>{new Date(att.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip label={att.totalPresent} color="success" size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={att.totalAbsent} color="error" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Assignment Stats
              </Typography>
              <Box sx={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Published", value: dashboardData?.assignmentStats?.published || 0 },
                        { name: "Draft", value: dashboardData?.assignmentStats?.draft || 0 },
                        { name: "Closed", value: dashboardData?.assignmentStats?.closed || 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={index} fill={color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                <Chip label="Published" size="small" sx={{ bgcolor: COLORS[0], color: "white" }} />
                <Chip label="Draft" size="small" sx={{ bgcolor: COLORS[1], color: "white" }} />
                <Chip label="Closed" size="small" sx={{ bgcolor: COLORS[2], color: "white" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Main Dashboard Layout (similar structure as student)
const FacultyDashboard = () => {
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
        <Typography variant="h5" fontWeight="bold" color="primary">College CMS</Typography>
        <Chip label="Faculty" size="small" color="secondary" sx={{ mt: 1 }} />
      </Box>
      <Divider />
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar src={user?.profileImage?.url} sx={{ width: 48, height: 48, bgcolor: "secondary.main" }}>
          {user?.firstName?.[0]}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">{user?.firstName} {user?.lastName}</Typography>
          <Typography variant="caption" color="text.secondary">{user?.employeeId}</Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ flex: 1, px: 2, py: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === `/faculty${item.path ? "/" + item.path : ""}`;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? "secondary.main" : "transparent",
                  color: isActive ? "white" : "text.primary",
                  "&:hover": { bgcolor: isActive ? "secondary.dark" : "action.hover" },
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
          <Typography variant="h6" sx={{ flex: 1 }}>College CMS</Typography>
          <IconButton onClick={toggleTheme}>{isDark ? <FiSun /> : <FiMoon />}</IconButton>
          <IconButton><Badge badgeContent={2} color="error"><FiBell /></Badge></IconButton>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}>{drawer}</Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: "none", md: "block" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, border: "none", boxShadow: 1 } }} open>{drawer}</Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, mt: { xs: 8, md: 0 }, minHeight: "100vh", bgcolor: "background.default" }}>
        <Box sx={{ display: { xs: "none", md: "flex" }, justifyContent: "flex-end", alignItems: "center", mb: 4, gap: 2 }}>
          <IconButton onClick={toggleTheme}>{isDark ? <FiSun /> : <FiMoon />}</IconButton>
          <IconButton><Badge badgeContent={2} color="error"><FiBell /></Badge></IconButton>
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

export default FacultyDashboard;
