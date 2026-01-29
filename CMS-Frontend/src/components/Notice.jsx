import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { IoMdLink } from "react-icons/io";
import { HiOutlineCalendar } from "react-icons/hi";
import { IoAddOutline } from "react-icons/io5";
import { MdDeleteOutline, MdEditNote } from "react-icons/md";
import { BiArrowBack } from "react-icons/bi";
import Heading from "./Heading";
import { baseApiURL } from "../baseUrl";

const Notice = () => {
  const router = useLocation();
  const [notice, setNotice] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [id, setId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    title: "",
    description: "",
    type: "student",
    link: "",
  });

  const getNoticeHandler = () => {
    setIsLoading(true);
    let requestData = {};
    if (router.pathname.replace("/", "") === "student") {
      requestData = {
        type: ["student", "both"],
      };
    } else {
      requestData = {
        type: ["student", "both", "faculty"],
      };
    }
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .get(`${baseApiURL()}/notice/getNotice`, requestData, {
        headers: headers,
      })
      .then((response) => {
        setIsLoading(false);
        if (response.data.success) {
          setNotice(response.data.notice);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        toast.dismiss();
        toast.error(error.response.data.message);
      });
  };

  useEffect(() => {
    let requestData = {};
    if (router.pathname.replace("/", "") === "student") {
      requestData = {
        type: ["student", "both"],
      };
    } else {
      requestData = {
        type: ["student", "both", "faculty"],
      };
    }
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .get(`${baseApiURL()}/notice/getNotice`, requestData, {
        headers: headers,
      })
      .then((response) => {
        if (response.data.success) {
          setNotice(response.data.notice);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response.data.message);
      });
  }, [router.pathname]);

  const addNoticehandler = (e) => {
    e.preventDefault();
    setIsLoading(true);
    toast.loading("Adding Notice");
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .post(`${baseApiURL()}/notice/addNotice`, data, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        setIsLoading(false);
        if (response.data.success) {
          toast.success(response.data.message);
          getNoticeHandler();
          setOpen(!open);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        setIsLoading(false);
        toast.error(error.response.data.message);
      });
  };

  const deleteNoticehandler = (id) => {
    setIsLoading(true);
    toast.loading("Deleting Notice");
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .delete(`${baseApiURL()}/notice/deleteNotice/${id}`, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        setIsLoading(false);
        if (response.data.success) {
          toast.success(response.data.message);
          getNoticeHandler();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        setIsLoading(false);
        toast.error(error.response.data.message);
      });
  };

  const updateNoticehandler = (e) => {
    e.preventDefault();
    setIsLoading(true);
    toast.loading("Updating Notice");
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .put(`${baseApiURL()}/notice/updateNotice/${id}`, data, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        setIsLoading(false);
        if (response.data.success) {
          toast.success(response.data.message);
          getNoticeHandler();
          setOpen(!open);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        setIsLoading(false);
        toast.error(error.response.data.message);
      });
  };

  const setOpenEditSectionHandler = (index) => {
    setEdit(true);
    setOpen(!open);
    setData({
      title: notice[index].title,
      description: notice[index].description,
      type: notice[index].type,
      link: notice[index].link,
    });
    setId(notice[index]._id);
  };

  const openHandler = () => {
    setOpen(!open);
    setEdit(false);
    setData({ title: "", description: "", type: "student", link: "" });
  };

  // Format date from ISO string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-10">
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center w-full border-b pb-5 mb-5">
          <div className="mb-4 md:mb-0">
            <Heading title="Notices" />
            <p className="text-gray-500 text-sm mt-1">
              View and manage important announcements
            </p>
          </div>
          
          {(router.pathname === "/faculty" || router.pathname === "/admin") && (
            <button
              className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 ${
                open
                  ? "bg-red-600 text-white"
                  : "bg-blue-600 text-white"
              }`}
              onClick={openHandler}
            >
              {open ? (
                <>
                  <BiArrowBack className="mr-2" />
                  Close Form
                </>
              ) : (
                <>
                  <IoAddOutline className="mr-2 text-xl" />
                  Add Notice
                </>
              )}
            </button>
          )}
        </div>

        {!open ? (
          <div className="animate-fadeIn">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-pulse text-blue-600">Loading notices...</div>
              </div>
            ) : notice && notice.length > 0 ? (
              notice.map((item, index) => (
                <div
                  key={item._id}
                  className="border-l-4 border-blue-500 bg-white rounded-md shadow-sm p-4 mb-4 relative hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="pr-16">
                      <h3
                        className={`text-lg font-medium flex items-center ${
                          item.link && "cursor-pointer hover:text-blue-600"
                        } group`}
                        onClick={() => item.link && window.open(item.link)}
                      >
                        {item.title}
                        {item.link && (
                          <IoMdLink className="ml-1 text-blue-500 group-hover:text-blue-600" />
                        )}
                      </h3>
                      <p className="text-gray-600 mt-2 whitespace-pre-line">{item.description}</p>
                    </div>
                    
                    <div className="text-sm text-gray-500 flex items-center">
                      <HiOutlineCalendar className="mr-1" />
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                    
                    {(router.pathname === "/faculty" || router.pathname === "/admin") && (
                      <div className="flex space-x-2">
                        <button
                          className="text-gray-500 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                          onClick={() => setOpenEditSectionHandler(index)}
                          title="Edit Notice"
                        >
                          <MdEditNote size={22} />
                        </button>
                        <button
                          className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                          onClick={() => deleteNoticehandler(item._id)}
                          title="Delete Notice"
                        >
                          <MdDeleteOutline size={22} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No notices available at this time.
              </div>
            )}
          </div>
        ) : (
          <form className="animate-fadeIn mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Notice Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full bg-gray-50 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none py-2 px-4 transition-colors duration-200 ease-in-out"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  placeholder="Enter notice title"
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="link" className="block text-sm font-medium text-gray-700">
                  Notice Link (Optional)
                </label>
                <input
                  type="text"
                  id="link"
                  className="w-full bg-gray-50 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none py-2 px-4 transition-colors duration-200 ease-in-out"
                  value={data.link}
                  onChange={(e) => setData({ ...data, link: e.target.value })}
                  placeholder="Enter URL (if applicable)"
                />
              </div>
              
              <div className="space-y-1 md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Notice Description
                </label>
                <textarea
                  id="description"
                  rows="4"
                  className="w-full bg-gray-50 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none py-2 px-4 transition-colors duration-200 ease-in-out resize-none"
                  value={data.description}
                  onChange={(e) => setData({ ...data, description: e.target.value })}
                  placeholder="Enter notice details"
                ></textarea>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Notice Type
                </label>
                <select
                  id="type"
                  className="w-full bg-gray-50 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none py-2 px-4 transition-colors duration-200 ease-in-out"
                  value={data.type}
                  onChange={(e) => setData({ ...data, type: e.target.value })}
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={edit ? updateNoticehandler : addNoticehandler}
                disabled={isLoading}
                className={`px-6 py-2 rounded-md ${
                  edit ? "bg-green-600" : "bg-blue-600"
                } text-white hover:bg-opacity-90 transition-colors ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Processing..." : edit ? "Update Notice" : "Add Notice"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Notice;