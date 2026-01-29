import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import Heading from "../../components/Heading";
import { baseApiURL } from "../../baseUrl";

const Marks = () => {
  const userData = useSelector((state) => state.userData);
  const [internal, setInternal] = useState();
  const [external, setExternal] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      setLoading(true);
      try {
        const headers = {
          "Content-Type": "application/json",
        };
        const response = await axios.post(
          `${baseApiURL()}/marks/getMarks`,
          { enrollmentNo: userData.enrollmentNo },
          { headers }
        );

        if (response.data.length !== 0) {
          setInternal(response.data.Mark[0].internal);
          setExternal(response.data.Mark[0].external);
        }
      } catch (error) {
        toast.error("Failed to load marks data");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, [userData.enrollmentNo]);

  // Calculate total marks for a subject
  const calculateTotal = (subject) => {
    const internalMark = internal && internal[subject] ? internal[subject] : 0;
    const externalMark = external && external[subject] ? external[subject] : 0;
    return internalMark + externalMark;
  };

  // Get grade based on total marks
  const getGrade = (total) => {
    if (total >= 90) return "A+";
    if (total >= 80) return "A";
    if (total >= 70) return "B+";
    if (total >= 60) return "B";
    if (total >= 50) return "C";
    if (total >= 40) return "D";
    return "F";
  };

  // Get all subjects from both internal and external
  const getAllSubjects = () => {
    const subjects = new Set();
    if (internal) {
      Object.keys(internal).forEach(subject => subjects.add(subject));
    }
    if (external) {
      Object.keys(external).forEach(subject => subjects.add(subject));
    }
    return Array.from(subjects);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 flex justify-center items-start flex-col mb-10 px-4">
      <Heading title={`Marks for Semester ${userData.semester}`} />
      
      {loading ? (
        <div className="w-full flex justify-center my-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : !internal && !external ? (
        <div className="w-full text-center my-16 bg-gray-50 rounded-lg p-8 shadow-sm">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          </svg>
          <p className="text-xl font-medium text-gray-600">No Marks Available At The Moment!</p>
          <p className="text-gray-500 mt-2">Check back later for updates on your academic performance.</p>
        </div>
      ) : (
        <div className="mt-8 w-full">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-800">Academic Performance</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Internal (40)</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">External (60)</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total (100)</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getAllSubjects().map((subject, index) => {
                    const internalMark = internal && internal[subject] !== undefined ? internal[subject] : "-";
                    const externalMark = external && external[subject] !== undefined ? external[subject] : "-";
                    const total = (internalMark !== "-" && externalMark !== "-") ? calculateTotal(subject) : "-";
                    const grade = total !== "-" ? getGrade(total) : "-";
                    
                    return (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                          {internalMark !== "-" ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${parseInt(internalMark) >= 20 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {internalMark}
                            </span>
                          ) : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                          {externalMark !== "-" ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${parseInt(externalMark) >= 30 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {externalMark}
                            </span>
                          ) : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
                          {total !== "-" ? total : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {grade !== "-" ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              grade === "F" ? "bg-red-100 text-red-800" :
                              grade.startsWith("A") ? "bg-green-100 text-green-800" :
                              grade.startsWith("B") ? "bg-blue-100 text-blue-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {grade}
                            </span>
                          ) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {internal && external && (
              <div className="bg-gray-50 px-6 py-4 border-t">
                <div className="flex flex-wrap justify-between items-center">
                  <div className="mb-2 md:mb-0">
                    <span className="text-sm font-medium text-gray-500">Total Subjects: </span>
                    <span className="text-sm font-medium text-gray-800">{getAllSubjects().length}</span>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-xs text-gray-600">Excellent</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-xs text-gray-600">Good</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span className="text-xs text-gray-600">Average</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-xs text-gray-600">Needs Improvement</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Marks;