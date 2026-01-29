import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { setUserData } from "../../redux/actions";
import { baseApiURL } from "../../baseUrl";
import toast, { Toaster } from "react-hot-toast";
import { 
  FiUser, FiPhone, FiMail, FiLock, FiEye, FiEyeOff, 
  FiEdit, FiBriefcase, FiHash
} from "react-icons/fi";
import axios from "axios";

const FacultyProfile = () => {
  const [showPass, setShowPass] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const router = useLocation();
  const [data, setData] = useState(null);
  const dispatch = useDispatch();
  const [password, setPassword] = useState({
    new: "",
    current: "",
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      const headers = { "Content-Type": "application/json" };
      
      try {
        const response = await axios.post(
          `${baseApiURL()}/faculty/details/getDetails`,
          { employeeId: router.state.loginid },
          { headers }
        );
        
        setLoading(false);
        
        if (response.data.success) {
          // Some APIs return user[0], others return user directly
          const userData = Array.isArray(response.data.user) 
            ? response.data.user[0] 
            : response.data.user;
          
          setData(userData);
          
          dispatch(
            setUserData({
              fullname: `${userData.firstName} ${userData.middleName || ''} ${userData.lastName}`,
              employeeId: userData.employeeId,
            })
          );
        } else {
          toast.error(response.data.message || "Failed to load profile");
        }
      } catch (error) {
        setLoading(false);
        console.error("Profile data fetch error:", error);
        toast.error("Failed to load profile data");
      }
    };

    if (router.state?.loginid) {
      fetchProfileData();
    }
  }, [dispatch, router.state]);

  const checkPasswordHandler = async (e) => {
    e.preventDefault();
    
    if (!password.current || !password.new) {
      toast.error("Please fill both password fields");
      return;
    }
    
    if (password.new.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    
    setUpdateLoading(true);
    const toastId = toast.loading("Verifying current password");
    
    try {
      const headers = { "Content-Type": "application/json" };
      const response = await axios.post(
        `${baseApiURL()}/faculty/auth/login`,
        { loginid: router.state.loginid, password: password.current },
        { headers }
      );
      
      if (response.data.success) {
        toast.dismiss(toastId);
        const updateToastId = toast.loading("Updating password");
        await changePasswordHandler(response.data.id, updateToastId);
      } else {
        toast.dismiss(toastId);
        setUpdateLoading(false);
        toast.error(response.data.message || "Invalid current password");
      }
    } catch (error) {
      toast.dismiss(toastId);
      setUpdateLoading(false);
      toast.error(error.response?.data?.message || "Invalid current password");
      console.error("Password verification error:", error);
    }
  };

  const changePasswordHandler = async (id, toastId) => {
    try {
      const headers = { "Content-Type": "application/json" };
      const response = await axios.put(
        `${baseApiURL()}/faculty/auth/update/${id}`,
        { loginid: router.state.loginid, password: password.new },
        { headers }
      );
      
      toast.dismiss(toastId);
      setUpdateLoading(false);
      
      if (response.data.success) {
        toast.success(response.data.message || "Password updated successfully");
        setPassword({ new: "", current: "" });
        setShowPass(false);
      } else {
        toast.error(response.data.message || "Failed to update password");
      }
    } catch (error) {
      toast.dismiss(toastId);
      setUpdateLoading(false);
      toast.error(error.response?.data?.message || "Failed to update password");
      console.error("Password update error:", error);
    }
  };

  return (
    <div className="bg-gray-50 p-4 sm:p-6 min-h-screen">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Faculty Profile</h2>
            <p className="text-sm text-gray-600 mt-1">View and manage your faculty account</p>
          </div>
          <div className="hidden sm:block">
            <button
              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all ${
                showPass 
                  ? "bg-red-50 text-red-600 hover:bg-red-100" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              onClick={() => setShowPass(!showPass)}
              disabled={updateLoading}
            >
              <FiLock className="mr-2" />
              {!showPass ? "Change Password" : "Cancel"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          data && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Profile Card */}
              <div className="md:col-span-1">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex flex-col items-center">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
                      <img
                        src={process.env.REACT_APP_MEDIA_LINK + "/" + data.profile}
                        alt="Faculty Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/112?text=Faculty";
                        }}
                      />
                    </div>
                    <h3 className="text-white text-xl font-semibold text-center">
                      {data.firstName} {data.lastName}
                    </h3>
                    <p className="text-blue-100 mt-1 text-center">
                      {data.post || "Faculty"}
                    </p>
                  </div>

                  <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center py-2">
                      <FiHash className="text-blue-500 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500">Employee ID</p>
                        <p className="text-sm font-medium text-gray-800">{data.employeeId}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center py-2">
                      <FiBriefcase className="text-blue-500 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500">Department</p>
                        <p className="text-sm font-medium text-gray-800">{data.department}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center py-2">
                      <FiUser className="text-blue-500 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500">Position</p>
                        <p className="text-sm font-medium text-gray-800">{data.post}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="sm:hidden p-4 border-t border-gray-100">
                    <button
                      className={`w-full flex items-center justify-center px-4 py-2 text-sm rounded-lg transition-all ${
                        showPass 
                          ? "bg-red-50 text-red-600" 
                          : "bg-blue-600 text-white"
                      }`}
                      onClick={() => setShowPass(!showPass)}
                      disabled={updateLoading}
                    >
                      <FiLock className="mr-2" />
                      {!showPass ? "Change Password" : "Cancel"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Details & Password Section */}
              <div className="md:col-span-2">
                <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FiUser className="text-blue-500 mr-2" />
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                        <p className="text-base text-gray-800">
                          {data.firstName} {data.middleName} {data.lastName}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
                        <p className="text-base text-gray-800 flex items-center">
                          <FiPhone className="text-blue-500 mr-2" />
                          +91 {data.phoneNumber}
                        </p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                        <p className="text-base text-gray-800 flex items-center">
                          <FiMail className="text-blue-500 mr-2" />
                          {data.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {showPass && (
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FiEdit className="text-blue-500 mr-2" />
                        Change Your Password
                      </h3>
                      
                      <form onSubmit={checkPasswordHandler} className="space-y-4">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <input
                              id="currentPassword"
                              type={showCurrentPassword ? "text" : "password"}
                              value={password.current}
                              onChange={(e) => setPassword({ ...password, current: e.target.value })}
                              placeholder="Enter your current password"
                              className="block w-full pr-10 py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                              disabled={updateLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <input
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={password.new}
                              onChange={(e) => setPassword({ ...password, new: e.target.value })}
                              placeholder="Enter your new password"
                              className="block w-full pr-10 py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                              disabled={updateLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showNewPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Password must be at least 6 characters long
                          </p>
                        </div>
                        
                        <div className="pt-2">
                          <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={updateLoading}
                          >
                            {updateLoading ? (
                              <>
                                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                                Updating Password...
                              </>
                            ) : (
                              "Update Password"
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
      </div>
  );
};

export default FacultyProfile;