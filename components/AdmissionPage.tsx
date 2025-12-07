import React, { useState } from "react";
import { Search, Eye, X, ChevronLeft, ChevronRight } from "lucide-react";

// Types
interface Student {
  id: string;
  name: string;
  guardianName: string;
  relationWithGuardian: string;
  mode: "ONLINE" | "OFFLINE";
  batchCode: string;
  rollNo: string;
  commonAddress: string;
  permanentAddress: string;
  mobileNo: string;
  whatsappNo: string;
  dob: string;
  tob: string;
  pob: string;
  educationQualification: string;
  extraExperience: string;
  astrologyExp: string;
  occupation: string;
  photo: string;
  certificate: string;
  idProof: string;
}

// Sample data
const sampleStudents: Student[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    guardianName: "Suresh Sharma",
    relationWithGuardian: "Father",
    mode: "OFFLINE",
    batchCode: "BATCH-2024-01",
    rollNo: "STU001",
    commonAddress: "123 Park Street, Kolkata",
    permanentAddress: "456 Main Road, Delhi",
    mobileNo: "+91 9876543210",
    whatsappNo: "+91 9876543210",
    dob: "1995-06-15",
    tob: "10:30 AM",
    pob: "Mumbai",
    educationQualification: "Bachelor of Arts",
    extraExperience: "2 years teaching",
    astrologyExp: "Beginner",
    occupation: "Teacher",
    photo: "https://via.placeholder.com/300x400/4F46E5/FFFFFF?text=Photo",
    certificate:
      "https://via.placeholder.com/600x800/10B981/FFFFFF?text=Certificate",
    idProof: "https://via.placeholder.com/600x400/8B5CF6/FFFFFF?text=ID+Proof",
  },
  {
    id: "2",
    name: "Priya Mehta",
    guardianName: "Rakesh Mehta",
    relationWithGuardian: "Father",
    mode: "ONLINE",
    batchCode: "BATCH-2024-02",
    rollNo: "STU002",
    commonAddress: "789 Lake View, Bangalore",
    permanentAddress: "789 Lake View, Bangalore",
    mobileNo: "+91 8765432109",
    whatsappNo: "+91 8765432109",
    dob: "1998-03-22",
    tob: "02:15 PM",
    pob: "Bangalore",
    educationQualification: "Master of Commerce",
    extraExperience: "None",
    astrologyExp: "Intermediate",
    occupation: "Accountant",
    photo: "https://via.placeholder.com/300x400/EF4444/FFFFFF?text=Photo",
    certificate:
      "https://via.placeholder.com/600x800/F59E0B/FFFFFF?text=Certificate",
    idProof: "https://via.placeholder.com/600x400/EC4899/FFFFFF?text=ID+Proof",
  },
  {
    id: "3",
    name: "Amit Kumar",
    guardianName: "Rajesh Kumar",
    relationWithGuardian: "Father",
    mode: "OFFLINE",
    batchCode: "BATCH-2024-01",
    rollNo: "STU003",
    commonAddress: "45 MG Road, Pune",
    permanentAddress: "45 MG Road, Pune",
    mobileNo: "+91 7654321098",
    whatsappNo: "+91 7654321098",
    dob: "1997-08-10",
    tob: "06:45 AM",
    pob: "Pune",
    educationQualification: "Bachelor of Science",
    extraExperience: "1 year IT experience",
    astrologyExp: "Advanced",
    occupation: "Software Engineer",
    photo: "https://via.placeholder.com/300x400/3B82F6/FFFFFF?text=Photo",
    certificate:
      "https://via.placeholder.com/600x800/06B6D4/FFFFFF?text=Certificate",
    idProof: "https://via.placeholder.com/600x400/14B8A6/FFFFFF?text=ID+Proof",
  },
];

export default function AdmissionTakenPage() {
  const [students] = useState<Student[]>(sampleStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState<"ALL" | "ONLINE" | "OFFLINE">(
    "ALL"
  );
  const [batchFilter, setBatchFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [documentModal, setDocumentModal] = useState<{
    type: string;
    url: string;
  } | null>(null);
  const itemsPerPage = 10;

  // Get unique batch codes for filter
  const uniqueBatches = ["ALL", ...new Set(students.map((s) => s.batchCode))];

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.mobileNo.includes(searchTerm) ||
      student.guardianName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMode = modeFilter === "ALL" || student.mode === modeFilter;
    const matchesBatch =
      batchFilter === "ALL" || student.batchCode === batchFilter;

    return matchesSearch && matchesMode && matchesBatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const handleViewDocument = (url: string, type: string) => {
    setDocumentModal({ type, url });
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
                  placeholder="Search by name, roll no, mobile, guardian..."
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
                onChange={(e) => setModeFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Modes</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>

            {/* Batch Filter */}
            <div>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {uniqueBatches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch === "ALL" ? "All Batches" : batch}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {startIndex + 1}-
            {Math.min(endIndex, filteredStudents.length)} of{" "}
            {filteredStudents.length} students
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-max w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                    Roll No
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                    Name
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
                    Batch Code
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                    Common Address
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                    Permanent Address
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                    Mobile No
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                    WhatsApp No
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                    DOB
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                    TOB
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
                    <td className="px-3 py-2 text-xs text-gray-800 font-medium whitespace-nowrap">
                      {student.rollNo}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-800 whitespace-nowrap">
                      {student.name}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-800 whitespace-nowrap">
                      {student.guardianName}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                      {student.relationWithGuardian}
                    </td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.mode === "ONLINE"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {student.mode}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-800 whitespace-nowrap">
                      {student.batchCode}
                    </td>
                    <td
                      className="px-3 py-2 text-xs text-gray-600 max-w-xs truncate"
                      title={student.commonAddress}
                    >
                      {student.commonAddress}
                    </td>
                    <td
                      className="px-3 py-2 text-xs text-gray-600 max-w-xs truncate"
                      title={student.permanentAddress}
                    >
                      {student.permanentAddress}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                      {student.mobileNo}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                      {student.whatsappNo}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                      {student.dob}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                      {student.tob}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                      {student.pob}
                    </td>
                    <td
                      className="px-3 py-2 text-xs text-gray-600 max-w-xs truncate"
                      title={student.educationQualification}
                    >
                      {student.educationQualification}
                    </td>
                    <td
                      className="px-3 py-2 text-xs text-gray-600 max-w-xs truncate"
                      title={student.extraExperience}
                    >
                      {student.extraExperience}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                      {student.astrologyExp}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                      {student.occupation}
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleViewDocument(student.photo, "Photo")
                        }
                        className="text-blue-600 hover:text-blue-800"
                        title="View Photo"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleViewDocument(student.certificate, "Certificate")
                        }
                        className="text-green-600 hover:text-green-800"
                        title="View Certificate"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleViewDocument(student.idProof, "ID Proof")
                        }
                        className="text-purple-600 hover:text-purple-800"
                        title="View ID Proof"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
        </div>

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
                <img
                  src={documentModal.url}
                  alt={documentModal.type}
                  className="max-w-full h-auto mx-auto"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
