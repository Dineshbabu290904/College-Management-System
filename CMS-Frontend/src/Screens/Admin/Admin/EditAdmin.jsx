import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { baseApiURL } from "../../../baseUrl";
import { FiSearch, FiUpload, FiX, FiUser, FiMail, FiPhone, FiUserPlus } from "react-icons/fi";

const EditAdmin = () => {
  const [file, setFile] = useState();
  const [searchActive, setSearchActive] = useState(false);
  const [data, setData] = useState({
    employeeId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    profile: "",
  });
  const [id, setId] = useState();
  const [search, setSearch] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    const imageUrl = URL.createObjectURL(selectedFile);
    setPreviewImage(imageUrl);
  };

  const updateAdminProfile = (e) => {
    e.preventDefault();
    setLoading(true);
    toast.loading("Updating Admin");
    const headers = {
      "Content-Type": "multipart/form-data",
    };
    const formData = new FormData();
    formData.append("employeeId", data.employeeId);
    formData.append("firstName", data.firstName);
    formData.append("middleName", data.middleName);
    formData.append("lastName", data.lastName);
    formData.append("email", data.email);
    formData.append("phoneNumber", data.phoneNumber);
    formData.append("gender", data.gender);
    if (file) {
      formData.append("type", "profile");
      formData.append("profile", file);
    }
    axios
      .put(`${baseApiURL()}/admin/details/updateDetails/${id}`, formData, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        setLoading(false);
        if (response.data.success) {
          toast.success(response.data.message);
          clearSearchHandler();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        setLoading(false);
        toast.error(error.response.data.message);
      });
  };

  const searchAdminHandler = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    
    setLoading(true);
    toast.loading("Getting Admin");
    const headers = {
      "Content-Type": "application/json",
    };
    
    axios
      .post(
        `${baseApiURL()}/admin/details/getDetails`,
        { employeeId: search },
        { headers }
      )
      .then((response) => {
        toast.dismiss();
        setLoading(false);
        if (response.data.success) {
          if (response.data.user.length !== 0) {
            setSearchActive(true);
            toast.success(response.data.message);
            setId(response.data.user[0]._id);
            setData({
              employeeId: response.data.user[0].employeeId,
              firstName: response.data.user[0].firstName,
              middleName: response.data.user[0].middleName,
              lastName: response.data.user[0].lastName,
              email: response.data.user[0].email,
              phoneNumber: response.data.user[0].phoneNumber,
              gender: response.data.user[0].gender,
              profile: response.data.user[0].profile,
            });
          } else {
            toast.error("No Admin Found With ID");
          }
        } else {
          if (response?.data) toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setLoading(false);
        if (error?.response?.data) toast.error(error.response.data.message);
        console.error(error);
      });
  };

  const clearSearchHandler = () => {
    setSearchActive(false);
    setSearch("");
    setId("");
    setPreviewImage("");
    setData({
      employeeId: "",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      gender: "",
      profile: "",
    });
  };

  return (
    <div className="bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto animate-fadeIn">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Update Admin Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Search for an admin by employee ID to update their information
          </p>
        </div>

        <form
          onSubmit={searchAdminHandler}
          className="max-w-md mx-auto mb-8 animate-slideIn"
        >
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Employee ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              {!searchActive ? (
                <button
                  className="p-2 mr-1 text-gray-400 hover:text-blue-500 focus:outline-none transition-colors duration-200"
                  type="submit"
                  disabled={loading}
                >
                  <FiSearch className="h-5 w-5" />
                </button>
              ) : (
                <button
                  className="p-2 mr-1 text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-200"
                  onClick={clearSearchHandler}
                  type="button"
                  disabled={loading}
                >
                  <FiX className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </form>

        {search && id && (
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 card animate-fadeIn">
            <form onSubmit={updateAdminProfile} className="space-y-6">
              {!previewImage && data.profile && (
                <div className="flex justify-center mb-4">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100">
                    <img
                      src={process.env.REACT_APP_MEDIA_LINK + "/" + data.profile}
                      alt="admin"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              {previewImage && (
                <div className="flex justify-center mb-4">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100">
                    <img
                      src={previewImage}
                      alt="admin preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="animate-slideIn delay-100">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="firstName"
                      value={data.firstName}
                      onChange={(e) => setData({ ...data, firstName: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="animate-slideIn delay-200">
                  <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">
                    Middle Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="middleName"
                      value={data.middleName}
                      onChange={(e) => setData({ ...data, middleName: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="animate-slideIn delay-300">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="lastName"
                      value={data.lastName}
                      onChange={(e) => setData({ ...data, lastName: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="animate-slideIn delay-400">
                  <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
                    Employee ID
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="String"
                      id="employeeId"
                      value={data.employeeId}
                      onChange={(e) => setData({ ...data, employeeId: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="animate-slideIn delay-500">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={data.email}
                      onChange={(e) => setData({ ...data, email: e.target.value })}
                      className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="animate-slideIn delay-600">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="phoneNumber"
                      value={data.phoneNumber}
                      onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
                      className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="animate-slideIn delay-700">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <select
                      id="gender"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={data.gender}
                      onChange={(e) => setData({ ...data, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="animate-slideIn delay-800">
                  <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                    Profile Picture
                  </label>
                  <div className="mt-1">
                    <label
                      htmlFor="file"
                      className="flex items-center justify-center w-full px-3 py-2 border border-gray-300 border-dashed rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                    >
                      <FiUpload className="mr-2 text-gray-400" />
                      Upload Profile Picture
                    </label>
                    <input
                      hidden
                      type="file"
                      id="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-8 animate-slideIn delay-900">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center w-full sm:w-auto px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 active:scale-95"
                >
                  <FiUserPlus className="mr-2" />
                  Update Admin
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditAdmin;