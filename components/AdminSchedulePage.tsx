import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Filter,
  BarChart3,
  X,
} from "lucide-react";

interface TimeSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  slotType: string;
  isBooked: boolean;
  isBlocked: boolean;
  consultation?: {
    id: number;
    fullName: string;
    phoneNumber: string;
    consultationType: string;
  };
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1/admin";

const AdminSchedulePage = () => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    booked: 0,
    blocked: 0,
    available: 0,
  });
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "available" | "booked" | "blocked"
  >("all");

  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    startDate: "",
    endDate: "",
    skipWeekends: true,
    slotType: "full",
    timeSlots: [{ startTime: "09:00", endTime: "10:00", duration: 60 }],
  });

  const today = new Date().toISOString().split("T")[0];
  const threeMonthsLater = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const [dateRange, setDateRange] = useState({
    startDate: today,
    endDate: threeMonthsLater,
  });

  useEffect(() => {
    fetchSlots();
    fetchStats();
  }, [dateRange, filterStatus]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(filterStatus !== "all" && { status: filterStatus }),
      });

      const res = await fetch(`${API_BASE}/schedule/slots?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) setSlots(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      const res = await fetch(`${API_BASE}/schedule/slots/stats?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkCreate = async () => {
    try {
      const res = await fetch(`${API_BASE}/schedule/slots/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(bulkForm),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Created ${data.count} slots successfully!`);
        setShowBulkForm(false);
        fetchSlots();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create slots");
    }
  };

  const toggleBlockSlot = async (id: number, isBlocked: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/schedule/slots/${id}/block`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ isBlocked: !isBlocked }),
      });
      if (res.ok) fetchSlots();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSlot = async (id: number) => {
    if (!confirm("Delete this slot?")) return;
    try {
      const res = await fetch(`${API_BASE}/schedule/slots/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        fetchSlots();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addTimeSlot = () => {
    setBulkForm((prev) => ({
      ...prev,
      timeSlots: [
        ...prev.timeSlots,
        { startTime: "09:00", endTime: "10:00", duration: 60 },
      ],
    }));
  };

  const removeTimeSlot = (index: number) => {
    setBulkForm((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index),
    }));
  };

  const updateTimeSlot = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setBulkForm((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  const groupSlotsByDate = () => {
    return slots.reduce((acc, slot) => {
      const date = new Date(slot.date).toISOString().split("T")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(slot);
      return acc;
    }, {} as Record<string, TimeSlot[]>);
  };

  const groupedSlots = groupSlotsByDate();
  const sortedDates = Object.keys(groupedSlots).sort();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Schedule Management
          </h1>
          <p className="text-gray-600">
            Manage consultation time slots and availability
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Slots</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.available}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Booked</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.booked}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Blocked</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.blocked}
                </p>
              </div>
              <Lock className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Slots</option>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <button
              onClick={() => setShowBulkForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Slots
            </button>
          </div>
        </div>

        {/* Slots List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading slots...
            </div>
          ) : sortedDates.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No slots found for selected range
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedDates.map((date) => (
                <div key={date} className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {groupedSlots[date].map((slot) => (
                      <div
                        key={slot.id}
                        className={`p-4 rounded-lg border-2 ${
                          slot.isBooked
                            ? "bg-orange-50 border-orange-200"
                            : slot.isBlocked
                            ? "bg-red-50 border-red-200"
                            : "bg-green-50 border-green-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              slot.isBooked
                                ? "bg-orange-100 text-orange-800"
                                : slot.isBlocked
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {slot.isBooked
                              ? "Booked"
                              : slot.isBlocked
                              ? "Blocked"
                              : "Available"}
                          </span>
                        </div>

                        {slot.consultation && (
                          <div className="text-sm text-gray-600 mb-2">
                            <p className="font-medium">
                              {slot.consultation.fullName}
                            </p>
                            <p>{slot.consultation.phoneNumber}</p>
                            <p className="text-xs">
                              {slot.consultation.consultationType}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 mt-3">
                          {!slot.isBooked && (
                            <>
                              <button
                                onClick={() =>
                                  toggleBlockSlot(slot.id, slot.isBlocked)
                                }
                                className={`flex-1 px-3 py-1 text-sm rounded flex items-center justify-center gap-1 ${
                                  slot.isBlocked
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              >
                                {slot.isBlocked ? (
                                  <Unlock className="w-3 h-3" />
                                ) : (
                                  <Lock className="w-3 h-3" />
                                )}
                                {slot.isBlocked ? "Unblock" : "Block"}
                              </button>
                              <button
                                onClick={() => deleteSlot(slot.id)}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Create Modal */}
      {showBulkForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Create Time Slots</h2>
                <button
                  onClick={() => setShowBulkForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={bulkForm.startDate}
                      onChange={(e) =>
                        setBulkForm((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={bulkForm.endDate}
                      onChange={(e) =>
                        setBulkForm((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slot Type
                  </label>
                  <select
                    value={bulkForm.slotType}
                    onChange={(e) =>
                      setBulkForm((prev) => ({
                        ...prev,
                        slotType: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="full">Full Day</option>
                    <option value="half">Half Day</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={bulkForm.skipWeekends}
                    onChange={(e) =>
                      setBulkForm((prev) => ({
                        ...prev,
                        skipWeekends: e.target.checked,
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-gray-700">Skip Weekends</label>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Time Slots
                    </label>
                    <button
                      onClick={addTimeSlot}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Slot
                    </button>
                  </div>
                  <div className="space-y-2">
                    {bulkForm.timeSlots.map((slot, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) =>
                            updateTimeSlot(index, "startTime", e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) =>
                            updateTimeSlot(index, "endTime", e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="number"
                          value={slot.duration}
                          onChange={(e) =>
                            updateTimeSlot(
                              index,
                              "duration",
                              parseInt(e.target.value)
                            )
                          }
                          placeholder="mins"
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        {bulkForm.timeSlots.length > 1 && (
                          <button
                            onClick={() => removeTimeSlot(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleBulkCreate}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Slots
                  </button>
                  <button
                    onClick={() => setShowBulkForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedulePage;
