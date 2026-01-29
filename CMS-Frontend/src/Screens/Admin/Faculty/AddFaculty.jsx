import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { baseApiURL } from "../../../baseUrl";
import { FiUpload, FiUser, FiMail, FiPhone, FiUserPlus, FiBookOpen, FiBriefcase } from "react-icons/fi";

const AddFaculty = () => {
  const [file, setFile] = useState();
  const [branch, setBranch] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      employeeId: "",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      department: "",
      gender: "",
      experience: "",
      post: ""
    }
  });

  const getBranchData = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .get(`${baseApiURL()}/branch/getBranch`, { headers })
      .then((response) => {
        if (response.data.success) {
          setBranch(response.data.branches);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    getBranchData();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const imageUrl = URL.createObjectURL(selectedFile);
      setPreviewImage(imageUrl);
    }
  };

  const onSubmit = (data) => {
    if (!file) {
      toast.error("Please select a profile image");
      return;
    }

    toast.loading("Adding Faculty");
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
    formData.append("department", data.department);
    formData.append("experience", data.experience);
    formData.append("gender", data.gender);
    formData.append("post", data.post);
    formData.append("type", "profile");
    formData.append("profile", file);
    
    axios
      .post(`${baseApiURL()}/faculty/details/addDetails`, formData, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          // Register faculty credentials
          axios
            .post(`${baseApiURL()}/faculty/auth/register`, {
              loginid: data.employeeId,
              password: data.employeeId,
            })
            .then((response) => {
              toast.dismiss();
              if (response.data.success) {
                toast.success(response.data.message);
                // Reset form
                setFile(null);
                setPreviewImage("");
                reset();
              } else {
                toast.error(response.data.message);
              }
            })
            .catch((error) => {
              toast.dismiss();
              toast.error(error.response.data.message);
            });
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response.data.message);
      });
  };

  return (
    <div className="w-full bg-gray-50 p-4">
      <Toaster />

      {/* Main Content */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Add New Faculty</h3>
          <p className="text-sm text-gray-500">Enter faculty member details below</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    className={`block w-full pl-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.firstName ? 'border-red-500' : ''}`}
                    placeholder="First Name"
                    {...register("firstName", {
                      required: "First name is required"
                    })}
                  />
                </div>
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
              </div>
              
              {/* Middle Name */}
              <div>
                <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    id="middleName"
                    type="text"
                    className="block w-full pl-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Middle Name (Optional)"
                    {...register("middleName")}
                  />
                </div>
              </div>
              
              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    type="text"
                    className={`block w-full pl-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.lastName ? 'border-red-500' : ''}`}
                    placeholder="Last Name"
                    {...register("lastName", {
                      required: "Last name is required"
                    })}
                  />
                </div>
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
              </div>
              
              {/* Employee ID */}
              <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    id="employeeId"
                    type="String"
                    className={`block w-full pl-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.employeeId ? 'border-red-500' : ''}`}
                    placeholder="Employee ID"
                    {...register("employeeId", {
                      required: "Employee ID is required"
                    })}
                  />
                </div>
                {errors.employeeId && <p className="mt-1 text-sm text-red-600">{errors.employeeId.message}</p>}
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    className={`block w-full pl-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Email Address"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
              
              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="text-gray-400" />
                  </div>
                  <input
                    id="phoneNumber"
                    type="number"
                    className={`block w-full pl-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.phoneNumber ? 'border-red-500' : ''}`}
                    placeholder="Phone Number"
                    {...register("phoneNumber", {
                      required: "Phone number is required"
                    })}
                  />
                </div>
                {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>}
              </div>

              {/* Department */}
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiBookOpen className="text-gray-400" />
                  </div>
                  <select
                    id="department"
                    className={`block w-full pl-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.department ? 'border-red-500' : ''}`}
                    {...register("department", {
                      required: "Department is required"
                    })}
                  >
                    <option value="">-- Select Department --</option>
                    {branch?.map((branch) => (
                      <option value={branch.name} key={branch.name}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>}
              </div>

              {/* POST */}
              <div>
                <label htmlFor="post" className="block text-sm font-medium text-gray-700 mb-1">
                  Designation/Post
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiBriefcase className="text-gray-400" />
                  </div>
                  <input
                    id="post"
                    type="text"
                    className={`block w-full pl-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.post ? 'border-red-500' : ''}`}
                    placeholder="Designation/Post"
                    {...register("post", {
                      required: "Post is required"
                    })}
                  />
                </div>
                {errors.post && <p className="mt-1 text-sm text-red-600">{errors.post.message}</p>}
              </div>
              
              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <div className="relative">
                  <select
                    id="gender"
                    className={`block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.gender ? 'border-red-500' : ''}`}
                    {...register("gender", {
                      required: "Please select a gender"
                    })}
                  >
                    <option value="">-- Select Gender --</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
              </div>

              {/* Experience */}
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                  Experience (Years)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiBriefcase className="text-gray-400" />
                  </div>
                  <input
                    id="experience"
                    type="number"
                    className={`block w-full pl-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.experience ? 'border-red-500' : ''}`}
                    placeholder="Years of Experience"
                    {...register("experience", {
                      required: "Experience is required"
                    })}
                  />
                </div>
                {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>}
              </div>
              
              {/* Profile Image */}
              <div>
                <label htmlFor="profile" className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  <label
                    htmlFor="profile"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer hover:bg-gray-50"
                  >
                    <FiUpload />
                    Upload Image
                  </label>
                  <input
                    id="profile"
                    name="profile"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  
                  {previewImage && (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500">
                      <img 
                        src={previewImage} 
                        alt="Faculty profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <FiUserPlus />
                Add Faculty
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFaculty;