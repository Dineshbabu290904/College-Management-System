import axios from "axios";
import React, { useEffect, useState } from "react";
import Heading from "../../components/Heading";
import toast from "react-hot-toast";
import { BiArrowBack } from "react-icons/bi";
import { baseApiURL } from "../../baseUrl";

const Marks = () => {
  const [subject, setSubject] = useState([]);
  const [branch, setBranch] = useState([]);
  const [studentData, setStudentData] = useState();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState({
    branch: "",
    semester: "",
    subject: "",
    examType: "",
  });

  const loadStudentDetails = () => {
    // Validate all fields are selected
    if (!selected.branch || !selected.semester || !selected.subject || !selected.examType) {
      toast.error("Please select all fields");
      return;
    }

    setLoading(true);
    const headers = {
      "Content-Type": "application/json",
    };
    
    toast.loading("Loading student data...");
    
    axios
      .post(
        `${baseApiURL()}/student/details/getDetails`,
        { branch: selected.branch, semester: selected.semester },
        { headers }
      )
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          setStudentData(response.data.user);
          toast.success("Student data loaded successfully");
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        console.error(error);
        toast.error(error.message || "Failed to load student data");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const submitMarksHandler = () => {
    let isValid = true;
    let container = document.getElementById("markContainer");
    
    // Validate all marks are entered
    container.childNodes.forEach((enroll) => {
      const markInput = document.getElementById(enroll.id + "marks");
      if (!markInput.value) {
        markInput.classList.add("border-red-500");
        isValid = false;
      } else {
        markInput.classList.remove("border-red-500");
      }
    });

    if (!isValid) {
      toast.error("Please enter marks for all students");
      return;
    }

    toast.loading("Uploading marks...");
    
    // Submit marks for each student
    container.childNodes.forEach((enroll) => {
      setStudentMarksHandler(
        enroll.id,
        document.getElementById(enroll.id + "marks").value
      );
    });
  };

  const setStudentMarksHandler = (enrollment, value) => {
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .post(
        `${baseApiURL()}/marks/addMarks`,
        {
          enrollmentNo: enrollment,
          [selected.examType]: {
            [selected.subject]: value,
          },
        },
        { headers }
      )
      .then((response) => {
        if (response.data.success) {
          toast.dismiss();
          toast.success(response.data.message);
        } else {
          toast.dismiss();
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        console.error(error);
        toast.error(error.message || "Failed to upload marks");
      });
  };

  const getBranchData = () => {
    toast.loading("Loading branches...");
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .get(`${baseApiURL()}/branch/getBranch`, { headers })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          setBranch(response.data.branches);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        console.error(error);
        toast.error(error.message || "Failed to load branches");
      });
  };

  const getSubjectData = () => {
    toast.loading("Loading subjects...");
    axios
      .get(`${baseApiURL()}/subject/getSubject`)
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          setSubject(response.data.subject);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.message || "Failed to load subjects");
      });
  };

  useEffect(() => {
    getBranchData();
    getSubjectData();
  }, []);

  const resetValueHandler = () => {
    setStudentData(null);
  };

  return (
    <div className="w-full mx-auto flex justify-center items-start flex-col my-10 max-w-7xl px-4">
      <div className="relative flex justify-between items-center w-full">
        <Heading title={`Upload Student Marks`} />
        {studentData && (
          <button
            className="absolute right-2 flex justify-center items-center border-2 border-red-500 px-3 py-2 rounded-md text-red-500 hover:bg-red-50 transition-colors"
            onClick={resetValueHandler}
          >
            <span className="mr-2">
              <BiArrowBack className="text-red-500" />
            </span>
            Back to Selection
          </button>
        )}
      </div>
      
      {!studentData && (
        <div className="bg-white shadow-md rounded-lg p-6 w-full mt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Selection Criteria</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="w-full">
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <select
                id="branch"
                className="px-3 bg-gray-50 py-2 rounded-md text-gray-900 w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={selected.branch}
                onChange={(e) =>
                  setSelected({ ...selected, branch: e.target.value })
                }
              >
                <option value="">-- Select Branch --</option>
                {branch &&
                  branch.map((branch) => (
                    <option value={branch.name} key={branch.name}>
                      {branch.name}
                    </option>
                  ))}
              </select>
            </div>
            
            <div className="w-full">
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>
              <select
                id="semester"
                className="px-3 bg-gray-50 py-2 rounded-md text-gray-900 w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={selected.semester}
                onChange={(e) =>
                  setSelected({ ...selected, semester: e.target.value })
                }
              >
                <option value="">-- Select Semester --</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option value={sem} key={sem}>
                    {sem}{sem === 1 ? "st" : sem === 2 ? "nd" : sem === 3 ? "rd" : "th"} Semester
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                id="subject"
                className="px-3 bg-gray-50 py-2 rounded-md text-gray-900 w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={selected.subject}
                onChange={(e) =>
                  setSelected({ ...selected, subject: e.target.value })
                }
              >
                <option value="">-- Select Subject --</option>
                {subject &&
                  subject.map((subject) => (
                    <option value={subject.name} key={subject.name}>
                      {subject.name}
                    </option>
                  ))}
              </select>
            </div>
            
            <div className="w-full">
              <label htmlFor="examType" className="block text-sm font-medium text-gray-700 mb-1">
                Exam Type
              </label>
              <select
                id="examType"
                className="px-3 bg-gray-50 py-2 rounded-md text-gray-900 w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={selected.examType}
                onChange={(e) =>
                  setSelected({ ...selected, examType: e.target.value })
                }
              >
                <option value="">-- Select Exam Type --</option>
                <option value="internal">Internal</option>
                <option value="external">External</option>
              </select>
            </div>
          </div>
          
          <button
            className={`mt-6 px-6 py-2.5 rounded-md text-white font-medium transition-all ${
              loading 
                ? "bg-blue-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            }`}
            onClick={loadStudentDetails}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load Student Data"}
          </button>
        </div>
      )}
      
      {studentData && studentData.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 w-full mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Upload Marks
            </h2>
            <p className="text-gray-600 mt-1">
              {selected.examType.charAt(0).toUpperCase() + selected.examType.slice(1)} marks for {selected.subject} • {selected.branch} • Semester {selected.semester}
            </p>
          </div>
          
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            id="markContainer"
          >
            {studentData.map((student) => (
              <div
                key={student.enrollmentNo}
                className="flex flex-col border border-gray-200 rounded-md overflow-hidden shadow-sm"
                id={student.enrollmentNo}
              >
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <p className="font-medium text-gray-800">
                    {student.enrollmentNo}
                  </p>
                  <p className="text-sm text-gray-500">
                    {student.name || "Student Name"}
                  </p>
                </div>
                <div className="p-4">
                  <label htmlFor={`${student.enrollmentNo}marks`} className="block text-sm font-medium text-gray-700 mb-1">
                    Enter Marks
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter marks (0-100)"
                    id={`${student.enrollmentNo}marks`}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <button
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-6 py-2.5 mt-8 rounded-md text-white font-medium transition-all"
            onClick={submitMarksHandler}
          >
            Submit Marks
          </button>
        </div>
      )}
      
      {studentData && studentData.length === 0 && (
        <div className="w-full flex flex-col items-center justify-center bg-white shadow-md rounded-lg p-12 mt-6">
          <svg
            className="w-16 h-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mt-4">No Students Found</h3>
          <p className="text-gray-500 mt-1 text-center">
            There are no students registered for {selected.branch} - Semester {selected.semester}
          </p>
          <button
            className="mt-6 px-6 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition-all"
            onClick={resetValueHandler}
          >
            Go Back
          </button>
        </div>
      )}
    </div>
  );
};

export default Marks;