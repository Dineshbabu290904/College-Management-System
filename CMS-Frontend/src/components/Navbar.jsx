import React, { useState } from "react";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";

const Navbar = () => {
  const router = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="shadow-md px-4 sm:px-6 py-4 sticky top-0 bg-white z-50 transition-all duration-300">
      <div className="max-w-6xl flex justify-between items-center mx-auto">
        <p
          className="font-semibold text-xl sm:text-2xl flex justify-center items-center cursor-pointer transition-all duration-300 hover:text-primary-600"
          onClick={() => navigate("/")}
        >
          <span className="mr-2 animate-pulse">
            <RxDashboard />
          </span>{" "}
          <span className="hidden sm:inline">{router.state && router.state.type} Dashboard</span>
          <span className="sm:hidden">{router.state && router.state.type}</span>
        </p>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={toggleMenu}
            className="text-gray-700 hover:text-primary-600 focus:outline-none transition-all duration-300"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <button
            className="flex justify-center items-center text-red-500 px-3 py-2 font-semibold rounded-sm hover:bg-red-50 transition-all duration-300 active:scale-95"
            onClick={() => navigate("/")}
          >
            Logout
            <span className="ml-2">
              <FiLogOut />
            </span>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-fadeIn">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t mt-4">
            <button
              className="flex justify-center items-center text-red-500 px-3 py-2 font-semibold rounded-sm w-full hover:bg-red-50 transition-all duration-300"
              onClick={() => {
                setIsMenuOpen(false);
                navigate("/");
              }}
            >
              Logout
              <span className="ml-2">
                <FiLogOut />
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;