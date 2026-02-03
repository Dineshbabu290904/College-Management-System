import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import useThemeStore from "../store/themeStore";

// Icons
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const LoaderIcon = () => (
  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="6"></line>
    <line x1="12" y1="18" x2="12" y2="22"></line>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
    <line x1="2" y1="12" x2="6" y2="12"></line>
    <line x1="18" y1="12" x2="22" y2="12"></line>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
  </svg>
);

// Floating shapes component
const FloatingShapes = ({ isDark }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className={`absolute w-72 h-72 rounded-full ${isDark ? 'bg-indigo-500/10' : 'bg-white/20'} blur-3xl`}
      animate={{
        x: [0, 100, 0],
        y: [0, -50, 0],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      style={{ top: '10%', left: '10%' }}
    />
    <motion.div
      className={`absolute w-96 h-96 rounded-full ${isDark ? 'bg-purple-500/10' : 'bg-white/10'} blur-3xl`}
      animate={{
        x: [0, -80, 0],
        y: [0, 80, 0],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      style={{ bottom: '10%', right: '10%' }}
    />
    <motion.div
      className={`absolute w-64 h-64 rounded-full ${isDark ? 'bg-blue-500/10' : 'bg-white/15'} blur-3xl`}
      animate={{
        x: [0, 60, 0],
        y: [0, 60, 0],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      style={{ top: '50%', left: '50%' }}
    />
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { mode, toggleTheme, getActualTheme } = useThemeStore();
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const emailValue = watch("email");
  const passwordValue = watch("password");

  const isDark = getActualTheme() === "dark";

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const onSubmit = async (data) => {
    clearError();
    const result = await login(data.email, data.password);

    if (result.success) {
      toast.success(`Welcome back!`, {
        icon: '👋',
        style: {
          borderRadius: '12px',
          background: isDark ? '#1f2937' : '#fff',
          color: isDark ? '#f9fafb' : '#111827',
        },
      });

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
      toast.error(result.error || "Login failed", {
        style: {
          borderRadius: '12px',
          background: isDark ? '#1f2937' : '#fff',
          color: isDark ? '#f9fafb' : '#111827',
        },
      });
    }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Left Panel - Branding */}
      <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${
        isDark
          ? 'bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950'
          : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500'
      }`}>
        <FloatingShapes isDark={isDark} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-white/20'} backdrop-blur-sm flex items-center justify-center`}>
                <span className="text-2xl font-bold text-white">C</span>
              </div>
              <span className="text-xl font-semibold text-white">CampusFlow</span>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <h1 className="text-5xl font-bold text-white leading-tight">
              Your Campus,<br />
              <span className={`${isDark ? 'text-indigo-300' : 'text-white/90'}`}>Simplified.</span>
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-white/80'} max-w-md`}>
              A modern college management system designed for students, faculty, and administrators.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 pt-4">
              {['Attendance', 'Assignments', 'Results', 'Library'].map((feature, i) => (
                <motion.span
                  key={feature}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    isDark
                      ? 'bg-white/5 text-white/80 border border-white/10'
                      : 'bg-white/20 text-white backdrop-blur-sm'
                  }`}
                >
                  {feature}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Bottom Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className={`flex gap-12 pt-8 border-t ${isDark ? 'border-white/10' : 'border-white/20'}`}
          >
            {[
              { value: '10K+', label: 'Students' },
              { value: '500+', label: 'Faculty' },
              { value: '50+', label: 'Courses' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-white/70'}`}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className={`w-full lg:w-1/2 flex flex-col ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        {/* Top Bar */}
        <div className="flex justify-between items-center p-6">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'} flex items-center justify-center`}>
              <span className={`text-lg font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>C</span>
            </div>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>CampusFlow</span>
          </div>
          <div className="hidden lg:block" />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-xl transition-all duration-300 ${
              isDark
                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
            }`}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-8"
          >
            {/* Header */}
            <div className="text-center lg:text-left">
              <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Welcome back
              </h2>
              <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Sign in to continue to your dashboard
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className={`p-4 rounded-xl ${
                    isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-100'
                  }`}
                >
                  <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3.5 rounded-xl transition-all duration-300 outline-none ${
                      isDark
                        ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-500'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    } border-2 ${
                      errors.email
                        ? 'border-red-500 focus:border-red-500'
                        : focusedField === 'email'
                        ? isDark ? 'border-indigo-500' : 'border-indigo-500'
                        : ''
                    }`}
                    placeholder="you@example.com"
                  />
                  <AnimatePresence>
                    {emailValue && !errors.email && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-500"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3.5 pr-12 rounded-xl transition-all duration-300 outline-none ${
                      isDark
                        ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-500'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    } border-2 ${
                      errors.password
                        ? 'border-red-500 focus:border-red-500'
                        : focusedField === 'password'
                        ? isDark ? 'border-indigo-500' : 'border-indigo-500'
                        : ''
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                      isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    } transition-colors`}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-500"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className={`w-4 h-4 rounded border-2 ${
                      isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-white'
                    } text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0`}
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Remember me
                  </span>
                </label>
                <a
                  href="/forgot-password"
                  className={`text-sm font-medium ${
                    isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'
                  } transition-colors`}
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                whileTap={{ scale: isLoading ? 1 : 0.99 }}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                  isLoading
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
                }`}
              >
                {isLoading ? (
                  <>
                    <LoaderIcon />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign in'
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className={`absolute inset-0 flex items-center`}>
                <div className={`w-full border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 ${isDark ? 'bg-gray-950 text-gray-500' : 'bg-gray-50 text-gray-500'}`}>
                  or continue with
                </span>
              </div>
            </div>

            {/* Legacy Login */}
            <a
              href="/"
              className={`w-full py-3.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                isDark
                  ? 'bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Use Legacy Login
            </a>

            {/* Footer */}
            <p className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Need an account?{' '}
              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Contact your administrator
              </span>
            </p>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className={`p-6 text-center text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          CampusFlow v2.0 — Powered by Modern Technology
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
