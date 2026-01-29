import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { HiDocumentText, HiX, HiCheck } from "react-icons/hi";
import Heading from "../../components/Heading";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { baseApiURL } from "../../baseUrl";

const Material = () => {
  const { fullname } = useSelector((state) => state.userData);
  const [subject, setSubject] = useState();
  const [file, setFile] = useState();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [selected, setSelected] = useState({
    title: "",
    subject: "",
    faculty: fullname.split(" ")[0] + " " + fullname.split(" ")[2],
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      toast.loading("Loading Subjects");
      const response = await axios.get(`${baseApiURL()}/subject/getSubject`);
      toast.dismiss();
      
      if (response.data.success) {
        setSubject(response.data.subject);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addMaterialHandler = async () => {
    // Validate inputs
    if (!selected.title.trim()) {
      toast.error("Please enter a material title");
      return;
    }
    
    if (!selected.subject || selected.subject === "select") {
      toast.error("Please select a subject");
      return;
    }
    
    if (!file) {
      toast.error("Please upload a file");
      return;
    }

    setUploading(true);
    toast.loading("Uploading Material");
    
    try {
      const headers = {
        "Content-Type": "multipart/form-data",
      };
      
      const formData = new FormData();
      formData.append("title", selected.title);
      formData.append("subject", selected.subject);
      formData.append("faculty", selected.faculty);
      formData.append("type", "material");
      formData.append("material", file);
      
      const response = await axios.post(
        `${baseApiURL()}/material/addMaterial`, 
        formData,
        { headers }
      );
      
      toast.dismiss();
      
      if (response.data.success) {
        toast.success(response.data.message);
        // Reset form
        setSelected({
          title: "",
          subject: "",
          faculty: fullname.split(" ")[0] + " " + fullname.split(" ")[2],
        });
        setFile(null);
        setFileName("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileName("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 px-4 mb-16">
      <div className="flex justify-between items-center w-full mb-8">
        <Heading title="Upload Study Material" />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <h2 className="text-lg font-medium text-gray-800">Add New Material</h2>
          <p className="text-sm text-gray-600 mt-1">
            Upload study materials for students to access
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Material Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  placeholder="Enter a descriptive title"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={selected.title}
                  onChange={(e) => setSelected({ ...selected, title: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selected.subject}
                    name="subject"
                    id="subject"
                    onChange={(e) => setSelected({ ...selected, subject: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={loading}
                  >
                    <option value="select">-- Select Subject --</option>
                    {subject &&
                      subject.map((item) => (
                        <option value={item.name} key={item.name}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {loading && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading subjects...
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="faculty" className="block text-sm font-medium text-gray-700 mb-1">
                  Faculty
                </label>
                <input
                  type="text"
                  id="faculty"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={selected.faculty}
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Automatically set based on your profile</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload File <span className="text-red-500">*</span>
                </label>
                
                <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  {!fileName ? (
                    <label htmlFor="upload" className="w-full cursor-pointer">
                      <div className="text-center">
                        <FiUpload className="mx-auto h-10 w-10 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          <span className="font-medium text-blue-600 hover:text-blue-500">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="mt-1 text-xs text-gray-500">PDF, DOC, PPT, XLS up to 10MB</p>
                      </div>
                      <input
                        id="upload"
                        name="upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                  ) : (
                    <div className="w-full">
                      <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded">
                        <div className="flex items-center space-x-2">
                          <HiDocumentText className="h-6 w-6 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
                            {fileName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={clearFile}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <HiX className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-center text-gray-500">
                        File selected successfully. You can click the X to remove it.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={addMaterialHandler}
                  disabled={uploading || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <HiCheck className="h-5 w-5 mr-2" />
                      Upload Material
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Uploaded materials will be available to students immediately.
          Please ensure all content follows institutional guidelines.
        </p>
      </div>
    </div>
  );
};

export default Material;