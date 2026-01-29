import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Notice from "../../components/Notice";
import Profile from "./Profile";
import Timetable from "./Timetable";
import { Toaster } from "react-hot-toast";
import Material from "./Material";
import Marks from "./Marks";
import Student from "./Student";
import { FiUser, FiUsers, FiClipboard, FiUpload, FiCalendar, FiFileText } from "react-icons/fi";

const Home = () => {
  const router = useLocation();
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState("My Profile");
  const [load, setLoad] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    if (router.state === null) {
      navigate("/");
    }
    setLoad(true);
  }, [navigate, router.state]);

  const menuItems = [
    { id: "My Profile", label: "My Profile", icon: <FiUser /> },
    { id: "Student Info", label: "Student Info", icon: <FiUsers /> },
    { id: "Upload Marks", label: "Upload Marks", icon: <FiUpload /> },
    { id: "Timetable", label: "Timetable", icon: <FiCalendar /> },
    { id: "Notice", label: "Notice", icon: <FiClipboard /> },
    { id: "Material", label: "Material", icon: <FiFileText /> },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuClick = (menuId) => {
    setSelectedMenu(menuId);
    setIsMobileMenuOpen(false);
  };

  return (
    <section>
      {load && (
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            {/* Mobile Menu Dropdown */}
            <div className="md:hidden mb-6">
              <div className="relative">
                <button
                  onClick={toggleMobileMenu}
                  className="flex justify-between items-center w-full px-4 py-3 bg-white rounded-lg shadow-md text-left"
                >
                  <span className="flex items-center font-medium text-gray-700">
                    {menuItems.find(item => item.id === selectedMenu)?.icon}
                    <span className="ml-2">{selectedMenu}</span>
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${isMobileMenuOpen ? "transform rotate-180" : ""}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                
                {isMobileMenuOpen && (
                  <div className="absolute z-10 w-full mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 animate-fadeIn">
                    <div className="py-1">
                      {menuItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleMenuClick(item.id)}
                          className={`flex items-center w-full px-4 py-3 text-sm ${
                            selectedMenu === item.id
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span className="mr-2">{item.icon}</span>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block mb-6">
              <div className="bg-white rounded-lg shadow-sm p-1">
                <ul className="flex flex-wrap justify-between items-center">
                  {menuItems.map((item) => (
                    <li
                      key={item.id}
                      className={`text-center rounded-md px-3 py-2 cursor-pointer transition-all duration-300 flex items-center justify-center ${
                        selectedMenu === item.id
                          ? "bg-blue-100 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedMenu(item.id)}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-lg shadow-sm p-4 min-h-[60vh] animate-fadeIn">
              {selectedMenu === "Timetable" && <Timetable />}
              {selectedMenu === "Upload Marks" && <Marks />}
              {selectedMenu === "Material" && <Material />}
              {selectedMenu === "Notice" && <Notice />}
              {selectedMenu === "My Profile" && <Profile />}
              {selectedMenu === "Student Info" && <Student />}
            </div>
          </div>
        </div>
      )}
      <Toaster position="bottom-center" />
    </section>
  );
};

export default Home;