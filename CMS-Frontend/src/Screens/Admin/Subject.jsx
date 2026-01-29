import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { MdOutlineDelete, MdAdd, MdViewList } from "react-icons/md";
import { FiBookOpen, FiHash } from "react-icons/fi";
import { baseApiURL } from "../../baseUrl";

const Subjects = () => {
  const [data, setData] = useState({
    name: "",
    code: "",
  });
  const [selected, setSelected] = useState("add");
  const [subject, setSubject] = useState([]);
  
  useEffect(() => {
    getSubjectHandler();
  }, []);

  const getSubjectHandler = () => {
    axios
      .get(`${baseApiURL()}/subject/getSubject`)
      .then((response) => {
        if (response.data.success) {
          setSubject(response.data.subject);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const addSubjectHandler = () => {
    // Validate inputs
    if (!data.name.trim() || !data.code.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    
    toast.loading("Adding Subject");
    const headers = {
      "Content-Type": "application/json",
    };
    
    axios
      .post(`${baseApiURL()}/subject/addSubject`, data, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          setData({ name: "", code: "" });
          getSubjectHandler();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response.data.message);
      });
  };

  const deleteSubjectHandler = (id) => {
    toast.loading("Deleting Subject");
    const headers = {
      "Content-Type": "application/json",
    };
    
    axios
      .delete(`${baseApiURL()}/subject/deleteSubject/${id}`, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          getSubjectHandler();
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
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <Toaster />
      
      {/* Header Section */}
      <div className="mb-8 border-l-4 border-blue-600 pl-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Subject Management</h2>
          <p className="text-sm text-gray-500">Add or view course subjects</p>
        </div>
        <div className="flex gap-2">
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              selected === "add" 
                ? "bg-blue-600 text-white" 
                : "bg-white border border-gray-300 text-gray-700"
            }`}
            onClick={() => setSelected("add")}
          >
            <MdAdd />
            Add Subject
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              selected === "view" 
                ? "bg-blue-600 text-white" 
                : "bg-white border border-gray-300 text-gray-700"
            }`}
            onClick={() => setSelected("view")}
          >
            <MdViewList />
            View Subjects
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl mx-auto">
        {selected === "add" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Subject</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Subject Code */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiHash className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="code"
                    value={data.code}
                    onChange={(e) => setData({ ...data, code: e.target.value })}
                    className="block w-full pl-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter subject code"
                  />
                </div>
              </div>
              
              {/* Subject Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiBookOpen className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    className="block w-full pl-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter subject name"
                  />
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                onClick={addSubjectHandler}
              >
                <MdAdd />
                Add Subject
              </button>
            </div>
          </div>
        )}

        {selected === "view" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Subject List</h3>
            
            {subject && subject.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subject.map((item) => (
                      <tr key={item.code} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            className="text-gray-500 hover:text-red-600 transition-colors text-xl"
                            onClick={() => deleteSubjectHandler(item._id)}
                            title="Delete Subject"
                          >
                            <MdOutlineDelete />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                No subjects found. Add some subjects to get started.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subjects;