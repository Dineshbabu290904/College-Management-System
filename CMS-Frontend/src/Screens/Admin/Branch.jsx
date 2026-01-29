import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { MdOutlineDelete } from "react-icons/md";
import { FiPlusCircle, FiList } from "react-icons/fi";
import Heading from "../../components/Heading";
import { baseApiURL } from "../../baseUrl";

const Branch = () => {
  const [data, setData] = useState({
    name: "",
  });
  const [selected, setSelected] = useState("add");
  const [branch, setBranch] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getBranchHandler();
  }, []);

  const getBranchHandler = () => {
    setIsLoading(true);
    axios
      .get(`${baseApiURL()}/branch/getBranch`)
      .then((response) => {
        setIsLoading(false);
        if (response.data.success) {
          setBranch(response.data.branches);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.log(error);
        toast.error(error.message);
      });
  };

  const addBranchHandler = () => {
    if (!data.name.trim()) {
      toast.error("Branch name cannot be empty");
      return;
    }
    
    setIsLoading(true);
    toast.loading("Adding Branch");
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .post(`${baseApiURL()}/branch/addBranch`, data, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        setIsLoading(false);
        if (response.data.success) {
          toast.success(response.data.message);
          setData({ name: "" });
          getBranchHandler();
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

  const deleteBranchHandler = (id) => {
    const alert = prompt("Are You Sure? Type CONFIRM to continue");
    if (alert === "CONFIRM") {
      setIsLoading(true);
      toast.loading("Deleting Branch");
      const headers = {
        "Content-Type": "application/json",
      };
      axios
        .delete(`${baseApiURL()}/branch/deleteBranch/${id}`, {
          headers: headers,
        })
        .then((response) => {
          toast.dismiss();
          setIsLoading(false);
          if (response.data.success) {
            toast.success(response.data.message);
            getBranchHandler();
          } else {
            toast.error(response.data.message);
          }
        })
        .catch((error) => {
          toast.dismiss();
          setIsLoading(false);
          toast.error(error.response.data.message);
        });
    }
  };

  const AddBranchForm = () => (
    <div className="w-full animate-fadeIn">
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Branch Name
          </label>
          <input
            type="text"
            id="name"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            className="w-full bg-gray-50 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none py-2 px-4 transition-colors duration-200 ease-in-out"
            placeholder="Enter branch name"
          />
        </div>
        <button
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          onClick={addBranchHandler}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Add Branch"}
        </button>
      </div>
    </div>
  );

  const ViewBranchList = () => (
    <div className="w-full animate-fadeIn">
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-pulse text-blue-600">Loading branches...</div>
        </div>
      ) : branch && branch.length > 0 ? (
        <ul className="bg-white rounded-md overflow-hidden divide-y divide-gray-200">
          {branch.map((item, index) => (
            <li
              key={index}
              className="flex justify-between items-center py-3 px-6 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium">{item.name}</div>
              <button
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                onClick={() => deleteBranchHandler(item._id)}
                title="Delete Branch"
              >
                <MdOutlineDelete size={20} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No branches available. Add a branch to get started.
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-10">
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center w-full border-b pb-5 mb-5">
          <div className="mb-4 md:mb-0">
            <Heading title="Branch Management" />
            <p className="text-gray-500 text-sm mt-1">Add or view department branches</p>
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
              <FiPlusCircle className="mr-2" />
              Add Branch
            </button>
            <button
              className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 ${
                selected === "view"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setSelected("view")}
            >
              <FiList className="mr-2" />
              View Branches
            </button>
          </div>
        </div>
        
        <div className="mt-4">
          {selected === "add" && <AddBranchForm />}
          {selected === "view" && <ViewBranchList />}
        </div>
      </div>
    </div>
  );
};

export default Branch;