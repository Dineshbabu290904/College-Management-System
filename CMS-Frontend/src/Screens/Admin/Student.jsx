import React, { useState } from "react";
import { FiUserPlus, FiEdit } from "react-icons/fi";
import Heading from "../../components/Heading";
import AddStudent from "./Student/AddStudent";
import EditStudent from "./Student/EditStudent";

const Student = () => {
  const [selected, setSelected] = useState("add");

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-10">
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center w-full border-b pb-5 mb-5">
          <div className="mb-4 md:mb-0">
            <Heading title="Student Management" />
            <p className="text-gray-500 text-sm mt-1">Add or edit student accounts</p>
          </div>
          
          <div className="flex justify-center md:justify-end items-center w-full md:w-auto">
            <button
              className={`flex items-center px-4 py-2 mr-4 rounded-md transition-all duration-200 ${
                selected === "add"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setSelected("add")}
            >
              <FiUserPlus className="mr-2" />
              Add Student
            </button>
            <button
              className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 ${
                selected === "edit"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setSelected("edit")}
            >
              <FiEdit className="mr-2" />
              Edit Student
            </button>
          </div>
        </div>
        
        <div className="mt-4 animate-fadeIn">
          {selected === "add" && <AddStudent />}
          {selected === "edit" && <EditStudent />}
        </div>
      </div>
    </div>
  );
};

export default Student;