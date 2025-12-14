import React, { useState, useEffect } from "react";
import {
  FileText,
  Eye,
  Check,
  X,
  Filter,
  Download,
  Upload,
  Search,
  RotateCcw,
} from "lucide-react";

interface Booking {
  id: string;
  name: string;
  consultationType: string;
  modeOfConsultation: string;
  consultationDate: string;
  consultationTime: string;
  dob: string;
  tob: string;
  pob: string;
  pinCode: string;
  contactNo: string;
  countryCode: string;
  purpose: string;
  pdfUrl?: string;
  uploadedFiles?: UploadedFile[];
  status: "pending" | "consulted" | "cancelled";
  createdAt: string;
}

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

const ConsultationAdmin: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const API_BASE = "https://api.rahuldev.live/api/v1/admin";

  const [filter, setFilter] = useState<
    "all" | "pending" | "consulted" | "cancelled"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingBookingId, setUploadingBookingId] = useState<string | null>(
    null
  );
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const res = await fetch(`${API_BASE}/consultations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token") ?? ""}`,
        },
      });

      const json = await res.json();

      const mapped: Booking[] = json.data.map((item: any) => ({
        id: String(item.id),
        name: item.fullName,
        consultationType: item.consultationType,
        modeOfConsultation: item.preferredMode,
        consultationDate: item.consultationDate,
        consultationTime: item.timeSlot
          ? `${item.timeSlot.startTime} - ${item.timeSlot.endTime}`
          : "N/A",
        dob: item.dateOfBirth?.split("T")[0],
        tob: item.timeOfBirth,
        pob: item.placeOfBirth,
        pinCode: item.pinCode,
        contactNo: item.phoneNumber,
        countryCode: "", // already included in phoneNumber
        purpose: buildPurpose(item),
        pdfUrl: item.signature ?? undefined,
        uploadedFiles: [],
        status: normalizeStatus(item.status),
        createdAt: item.createdAt,
      }));

      setBookings(mapped);
    } catch (err) {
      console.error("Failed to load consultations", err);
    }
  };
  const buildPurpose = (item: any) => {
    const purposes = [];

    if (item.careerGuidance) purposes.push("Career Guidance");
    if (item.loveLife) purposes.push("Love Life");
    if (item.marriageLife) purposes.push("Marriage Life");
    if (item.healthWellbeing) purposes.push("Health");
    if (item.financialCondition) purposes.push("Finance");
    if (item.business) purposes.push("Business");
    if (item.spiritualGrowth) purposes.push("Spiritual Growth");
    if (item.others && item.others !== "NA") purposes.push(item.others);

    return purposes.join(", ") || "General Consultation";
  };
  const normalizeStatus = (
    status: string
  ): "pending" | "consulted" | "cancelled" => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "pending";
      case "consulted":
        return "consulted";
      case "cancelled":
        return "cancelled";
      default:
        return "pending";
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter = filter === "all" ? true : booking.status === filter;
    const matchesSearch =
      searchQuery === "" ||
      booking.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.consultationType
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      booking.contactNo.includes(searchQuery) ||
      booking.purpose.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = async (
    id: string,
    newStatus: "consulted" | "cancelled" | "pending"
  ) => {
    await fetch(`${API_BASE}/consultations/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_token") ?? ""}`,
      },
      body: JSON.stringify({
        status:
          newStatus === "consulted"
            ? "Consulted"
            : newStatus === "cancelled"
            ? "Cancelled"
            : "Confirmed",
      }),
    });

    fetchConsultations();
    setSelectedBooking(null);
  };

  const handleFileUpload = (bookingId: string) => {
    setUploadingBookingId(bookingId);
    setShowUploadModal(true);
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleUploadSubmit = () => {
    if (!selectedFiles || !uploadingBookingId) return;

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map(
      (file, index) => ({
        id: `file-${Date.now()}-${index}`,
        name: file.name,
        url: URL.createObjectURL(file), // In production, this would be your uploaded file URL
        uploadedAt: new Date().toISOString(),
      })
    );

    setBookings(
      bookings.map((booking) => {
        if (booking.id === uploadingBookingId) {
          return {
            ...booking,
            uploadedFiles: [...(booking.uploadedFiles || []), ...newFiles],
          };
        }
        return booking;
      })
    );

    setShowUploadModal(false);
    setSelectedFiles(null);
    setUploadingBookingId(null);
  };

  const handleApproveWithUpload = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking && booking.uploadedFiles && booking.uploadedFiles.length > 0) {
      handleStatusChange(bookingId, "consulted");
    } else {
      alert("Please upload at least one file before approving.");
    }
  };

  const handleDisapprove = (bookingId: string) => {
    if (
      confirm("Are you sure you want to move this booking back to pending?")
    ) {
      handleStatusChange(bookingId, "pending");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "consulted":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Consultation Bookings
          </h1>
          <p className="text-gray-600">
            Manage and track all consultation appointments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Bookings</div>
            <div className="text-2xl font-bold text-gray-900">
              {bookings.length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter((b) => b.status === "pending").length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Consulted</div>
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter((b) => b.status === "consulted").length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Cancelled</div>
            <div className="text-2xl font-bold text-red-600">
              {bookings.filter((b) => b.status === "cancelled").length}
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, type, contact, or purpose..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-600" />
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === "pending"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter("consulted")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === "consulted"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Consulted
              </button>
              <button
                onClick={() => setFilter("cancelled")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === "cancelled"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Mode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Files
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {booking.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {booking.consultationType}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {booking.modeOfConsultation}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div>{booking.consultationDate}</div>
                      <div className="text-xs text-gray-500">
                        {booking.consultationTime}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {booking.countryCode} {booking.contactNo}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {booking.uploadedFiles?.length || 0} files
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleFileUpload(booking.id)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                              title="Upload Files"
                            >
                              <Upload className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleApproveWithUpload(booking.id)
                              }
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Approve & Mark as Consulted"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(booking.id, "cancelled")
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {booking.status === "consulted" && (
                          <button
                            onClick={() => handleDisapprove(booking.id)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                            title="Move back to Pending"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Upload Files
                  </h2>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setSelectedFiles(null);
                      setUploadingBookingId(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Files (PDF, Images, Documents)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFilesSelected}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {selectedFiles && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Selected Files: {selectedFiles.length}
                      </p>
                      <ul className="space-y-1">
                        {Array.from(selectedFiles).map((file, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-600 flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            {file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUploadSubmit}
                      disabled={!selectedFiles || selectedFiles.length === 0}
                      className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Upload Files
                    </button>
                    <button
                      onClick={() => {
                        setShowUploadModal(false);
                        setSelectedFiles(null);
                        setUploadingBookingId(null);
                      }}
                      className="px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Booking Details
                  </h2>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">
                        Name
                      </label>
                      <p className="text-gray-900">{selectedBooking.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">
                        Consultation Type
                      </label>
                      <p className="text-gray-900">
                        {selectedBooking.consultationType}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">
                        Mode
                      </label>
                      <p className="text-gray-900">
                        {selectedBooking.modeOfConsultation}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">
                        Date
                      </label>
                      <p className="text-gray-900">
                        {selectedBooking.consultationDate}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">
                        Time
                      </label>
                      <p className="text-gray-900">
                        {selectedBooking.consultationTime}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">
                        Date of Birth
                      </label>
                      <p className="text-gray-900">{selectedBooking.dob}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">
                        Time of Birth
                      </label>
                      <p className="text-gray-900">{selectedBooking.tob}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">
                        Place of Birth
                      </label>
                      <p className="text-gray-900">{selectedBooking.pob}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">
                        Pin Code
                      </label>
                      <p className="text-gray-900">{selectedBooking.pinCode}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">
                        Contact Number
                      </label>
                      <p className="text-gray-900">
                        {selectedBooking.countryCode}{" "}
                        {selectedBooking.contactNo}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Purpose
                    </label>
                    <p className="text-gray-900">{selectedBooking.purpose}</p>
                  </div>

                  {selectedBooking.pdfUrl && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">
                        Client's Attached Document
                      </label>
                      <a
                        href={selectedBooking.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-1"
                      >
                        <FileText className="w-4 h-4" />
                        View PDF Document
                      </a>
                    </div>
                  )}

                  {selectedBooking.uploadedFiles &&
                    selectedBooking.uploadedFiles.length > 0 && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600 block mb-2">
                          Uploaded Files ({selectedBooking.uploadedFiles.length}
                          )
                        </label>
                        <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                          {selectedBooking.uploadedFiles.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between bg-white p-2 rounded"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-gray-900">
                                  {file.name}
                                </span>
                              </div>
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-sm"
                              >
                                View
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="flex items-center gap-2 pt-4">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                        selectedBooking.status
                      )}`}
                    >
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t">
                  {selectedBooking.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleFileUpload(selectedBooking.id)}
                        className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition flex items-center justify-center gap-2"
                      >
                        <Upload className="w-5 h-5" />
                        Upload Files
                      </button>
                      <button
                        onClick={() =>
                          handleApproveWithUpload(selectedBooking.id)
                        }
                        className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Approve
                      </button>
                    </>
                  )}

                  {selectedBooking.status === "consulted" && (
                    <button
                      onClick={() => handleDisapprove(selectedBooking.id)}
                      className="flex-1 bg-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-orange-700 transition flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Move to Pending
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationAdmin;
