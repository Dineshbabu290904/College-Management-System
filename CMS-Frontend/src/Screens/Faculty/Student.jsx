import React, { useState } from "react";
import toast from "react-hot-toast";
import Heading from "../../components/Heading";
import axios from "axios";
import { baseApiURL } from "../../baseUrl";
import { FiSearch, FiUser, FiMail, FiPhone, FiBookmark, FiCalendar } from "react-icons/fi";

const Student = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    enrollmentNo: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    semester: "",
    branch: "",
    gender: "",
    profile: "",
  });
  const [id, setId] = useState("");

  const searchStudentHandler = (e) => {
    e.preventDefault();
    
    if (!search || search.trim() === "") {
      toast.error("Please enter an enrollment number");
      return;
    }

    setLoading(true);
    setId("");
    setData({
      enrollmentNo: "",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      semester: "",
      branch: "",
      gender: "",
      profile: "",
    });
    
    toast.loading("Searching for student...");
    
    const headers = {
      "Content-Type": "application/json",
    };
    
    axios
      .post(
        `${baseApiURL()}/student/details/getDetails`,
        { enrollmentNo: search },
        { headers }
      )
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          if (response.data.user.length === 0) {
            toast.error("No student found with this enrollment number");
          } else {
            toast.success(response.data.message);
            setData({
              enrollmentNo: response.data.user[0].enrollmentNo,
              firstName: response.data.user[0].firstName,
              middleName: response.data.user[0].middleName,
              lastName: response.data.user[0].lastName,
              email: response.data.user[0].email,
              phoneNumber: response.data.user[0].phoneNumber,
              semester: response.data.user[0].semester,
              branch: response.data.user[0].branch,
              gender: response.data.user[0].gender,
              profile: response.data.user[0].profile,
            });
            setId(response.data.user[0]._id);
          }
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response?.data?.message || "An error occurred");
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getFullName = () => {
    const names = [data.firstName, data.middleName, data.lastName].filter(Boolean);
    return names.join(" ");
  };

  return (
    <div className="w-full mx-auto mt-10 flex justify-center items-start flex-col mb-10 max-w-7xl px-4">
      <div className="flex justify-between items-center w-full">
        <Heading title="Student Details" />
      </div>
      
      <div className="my-6 w-full">
        <div className="bg-white shadow-md rounded-lg p-6 w-full">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Find Student</h2>
          
          <form
            className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full sm:w-2/3 lg:w-1/2 mx-auto"
            onSubmit={searchStudentHandler}
          >
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiUser className="text-gray-500" />
              </div>
              <input
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2.5 transition-all"
                placeholder="Enter Enrollment Number"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              className={`flex items-center justify-center px-4 py-2.5 rounded-md text-white font-medium transition-all ${
                loading 
                  ? "bg-blue-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
              }`}
              type="submit"
              disabled={loading}
            >
              <FiSearch className="mr-2" />
              Search
            </button>
          </form>
        </div>
        
        {id && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden mt-8">
            <div className="bg-blue-600 p-6 flex flex-col sm:flex-row justify-between items-center">
              <div className="text-white mb-4 sm:mb-0 text-center sm:text-left">
                <h3 className="text-2xl font-bold">{getFullName()}</h3>
                <p className="text-blue-100 mt-1">{data.enrollmentNo}</p>
              </div>
              
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white flex items-center justify-center">
                {data.profile ? (
                  <img
                    src={`${process.env.REACT_APP_MEDIA_LINK}/${data.profile}`}
                    alt={`${getFullName()}'s profile`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <FiUser size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h4>
                  
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 text-blue-600">
                      <FiUser />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="text-gray-800">{getFullName()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 text-blue-600">
                      <FiMail />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="text-gray-800">{data.email || "Not available"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 text-blue-600">
                      <FiPhone />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-gray-800">
                        {data.phoneNumber ? `+91 ${data.phoneNumber}` : "Not available"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 text-blue-600">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="text-gray-800">{data.gender || "Not specified"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Academic Information</h4>
                  
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 text-blue-600">
                      <FiBookmark />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Enrollment Number</p>
                      <p className="text-gray-800">{data.enrollmentNo}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 text-blue-600">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Branch</p>
                      <p className="text-gray-800">{data.branch || "Not assigned"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 text-blue-600">
                      <FiCalendar />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Semester</p>
                      <p className="text-gray-800">
                        {data.semester 
                          ? `${data.semester}${data.semester === "1" 
                              ? "st" 
                              : data.semester === "2" 
                                ? "nd" 
                                : data.semester === "3" 
                                  ? "rd" 
                                  : "th"} Semester`
                          : "Not assigned"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {search && !id && !loading && (
          <div className="w-full flex flex-col items-center justify-center bg-white shadow-md rounded-lg p-12 mt-8">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mt-4">No Student Found</h3>
            <p className="text-gray-500 mt-1 text-center">
              No student with enrollment number "{search}" was found in the database
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Student;