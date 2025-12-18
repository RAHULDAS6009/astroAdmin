import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Loader,
} from "lucide-react";

// Types
interface Student {
  id: number;
  studentId: string;
  name: string;
  email: string;
  gender: string;
  courseId: number;
  branchId: string;
  rollNo: number;
  gurdianName: string;
  relationWithGurdain: string;
  courseMode: string;
  courseDetails: string;
  communicationAddress: string;
  permanentAddress: string;
  mobileNumber: string;
  whatsappNumber: string;
  dateOfBirth: string;
  placeOfBirth: string;
  educationalQualification: string;
  extraExperience: string;
  astrologicalExperience: string;
  occupation: string;
  photoUrl: string | null;
  certificateUrl: string | null;
  idProofUrl: string | null;
  createdAt: string;
}

export default function AdmissionTakenPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [courseFilter, setCourseFilter] = useState<string>("ALL");
  const uniqueCourseDetails = [
    "ALL",
    ...new Set(students.map((s) => s.courseDetails).filter(Boolean)),
  ];

  const [documentModal, setDocumentModal] = useState<{
    type: string;
    url: string;
  } | null>(null);
  const [quickViewStudent, setQuickViewStudent] = useState<Student | null>(
    null
  );

  const itemsPerPage = 10;
  const API_BASE_URL = "https://api.rahuldev.live/api/v1";

  // Fetch students from API
  useEffect(() => {
    fetchStudents();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, modeFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_BASE_URL}/admin/students`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      setStudents(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load student data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Get unique course modes for filter - FIXED
  const uniqueModes = [
    "ALL",
    ...new Set(students.map((s) => s.courseMode).filter(Boolean)),
  ];

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.mobileNumber.includes(searchTerm) ||
      student.gurdianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMode =
      modeFilter === "ALL" || student.courseMode === modeFilter;

    const matchesCourse =
      courseFilter === "ALL" || student.courseDetails === courseFilter;

    return matchesSearch && matchesMode && matchesCourse;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const handleViewDocument = (url: string | null, type: string) => {
    if (url) {
      setDocumentModal({ type, url });
    } else {
      alert(`${type} not available`);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading student records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-bold text-lg mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchStudents}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = async (student: Student) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete student "${student.name}"?\nThis action cannot be undone!`
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("admin_token");

      const res = await fetch(`${API_BASE_URL}/admin/students/${student.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        alert("Failed to delete student");
        return;
      }

      alert("Student deleted successfully.");

      // Refresh list
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-full mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Admission Records
          </h1>

          {/* Filters and Search */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by name, student ID, mobile, email, guardian..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Mode Filter */}
            <div>
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {uniqueModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode === "ALL" ? "All Modes" : mode}
                  </option>
                ))}
              </select>
            </div>
            {/* Course Details Filter */}
            <div>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {uniqueCourseDetails.map((c) => (
                  <option key={c} value={c}>
                    {c === "ALL" ? "All Courses" : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          {filteredStudents.length > 0 ? (
            <div className="mb-4 text-sm text-gray-600">
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredStudents.length)} of{" "}
              {filteredStudents.length} students
            </div>
          ) : (
            <div className="mb-4 text-center py-8">
              <p className="text-gray-500 text-lg">No students found</p>
              {(searchTerm || modeFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setModeFilter("ALL");
                  }}
                  className="mt-2 text-indigo-600 hover:text-indigo-800 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Table */}
          {filteredStudents.length > 0 && (
            <>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-max w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                        View
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                        Delete
                      </th>

                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Student ID
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Roll No
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Name
                      </th>

                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Gender
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Email
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Guardian Name
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Relation
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Mode
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Course Details
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Mobile No
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Whatsapp Number
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        DOB
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        POB
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Education
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Extra Exp
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Astrology Exp
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Occupation
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Communication Address
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Permanent Address
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Photo
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Certificate
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                        ID Proof
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.map((student, index) => (
                      <tr
                        key={student.id}
                        className={`border-b border-gray-200 hover:bg-blue-50 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          <button
                            onClick={() => setQuickViewStudent(student)}
                            className="text-indigo-600 hover:text-indigo-800"
                            title="Quick View"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => handleDelete(student)}
                            className="text-red-600 hover:text-red-800 font-bold"
                            title="Delete Student"
                          >
                            Delete
                          </button>
                        </td>

                        <td className="px-3 py-2 text-xs text-gray-800 font-medium whitespace-nowrap">
                          {student.studentId}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-800 whitespace-nowrap">
                          {student.rollNo}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-800 whitespace-nowrap">
                          {student.name}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-800 whitespace-nowrap">
                          {student.gender}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-800 whitespace-nowrap">
                          {student.email}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-800 whitespace-nowrap">
                          {student.gurdianName}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                          {student.relationWithGurdain}
                        </td>
                        <td className="px-3 py-2 text-xs whitespace-nowrap">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {student.courseMode}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-800 whitespace-nowrap">
                          {student.courseDetails}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                          {student.mobileNumber}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                          {student.whatsappNumber}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                          {formatDate(student.dateOfBirth)}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                          {student.placeOfBirth}
                        </td>
                        <td
                          className="px-3 py-2 text-xs text-gray-600 max-w-xs truncate"
                          title={student.educationalQualification}
                        >
                          {student.educationalQualification}
                        </td>
                        <td
                          className="px-3 py-2 text-xs text-gray-600 max-w-xs truncate"
                          title={student.extraExperience}
                        >
                          {student.extraExperience}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                          {student.astrologicalExperience}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                          {student.occupation}
                        </td>
                        <td
                          className="px-3 py-2 text-xs text-gray-600 max-w-xs truncate"
                          title={student.communicationAddress}
                        >
                          {student.communicationAddress}
                        </td>
                        <td
                          className="px-3 py-2 text-xs text-gray-600 max-w-xs truncate"
                          title={student.permanentAddress}
                        >
                          {student.permanentAddress}
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          {student.photoUrl ? (
                            <button
                              onClick={() =>
                                handleViewDocument(student.photoUrl, "Photo")
                              }
                              className="text-blue-600 hover:text-blue-800"
                              title="View Photo"
                            >
                              <Eye size={18} />
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          {student.certificateUrl ? (
                            <button
                              onClick={() =>
                                handleViewDocument(
                                  student.certificateUrl,
                                  "Certificate"
                                )
                              }
                              className="text-green-600 hover:text-green-800"
                              title="View Certificate"
                            >
                              <Eye size={18} />
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          {student.idProofUrl ? (
                            <button
                              onClick={() =>
                                handleViewDocument(
                                  student.idProofUrl,
                                  "ID Proof"
                                )
                              }
                              className="text-purple-600 hover:text-purple-800"
                              title="View ID Proof"
                            >
                              <Eye size={18} />
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                    Previous
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 rounded-lg ${
                            currentPage === pageNum
                              ? "bg-indigo-600 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick View Modal */}
        {quickViewStudent && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
            onClick={() => setQuickViewStudent(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Student Details - {quickViewStudent.name}
                </h2>
                <button
                  onClick={() => setQuickViewStudent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={26} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Student ID:</strong> {quickViewStudent.studentId}
                  </p>
                  <p>
                    <strong>Roll No:</strong> {quickViewStudent.rollNo}
                  </p>
                  <p>
                    <strong>Email:</strong> {quickViewStudent.email}
                  </p>
                  <p>
                    <strong>Course Mode:</strong> {quickViewStudent.courseMode}
                  </p>
                  <p>
                    <strong>Course Details:</strong>{" "}
                    {quickViewStudent.courseDetails}
                  </p>
                  <p>
                    <strong>Guardian:</strong> {quickViewStudent.gurdianName}
                  </p>
                  <p>
                    <strong>Relation:</strong>{" "}
                    {quickViewStudent.relationWithGurdain}
                  </p>
                  <p>
                    <strong>Mobile:</strong> {quickViewStudent.mobileNumber}
                  </p>
                  <p>
                    <strong>DOB:</strong>{" "}
                    {formatDate(quickViewStudent.dateOfBirth)}
                  </p>
                  <p>
                    <strong>POB:</strong> {quickViewStudent.placeOfBirth}
                  </p>
                </div>

                <div>
                  <p>
                    <strong>Education:</strong>{" "}
                    {quickViewStudent.educationalQualification}
                  </p>
                  <p>
                    <strong>Extra Experience:</strong>{" "}
                    {quickViewStudent.extraExperience}
                  </p>
                  <p>
                    <strong>Astrology Experience:</strong>{" "}
                    {quickViewStudent.astrologicalExperience}
                  </p>
                  <p>
                    <strong>Occupation:</strong> {quickViewStudent.occupation}
                  </p>
                  <p>
                    <strong>Communication Address:</strong>{" "}
                    {quickViewStudent.communicationAddress}
                  </p>
                  <p>
                    <strong>Permanent Address:</strong>{" "}
                    {quickViewStudent.permanentAddress}
                  </p>
                  <p>
                    <strong>Created At:</strong>{" "}
                    {formatDate(quickViewStudent.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="font-medium mb-1">Photo</p>
                    {quickViewStudent.photoUrl ? (
                      <img
                        src={quickViewStudent.photoUrl}
                        className="w-full rounded-lg shadow cursor-pointer"
                        onClick={() =>
                          handleViewDocument(quickViewStudent.photoUrl, "Photo")
                        }
                        alt="Student Photo"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">No Photo</span>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="font-medium mb-1">Certificate</p>
                    {quickViewStudent.certificateUrl ? (
                      <>
                        {quickViewStudent.certificateUrl.endsWith(".pdf") ? (
                          <iframe
                            src={quickViewStudent.certificateUrl}
                            className="w-full h-[80vh] rounded-lg border"
                          />
                        ) : (
                          <img
                            src={quickViewStudent.certificateUrl}
                            className="max-w-full h-auto mx-auto rounded-lg border"
                            alt="ID Proof"
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">No Certificate</span>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="font-medium mb-1">ID Proof</p>
                    {quickViewStudent.idProofUrl ? (
                      <>
                        {quickViewStudent.idProofUrl.endsWith(".pdf") ? (
                          <iframe
                            src={quickViewStudent.idProofUrl}
                            className="w-full h-[80vh] rounded-lg border"
                          />
                        ) : (
                          <img
                            src={quickViewStudent.idProofUrl}
                            className="max-w-full h-auto mx-auto rounded-lg border"
                            alt="ID Proof"
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">No ID Proof</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Modal */}
        {documentModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            onClick={() => setDocumentModal(null)}
          >
            <div
              className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  {documentModal.type}
                </h2>
                <button
                  onClick={() => setDocumentModal(null)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                {documentModal.url?.endsWith(".pdf") ? (
                  <iframe
                    src={documentModal.url}
                    className="w-full h-[80vh] rounded-lg border mx-auto"
                  />
                ) : (
                  <img
                    src={documentModal.url}
                    alt={documentModal.type}
                    className="max-w-full h-auto mx-auto rounded-lg border"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
