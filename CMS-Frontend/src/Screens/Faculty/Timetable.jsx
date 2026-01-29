import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import toast from "react-hot-toast";
import Heading from "../../components/Heading";
import { baseApiURL } from "../../baseUrl";

const Timetable = () => {
  const [formData, setFormData] = useState({
    branch: "",
    semester: "",
  });
  const [file, setFile] = useState(null);
  const [branches, setBranches] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBranchData();
  }, []);

  const fetchBranchData = async () => {
    try {
      const headers = { "Content-Type": "application/json" };
      const response = await axios.get(`${baseApiURL()}/branch/getBranch`, { headers });
      
      if (response.data.success) {
        setBranches(response.data.branches);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Failed to load branch data");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    const imageUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(imageUrl);
  };

  const resetForm = () => {
    setFormData({
      branch: "",
      semester: "",
    });
    setFile(null);
    setPreviewUrl("");
  };

  const clearSelectedFile = () => {
    setFile(null);
    setPreviewUrl("");
  };

  const addTimetableHandler = async () => {
    // Form validation
    if (!formData.branch || !formData.semester || !file) {
      toast.error("Please fill all fields and select a timetable image");
      return;
    }

    setIsLoading(true);
    toast.loading("Uploading timetable...");
    
    try {
      const headers = { "Content-Type": "multipart/form-data" };
      const formPayload = new FormData();
      formPayload.append("branch", formData.branch);
      formPayload.append("semester", formData.semester);
      formPayload.append("type", "timetable");
      formPayload.append("timetable", file);
      
      const response = await axios.post(
        `${baseApiURL()}/timetable/addTimetable`, 
        formPayload,
        { headers }
      );
      
      toast.dismiss();
      setIsLoading(false);
      
      if (response.data.success) {
        toast.success(response.data.message);
        resetForm();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      setIsLoading(false);
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload timetable");
    }
  };

  const semesters = [
    { value: "1", label: "1st Semester" },
    { value: "2", label: "2nd Semester" },
    { value: "3", label: "3rd Semester" },
    { value: "4", label: "4th Semester" },
    { value: "5", label: "5th Semester" },
    { value: "6", label: "6th Semester" },
    { value: "7", label: "7th Semester" },
    { value: "8", label: "8th Semester" },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-16 px-4">
      <Heading title="Timetable Management" />
      
      <div className="bg-white shadow-md rounded-lg p-6 mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Upload Timetable</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <select
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">-- Select Branch --</option>
                {branches?.map((branch) => (
                  <option key={branch.name} value={branch.name}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>
              <select
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">-- Select Semester --</option>
                {semesters.map((semester) => (
                  <option key={semester.value} value={semester.value}>
                    {semester.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-1">
                Timetable Image
              </span>
              <label
                htmlFor="upload"
                className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-md cursor-pointer ${
                  file ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
                }`}
              >
                <div className="flex flex-col items-center">
                  <FiUpload className={`w-8 h-8 ${file ? "text-blue-500" : "text-gray-400"}`} />
                  <span className="mt-2 text-sm text-gray-600">
                    {file ? file.name : "Click to select timetable image"}
                  </span>
                </div>
                <input
                  type="file"
                  name="upload"
                  id="upload"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </label>
            </div>
            
            {file && (
              <button
                type="button"
                onClick={clearSelectedFile}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <AiOutlineClose className="w-4 h-4 mr-2" />
                Remove selected file
              </button>
            )}
            
            <div className="pt-4">
              <button
                type="button"
                onClick={addTimetableHandler}
                disabled={isLoading || !formData.branch || !formData.semester || !file}
                className={`w-full px-4 py-3 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading || !formData.branch || !formData.semester || !file
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isLoading ? "Uploading..." : "Upload Timetable"}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            {previewUrl ? (
              <div className="overflow-hidden rounded-md border border-gray-200">
                <img 
                  src={previewUrl} 
                  alt="Timetable preview" 
                  className="max-w-full h-auto object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border border-gray-200 rounded-md">
                <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-4 text-sm text-gray-500">
                  No image selected
                </p>
                <p className="text-xs text-gray-400">
                  Preview will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;