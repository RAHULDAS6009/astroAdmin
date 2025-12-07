import React, { useEffect, useState } from "react";
import { api } from "../utils/api";

interface Review {
  id: number;
  rating: number;
  name: string | null;
  phoneno: string | null;
  email: string | null;
  feedback: string | null;
  status: string;
  imageUrl: string | null;
  clientId: number | null;
  createdAt: string;
}

const ReviewsPanel = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all reviews
  const fetchReviews = async () => {
    try {
      const res = await api.get("/reviews");
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Approve or Reject Review
  const handleStatusChange = async (
    id: number,
    status: "Approved" | "Rejected"
  ) => {
    try {
      await api.put(`/reviews/${id}`, { status });

      // Update UI instantly
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error("Error updating review:", err);
    }
  };

  if (loading) return <div className="p-6 text-lg">Loading reviews...</div>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white shadow rounded-lg p-5 border border-gray-200"
          >
            {/* Rating */}
            <p className="text-yellow-500 font-bold text-xl">
              ⭐ {review.rating}
            </p>

            {/* Name */}
            <h3 className="text-lg font-semibold mt-2">
              {review.name || "Anonymous User"}
            </h3>

            {/* Contact */}
            <p className="text-gray-600 text-sm">
              {review.email ? `📧 ${review.email}` : ""}
            </p>
            <p className="text-gray-600 text-sm">
              {review.phoneno ? `📞 ${review.phoneno}` : ""}
            </p>

            {/* Feedback */}
            <p className="mt-3 text-gray-700">{review.feedback}</p>

            {/* Status */}
            <p className="mt-4 text-sm">
              Status:{" "}
              <span
                className={`font-semibold ${
                  review.status === "Approved"
                    ? "text-green-600"
                    : review.status === "Rejected"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {review.status}
              </span>
            </p>

            {/* Created Date */}
            <p className="text-xs text-gray-400 mt-1">
              {new Date(review.createdAt).toLocaleString()}
            </p>

            {/* Buttons */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => handleStatusChange(review.id, "Approved")}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Approve
              </button>

              <button
                onClick={() => handleStatusChange(review.id, "Rejected")}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPanel;
