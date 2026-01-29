import axios from "axios";
import React, { useEffect, useState } from "react";
import Heading from "../../components/Heading";
import { HiOutlineCalendar, HiOutlineSearch, HiDownload, HiOutlineDocumentText } from "react-icons/hi";
import { HiChevronDown, HiX } from "react-icons/hi";
import toast from "react-hot-toast";
import { baseApiURL } from "../../baseUrl";

const Material = () => {
  const [subject, setSubject] = useState();
  const [selected, setSelected] = useState("select");
  const [material, setMaterial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
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

    fetchSubjects();
  }, []);

  const getSubjectMaterial = async () => {
    if (selected === "select") {
      toast.error("Please select a subject");
      return;
    }

    setLoading(true);
    setMaterial([]);
    
    try {
      const headers = {
        "Content-Type": "application/json",
      };
      
      toast.loading("Fetching materials");
      const response = await axios.post(
        `${baseApiURL()}/material/getMaterial`,
        { subject: selected },
        { headers }
      );
      toast.dismiss();
      
      if (response.data.success) {
        setMaterial(response.data.material);
      } else {
        toast.error(response.data.message || "Failed to fetch materials");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred while fetching materials");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSelectChangeHandler = (e) => {
    setMaterial([]);
    setSelected(e.target.value);
    setIsDropdownOpen(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMaterials = material ? material.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.faculty.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const clearSelection = () => {
    setSelected("select");
    setMaterial([]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 flex justify-center items-start flex-col mb-10 px-4">
      <Heading title="Study Materials" />
      
      <div className="mt-6 w-full flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-64">
          <div 
            className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 flex justify-between items-center cursor-pointer shadow-sm hover:border-blue-500 transition-colors"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className={selected === "select" ? "text-gray-500" : "text-gray-800 font-medium"}>
              {selected === "select" ? "Select Subject" : selected}
            </span>
            <HiChevronDown className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </div>
          
          {isDropdownOpen && subject && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              <div className="py-1">
                <div 
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-500"
                  onClick={() => onSelectChangeHandler({ target: { value: "select" }})}
                >
                  -- Select Subject --
                </div>
                {subject.map((item) => (
                  <div 
                    key={item.name}
                    className={`px-4 py-2 hover:bg-blue-50 cursor-pointer ${selected === item.name ? "bg-blue-50 text-blue-600" : "text-gray-800"}`}
                    onClick={() => onSelectChangeHandler({ target: { value: item.name }})}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={getSubjectMaterial}
            disabled={loading || selected === "select"}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 md:flex-auto"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading
              </span>
            ) : (
              <>
                <HiOutlineSearch className="text-xl" />
                <span>Search</span>
              </>
            )}
          </button>
          
          {selected !== "select" && (
            <button 
              onClick={clearSelection}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-3 rounded-lg transition-colors"
            >
              <HiX className="text-xl" />
            </button>
          )}
        </div>
      </div>
      
      {material && material.length > 0 && (
        <div className="mt-6 relative w-full">
          <div className="flex items-center w-full bg-white border border-gray-300 rounded-lg px-3 py-2 mb-4 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <HiOutlineSearch className="text-gray-400 text-lg mr-2" />
            <input
              type="text"
              placeholder="Search by title or faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full outline-none text-gray-700"
            />
          </div>
        </div>
      )}
      
      <div className="mt-2 w-full">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {material && material.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMaterials.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3
                            className={`text-lg font-medium flex items-center text-gray-800 ${
                              item.link && "cursor-pointer hover:text-blue-600"
                            } transition-colors`}
                            onClick={() =>
                              item.link &&
                              window.open(
                                process.env.REACT_APP_MEDIA_LINK + "/" + item.link
                              )
                            }
                          >
                            {item.link ? (
                              <HiOutlineDocumentText className="text-blue-500 mr-2 flex-shrink-0" />
                            ) : (
                              <span className="w-5 h-5 mr-2 flex-shrink-0" />
                            )}
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.subject} - {item.faculty}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-xs text-gray-500 flex items-center">
                          <HiOutlineCalendar className="mr-1" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                        
                        {item.link && (
                          <button
                            onClick={() =>
                              window.open(
                                process.env.REACT_APP_MEDIA_LINK + "/" + item.link
                              )
                            }
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center transition-colors"
                          >
                            <HiDownload className="mr-1" />
                            <span>Download</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {selected !== "select" ? (
                  <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                      <HiOutlineDocumentText className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No Materials Available</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      No study materials found for {selected}.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                      <HiOutlineSearch className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Select a Subject</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Choose a subject from the dropdown to view available materials.
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Material;