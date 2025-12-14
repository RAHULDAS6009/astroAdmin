"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Lock,
  Unlock,
  Plus,
  RefreshCw,
  Info,
} from "lucide-react";

/* ================= TYPES ================= */

type ViewType = "manage" | "generate";

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  isBlocked: boolean;
}

interface GenerateForm {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
}

/* ================= CONFIG ================= */

const API_BASE = "https://api.astrokama.com/api/v1/admin";

/* ================= COMPONENT ================= */

const AdminSlotManager: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>("manage");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [generateForm, setGenerateForm] = useState<GenerateForm>({
    date: "",
    startTime: "09:00",
    endTime: "18:00",
    duration: 30,
  });

  const headers = (): HeadersInit => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("admin_token") ?? ""}`,
  });

  /* ================= EFFECTS ================= */

  useEffect(() => {
    if (selectedDate) {
      fetchSlots();
    }
  }, [selectedDate]);

  /* ================= API ================= */

  const fetchSlots = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/slots?date=${selectedDate}`, {
        headers: headers(),
      });
      const data = await res.json();
      setSlots(data?.data ?? []);
    } catch (err) {
      console.error("Error fetching slots:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSlots = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/slots/generate`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(generateForm),
      });

      if (res.ok) {
        alert("✅ Slots generated successfully!");
        setSelectedDate(generateForm.date);
        setCurrentView("manage");
        fetchSlots();
      }
    } catch {
      alert("❌ Error generating slots");
    } finally {
      setLoading(false);
    }
  };

  const toggleSlot = (id: string): void => {
    setSelectedSlots((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllAvailable = (): void => {
    const availableIds = slots
      .filter((s) => !s.isBooked && !s.isBlocked)
      .map((s) => s.id);

    setSelectedSlots(availableIds);
  };

  const blockSlots = async (): Promise<void> => {
    if (!selectedSlots.length) return alert("Please select slots first");

    setLoading(true);
    try {
      await fetch(`${API_BASE}/slots/block`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ slotIds: selectedSlots }),
      });
      alert("✅ Slots blocked successfully");
      setSelectedSlots([]);
      fetchSlots();
    } finally {
      setLoading(false);
    }
  };

  const unblockSlots = async (): Promise<void> => {
    if (!selectedSlots.length) return alert("Please select slots first");

    setLoading(true);
    try {
      await fetch(`${API_BASE}/slots/unblock`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ slotIds: selectedSlots }),
      });
      alert("✅ Slots unblocked successfully");
      setSelectedSlots([]);
      fetchSlots();
    } finally {
      setLoading(false);
    }
  };

  const blockFullDay = async (): Promise<void> => {
    if (!selectedDate) return;

    const ids = slots.filter((s) => !s.isBooked).map((s) => s.id);
    if (!ids.length) return alert("No available slots to block");

    setLoading(true);
    try {
      await fetch(`${API_BASE}/slots/block`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ slotIds: ids }),
      });
      alert("✅ Full day blocked successfully");
      fetchSlots();
    } finally {
      setLoading(false);
    }
  };

  const unblockFullDay = async (): Promise<void> => {
    const ids = slots.filter((s) => s.isBlocked).map((s) => s.id);
    if (!ids.length) return alert("No blocked slots to unblock");

    setLoading(true);
    try {
      await fetch(`${API_BASE}/slots/unblock`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ slotIds: ids }),
      });
      alert("✅ Full day unblocked successfully");
      fetchSlots();
    } finally {
      setLoading(false);
    }
  };

  /* ================= STATS ================= */

  const stats = {
    total: slots.length,
    booked: slots.filter((s) => s.isBooked).length,
    blocked: slots.filter((s) => s.isBlocked).length,
    available: slots.filter((s) => !s.isBooked && !s.isBlocked).length,
  };

  /* ================= JSX ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Calendar className="text-indigo-600" size={32} />
                Appointment Slot Manager
              </h1>
              <p className="text-gray-500 mt-1">
                Manage your booking availability
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView("manage")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  currentView === "manage"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Manage Slots
              </button>
              <button
                onClick={() => setCurrentView("generate")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  currentView === "generate"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Plus size={20} />
                Create Slots
              </button>
            </div>
          </div>
        </div>

        {/* Manage View */}
        {currentView === "manage" && (
          <div className="space-y-6">
            {/* Date Selector */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select a Date
              </label>
              <div className="flex gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-lg"
                />
                {selectedDate && (
                  <button
                    onClick={fetchSlots}
                    disabled={loading}
                    className="px-6 py-3 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition-all flex items-center gap-2"
                  >
                    <RefreshCw
                      size={20}
                      className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                  </button>
                )}
              </div>
            </div>

            {selectedDate && slots.length > 0 && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow p-5">
                    <div className="text-3xl font-bold text-gray-800">
                      {stats.total}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Total Slots
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-xl shadow p-5 border-2 border-green-200">
                    <div className="text-3xl font-bold text-green-700">
                      {stats.available}
                    </div>
                    <div className="text-sm text-green-600 mt-1">Available</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl shadow p-5 border-2 border-blue-200">
                    <div className="text-3xl font-bold text-blue-700">
                      {stats.booked}
                    </div>
                    <div className="text-sm text-blue-600 mt-1">Booked</div>
                  </div>
                  <div className="bg-red-50 rounded-xl shadow p-5 border-2 border-red-200">
                    <div className="text-3xl font-bold text-red-700">
                      {stats.blocked}
                    </div>
                    <div className="text-sm text-red-600 mt-1">Blocked</div>
                  </div>
                </div>

                {/* Legend */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
                  <div className="flex items-start gap-2 mb-3">
                    <Info className="text-indigo-600 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        How to use:
                      </h3>
                      <p className="text-sm text-gray-600">
                        Click on slots to select them, then use the buttons
                        below to block or unblock
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-100 border-2 border-green-400 rounded"></div>
                      <span className="text-gray-700">
                        Available (clickable)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 border-2 border-blue-400 rounded"></div>
                      <span className="text-gray-700">Booked (locked)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-red-100 border-2 border-red-400 rounded"></div>
                      <span className="text-gray-700">Blocked (clickable)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-indigo-600 border-2 border-indigo-700 rounded"></div>
                      <span className="text-gray-700">Selected</span>
                    </div>
                  </div>
                </div>

                {/* Slots Grid */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Time Slots
                    </h3>
                    {selectedSlots.length > 0 && (
                      <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                        {selectedSlots.length} selected
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {slots.map((slot) => {
                      const isSelected = selectedSlots.includes(slot.id);
                      return (
                        <button
                          key={slot.id}
                          disabled={slot.isBooked}
                          onClick={() => toggleSlot(slot.id)}
                          className={`p-4 rounded-xl font-medium transition-all ${
                            slot.isBooked
                              ? "bg-blue-100 border-2 border-blue-300 text-blue-700 cursor-not-allowed opacity-60"
                              : slot.isBlocked
                              ? isSelected
                                ? "bg-indigo-600 text-white border-2 border-indigo-700 shadow-lg scale-105"
                                : "bg-red-100 border-2 border-red-300 text-red-700 hover:shadow-md hover:scale-105"
                              : isSelected
                              ? "bg-indigo-600 text-white border-2 border-indigo-700 shadow-lg scale-105"
                              : "bg-green-100 border-2 border-green-300 text-green-700 hover:shadow-md hover:scale-105"
                          }`}
                        >
                          <div className="text-sm font-bold">
                            {slot.startTime}
                          </div>
                          <div className="text-xs opacity-75">
                            {slot.endTime}
                          </div>
                          {slot.isBooked && (
                            <div className="text-xs mt-1">Booked</div>
                          )}
                          {slot.isBlocked && !isSelected && (
                            <div className="text-xs mt-1">Blocked</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Actions
                  </h3>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        onClick={selectAllAvailable}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                      >
                        Select All Available
                      </button>
                      <button
                        onClick={() => setSelectedSlots([])}
                        disabled={selectedSlots.length === 0}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Clear Selection
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        onClick={blockSlots}
                        disabled={selectedSlots.length === 0 || loading}
                        className="px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        <Lock size={20} />
                        Block Selected Slots
                      </button>
                      <button
                        onClick={unblockSlots}
                        disabled={selectedSlots.length === 0 || loading}
                        className="px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        <Unlock size={20} />
                        Unblock Selected Slots
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        onClick={blockFullDay}
                        disabled={loading}
                        className="px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                      >
                        <Lock size={20} />
                        Block Entire Day
                      </button>
                      <button
                        onClick={unblockFullDay}
                        disabled={loading}
                        className="px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                      >
                        <Unlock size={20} />
                        Unblock Entire Day
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedDate && slots.length === 0 && !loading && (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No slots found
                </h3>
                <p className="text-gray-500 mb-6">
                  There are no slots for this date yet.
                </p>
                <button
                  onClick={() => {
                    setGenerateForm({ ...generateForm, date: selectedDate });
                    setCurrentView("generate");
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold inline-flex items-center gap-2"
                >
                  <Plus size={20} />
                  Create Slots for This Date
                </button>
              </div>
            )}

            {!selectedDate && (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Select a date to begin
                </h3>
                <p className="text-gray-500">
                  Choose a date above to view and manage slots
                </p>
              </div>
            )}
          </div>
        )}

        {/* Generate View */}
        {currentView === "generate" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Create New Slots
              </h2>
              <p className="text-gray-500 mb-6">
                Generate appointment slots for a specific date
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={generateForm.date}
                    onChange={(e) =>
                      setGenerateForm({ ...generateForm, date: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={generateForm.startTime}
                      onChange={(e) =>
                        setGenerateForm({
                          ...generateForm,
                          startTime: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={generateForm.endTime}
                      onChange={(e) =>
                        setGenerateForm({
                          ...generateForm,
                          endTime: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Slot Duration (minutes)
                  </label>
                  <select
                    value={generateForm.duration}
                    onChange={(e) =>
                      setGenerateForm({
                        ...generateForm,
                        duration: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-lg"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <div className="flex gap-2">
                    <Info
                      className="text-indigo-600 flex-shrink-0 mt-0.5"
                      size={20}
                    />
                    <div className="text-sm text-indigo-800">
                      <strong>Preview:</strong> This will create slots from{" "}
                      {generateForm.startTime} to {generateForm.endTime}, with
                      each slot lasting {generateForm.duration} minutes.
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerateSlots}
                  disabled={!generateForm.date || loading}
                  className="w-full px-6 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Generate Slots
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSlotManager;
