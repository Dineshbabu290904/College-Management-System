import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FiLogIn, FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { baseApiURL } from "../baseUrl";
import bcrypt from "bcryptjs"; // Import bcryptjs for client-side hashing

const Login = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("Student");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (data) => {
    if (data.loginid && data.password) {
      setIsLoading(true);
      try {
        // Hash the password client-side before sending
        // Note: In production, hashing should ideally happen server-side
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);
        
        // Send the login request with hashed password
        const response = await axios.post(
          `${baseApiURL()}/${selected.toLowerCase()}/auth/login`, 
          { 
            loginid: data.loginid, 
            password: data.password, // Send original password for server verification
            passwordHash: hashedPassword // Also send hashed version
          }, 
          { headers: { "Content-Type": "application/json" } }
        );
        
        toast.success("Login successful!");
        navigate(`/${selected.toLowerCase()}`, {
          state: { type: selected, loginid: response.data.loginid },
        });
      } catch (error) {
        console.error("Login error:", error);
        toast.error(error.response?.data?.message || "Login failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <Toaster />
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            College Management System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {selected && selected} Login
          </p>
        </div>
        
        <div className="bg-white py-6 px-4 shadow-lg sm:rounded-lg sm:px-8">
          <div className="flex justify-center space-x-4 mb-6">
            {["Student", "Faculty", "Admin"].map((type) => (
              <button
                key={type}
                type="button"
                className={`px-4 py-2 rounded-md transition-all ${
                  selected === type
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setSelected(type)}
                disabled={isLoading}
              >
                {type}
              </button>
            ))}
          </div>
          
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="loginid" className="block text-sm font-medium text-gray-700">
                {selected && selected} Login ID
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  id="loginid"
                  type="text"
                  className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.loginid ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Login ID"
                  disabled={isLoading}
                  {...register("loginid", {
                    required: "Login ID is required"
                  })}
                />
              </div>
              {errors.loginid && <p className="mt-1 text-sm text-red-600">{errors.loginid.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Password"
                  disabled={isLoading}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" }
                  })}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    Login
                    <FiLogIn className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;