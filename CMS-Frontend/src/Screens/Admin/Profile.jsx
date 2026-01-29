import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { setUserData } from "../../redux/actions";
import { baseApiURL } from "../../baseUrl";
import toast, { Toaster } from "react-hot-toast";
import { FiUser, FiPhone, FiMail, FiLock, FiEye, FiEyeOff, FiEdit } from "react-icons/fi";

const Profile = () => {
  const [showPass, setShowPass] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const router = useLocation();
  const [data, setData] = useState();
  const dispatch = useDispatch();
  const [password, setPassword] = useState({
    new: "",
    current: "",
  });

  useEffect(() => {
    const headers = {
      "Content-Type": "application/json",
    };
    setLoading(true);
    axios
      .post(
        `${baseApiURL()}/${router.state.type}/details/getDetails`,
        { employeeId: router.state.loginid },
        { headers }
      )
      .then((response) => {
        setLoading(false);
        if (response.data.success) {
          setData(response.data.user[0]);
          dispatch(
            setUserData({
              fullname: `${response.data.user[0].firstName} ${response.data.user[0].middleName} ${response.data.user[0].lastName}`,
              semester: response.data.user[0].semester,
              enrollmentNo: response.data.user[0].enrollmentNo,
              branch: response.data.user[0].branch,
            })
          );
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
        toast.error("Failed to load profile data");
      });
  }, [dispatch, router.state.loginid, router.state.type]);

  const checkPasswordHandler = (e) => {
    e.preventDefault();
    if (!password.current || !password.new) {
      toast.error("Please fill both password fields");
      return;
    }
    
    setUpdateLoading(true);
    toast.loading("Verifying current password");
    
    axios
      .post(
        `${baseApiURL()}/admin/auth/login`,
        { loginid: router.state.loginid, password: password.current },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((response) => {
        if (response.data.success) {
          toast.dismiss();
          toast.loading("Updating password");
          changePasswordHandler(response.data.id);
        } else {
          toast.dismiss();
          setUpdateLoading(false);
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        setUpdateLoading(false);
        toast.error(error.response?.data?.message || "Invalid current password");
        console.error(error);
      });
  };

  const changePasswordHandler = (id) => {
    axios
      .put(
        `${baseApiURL()}/admin/auth/update/${id}`,
        { loginid: router.state.loginid, password: password.new },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((response) => {
        toast.dismiss();
        setUpdateLoading(false);
        if (response.data.success) {
          toast.success(response.data.message);
          setPassword({ new: "", current: "" });
          setShowPass(false);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        setUpdateLoading(false);
        toast.error(error.response?.data?.message || "Failed to update password");
        console.error(error);
      });
  };

  return (
    <div className="bg-gray-50 p-4 sm:p-6">
      <Toaster />
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Profile Information</h2>
        <p className="text-sm text-gray-600 mb-6">View and manage your account details</p>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          data && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="sm:flex">
                {/* Profile Image Section - made more compact */}
                <div className="bg-blue-600 p-6 flex flex-col items-center sm:w-1/4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white mb-3">
                    <img
                      src={process.env.REACT_APP_MEDIA_LINK + "/" + data.profile}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-white text-base font-medium text-center">
                    {data.firstName} {data.lastName}
                  </h3>
                  <p className="text-blue-100 text-sm mt-1">ID: {data.employeeId}</p>
                </div>

                {/* Profile Details Section - optimized layout */}
                <div className="p-6 sm:w-3/4">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <FiUser className="text-blue-500 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Full Name</p>
                        <p className="text-sm text-gray-800">
                          {data.firstName} {data.middleName} {data.lastName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FiPhone className="text-blue-500 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Phone Number</p>
                        <p className="text-sm text-gray-800">+91 {data.phoneNumber}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center md:col-span-2">
                      <FiMail className="text-blue-500 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Email Address</p>
                        <p className="text-sm text-gray-800">{data.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    className={`flex items-center px-3 py-1.5 text-sm rounded transition-all ${
                      showPass 
                        ? "bg-red-50 text-red-600 hover:bg-red-100" 
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    onClick={() => setShowPass(!showPass)}
                    disabled={updateLoading}
                  >
                    <FiLock className="mr-1.5" />
                    {!showPass ? "Change Password" : "Cancel"}
                  </button>

                  {showPass && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
                        <FiEdit className="mr-1.5 text-blue-500" />
                        Change Your Password
                      </h3>
                      
                      <form onSubmit={checkPasswordHandler} className="space-y-3">
                        <div>
                          <label htmlFor="currentPassword" className="block text-xs font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              id="currentPassword"
                              type={showCurrentPassword ? "text" : "password"}
                              value={password.current}
                              onChange={(e) => setPassword({ ...password, current: e.target.value })}
                              placeholder="Enter current password"
                              className="block w-full pr-8 py-1.5 px-2.5 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              disabled={updateLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400"
                            >
                              {showCurrentPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="newPassword" className="block text-xs font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={password.new}
                              onChange={(e) => setPassword({ ...password, new: e.target.value })}
                              placeholder="Enter new password"
                              className="block w-full pr-8 py-1.5 px-2.5 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              disabled={updateLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400"
                            >
                              {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                          </div>
                        </div>
                        
                        <button
                          type="submit"
                          className="w-full flex justify-center py-1.5 px-3 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          disabled={updateLoading}
                        >
                          {updateLoading ? (
                            <>
                              <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                              Updating...
                            </>
                          ) : (
                            "Update Password"
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Profile;