import React, { useEffect, useState } from "react";
import { api } from "../utils/api";

interface Booking {
  id: number;
  consultationType: string;
  preferredMode: string;
  consultationDate: string;
  timeSlot: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  country: string;
  state: string;
  city: string;
  pinCode: string;
  phoneNumber: string;
  emailAddress: string;
  careerGuidance: boolean;
  loveLife: boolean;
  marriageLife: boolean;
  healthWellbeing: boolean;
  financialCondition: boolean;
  business: boolean;
  spiritualGrowth: boolean;
  others: string | null;
  consultedBefore: boolean;
  specificQuestions: string | null;
  openToRemedies: string;
  declarationAccepted: boolean;
  signature: string | null;
  declarationDate: string | null;
  onlineFee: number | null;
  offlineFee: number | null;
  bookingAmount: number;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

const BookingPanel = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);

  function openModal(b: Booking) {
    setSelectedBooking(b);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedBooking(null);
  }

  useEffect(() => {
    api
      .get("/bookings")
      .then((res) => {
        setBookings(res.data.data);
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Bookings</h2>

      {/* GRID OF CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-white shadow-md rounded-lg p-5 border border-gray-200"
          >
            <h3 className="text-xl font-semibold mb-2">
              {b.fullName} ({b.gender})
            </h3>

            <p className="text-sm text-gray-600 mb-1">
              <strong>Consultation:</strong> {b.consultationType}
            </p>

            <p className="text-sm text-gray-600 mb-1">
              <strong>Mode:</strong> {b.preferredMode}
            </p>

            <p className="text-sm text-gray-600 mb-1">
              <strong>Date:</strong> {b.consultationDate || "Not Selected"}
            </p>

            <p className="text-sm text-gray-600 mb-1">
              <strong>Time Slot:</strong> {b.timeSlot}
            </p>

            <p className="text-sm text-gray-600 mb-1">
              <strong>Phone:</strong> {b.phoneNumber}
            </p>

            <p className="text-sm text-gray-600 mb-1">
              <strong>Email:</strong> {b.emailAddress}
            </p>

            <p className="text-sm text-gray-600 mb-1">
              <strong>Payment Status:</strong>{" "}
              <span
                className={`font-semibold ${
                  b.paymentStatus === "Paid" ? "text-green-600" : "text-red-600"
                }`}
              >
                {b.paymentStatus}
              </span>
            </p>

            <p className="text-sm text-gray-600 mb-3">
              <strong>Amount:</strong> ₹{b.bookingAmount}
            </p>

            <button
              onClick={() => openModal(b)}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
            >
              ×
            </button>

            <h2 className="text-2xl font-semibold mb-4">Booking Details</h2>

            <div className="space-y-3 text-sm">
              {Object.entries(selectedBooking).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b pb-2">
                  <span className="font-medium capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                  <span className="text-gray-700">
                    {value === null || value === "" ? "—" : value.toString()}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={closeModal}
              className="mt-6 w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPanel;
