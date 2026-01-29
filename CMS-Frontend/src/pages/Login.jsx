import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Divider,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
} from "@mui/material";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUser,
  FiBook,
  FiShield,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import useThemeStore from "../store/themeStore";

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { mode, toggleTheme, getActualTheme } = useThemeStore();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const roles = ["student", "faculty", "admin"];

  const onSubmit = async (data) => {
    clearError();
    const result = await login(data.email, data.password);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.firstName}!`);
      // Navigate to appropriate dashboard
      switch (result.user.role) {
        case "student":
          navigate("/student");
          break;
        case "faculty":
          navigate("/faculty");
          break;
        case "admin":
        case "superadmin":
          navigate("/admin");
          break;
        default:
          navigate("/");
      }
    } else {
      toast.error(result.error);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "student":
        return <FiUser size={20} />;
      case "faculty":
        return <FiBook size={20} />;
      case "admin":
        return <FiShield size={20} />;
      default:
        return <FiUser size={20} />;
    }
  };

  const isDark = getActualTheme() === "dark";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isDark
          ? "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)"
          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: 2,
        position: "relative",
      }}
    >
      {/* Theme toggle */}
      <IconButton
        onClick={toggleTheme}
        sx={{
          position: "absolute",
          top: 20,
          right: 20,
          color: "white",
          bgcolor: "rgba(255,255,255,0.1)",
          "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
        }}
      >
        {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
      </IconButton>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            width: { xs: "100%", sm: 420 },
            maxWidth: "100%",
            borderRadius: 4,
            overflow: "hidden",
          }}
          elevation={24}
        >
          {/* Header */}
          <Box
            sx={{
              background: isDark
                ? "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: 4,
              textAlign: "center",
            }}
          >
            <Typography variant="h4" fontWeight="bold" color="white" gutterBottom>
              College CMS
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.8)">
              Sign in to your account
            </Typography>
          </Box>

          <CardContent sx={{ padding: 4 }}>
            {/* Role Tabs */}
            <Tabs
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              variant="fullWidth"
              sx={{ mb: 3 }}
            >
              {roles.map((role, index) => (
                <Tab
                  key={role}
                  icon={getRoleIcon(role)}
                  label={role.charAt(0).toUpperCase() + role.slice(1)}
                  sx={{ textTransform: "capitalize" }}
                />
              ))}
            </Tabs>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
                    {error}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FiMail />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FiLock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5a67d8 0%, #6b21a8 100%)",
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Sign In"
                )}
              </Button>

              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography
                  variant="body2"
                  component={Link}
                  to="/forgot-password"
                  sx={{
                    color: "primary.main",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Forgot your password?
                </Typography>
              </Box>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            {/* Legacy Login Link */}
            <Button
              fullWidth
              variant="outlined"
              component={Link}
              to="/"
              sx={{ mb: 2 }}
            >
              Use Legacy Login
            </Button>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Don't have an account? Contact your administrator.
            </Typography>
          </CardContent>
        </Card>

        {/* Footer */}
        <Typography
          variant="body2"
          color="rgba(255,255,255,0.7)"
          textAlign="center"
          sx={{ mt: 3 }}
        >
          College Management System v2.0
        </Typography>
      </motion.div>
    </Box>
  );
};

export default Login;
