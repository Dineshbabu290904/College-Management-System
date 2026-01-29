import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Profile from "./Profile";
import Timetable from "./Timetable";
import Marks from "./Marks";
import Notice from "../../components/Notice";
import Material from "./Material";
import { Toaster } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { FiUser, FiCalendar, FiActivity, FiFileText, FiClipboard, FiMenu } from "react-icons/fi";

const Home = () => {
  const [selectedMenu, setSelectedMenu] = useState("My Profile");
  const router = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (router.state === null) {
      navigate("/");
    }
    setLoad(true);
  }, [navigate, router.state]);

  const menuItems = [
    { id: "My Profile", label: "My Profile", icon: <FiUser className="text-lg" /> },
    { id: "Timetable", label: "Timetable", icon: <FiCalendar className="text-lg" /> },
    { id: "Marks", label: "Marks", icon: <FiActivity className="text-lg" /> },
    { id: "Material", label: "Material", icon: <FiFileText className="text-lg" /> },
    { id: "Notice", label: "Notice", icon: <FiClipboard className="text-lg" /> },
  ];

  return (
    <section className="bg-gray-50">
      {load && (
        <>
          <Navbar />
          <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Mobile Menu Button */}
            <div className="md:hidden mb-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center justify-between w-full p-3 bg-white rounded-lg shadow text-gray-700"
              >
                <span className="flex items-center font-medium">
                  {menuItems.find(item => item.id === selectedMenu)?.icon}
                  <span className="ml-2">{selectedMenu}</span>
                </span>
                <FiMenu className="text-gray-600" />
              </button>

              {/* Mobile Menu Dropdown */}
              {isMobileMenuOpen && (
                <div className="mt-2 rounded-lg shadow-lg bg-white overflow-hidden">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedMenu(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center w-full px-4 py-3 text-left ${
                        selectedMenu === item.id
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block mb-6">
              <div className="bg-white rounded-lg shadow-sm p-2">
                <ul className="flex justify-between items-center">
                  {menuItems.map((item) => (
                    <li
                      key={item.id}
                      className={`text-center rounded-md px-4 py-3 cursor-pointer transition-all ${
                        selectedMenu === item.id
                          ? "bg-blue-100 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedMenu(item.id)}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-lg shadow-sm p-6 min-h-[70vh]">
              {selectedMenu === "Timetable" && <Timetable />}
              {selectedMenu === "Marks" && <Marks />}
              {selectedMenu === "Material" && <Material />}
              {selectedMenu === "Notice" && <Notice />}
              {selectedMenu === "My Profile" && <Profile />}
            </div>
          </div>
        </>
      )}
      {!load && (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      <Toaster position="bottom-center" />
    </section>
  );
};

export default Home;