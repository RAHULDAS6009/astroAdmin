import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import axios from "axios";

const API = "http://localhost:5000/api";

interface Location {
  id: string;
  location: string;
  createdAt?: string;
}

const BranchManagementPage = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [newLocation, setNewLocation] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const res = await axios.get(`${API}/locations`);
    setLocations(res.data);
  };

  const addLocation = async () => {
    if (!newLocation.trim()) return alert("Enter location");

    const res = await axios.post(`${API}/location`, {
      location: newLocation,
    });

    setLocations((prev) => [res.data, ...prev]);
    setNewLocation("");
  };

  const startEdit = (loc: Location) => {
    setEditingId(loc.id);
    setEditingValue(loc.location);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const saveEdit = async (loc: Location) => {
    await axios.put(`${API}/location`, {
      oldName: loc.location,
      newName: editingValue,
    });

    setLocations((prev) =>
      prev.map((l) => (l.id === loc.id ? { ...l, location: editingValue } : l))
    );

    cancelEdit();
  };

  const deleteLocation = async (loc: Location) => {
    if (!confirm(`Delete "${loc.location}"?`)) return;

    await axios.delete(`${API}/location`, {
      data: { location: loc.location },
    });

    setLocations((prev) => prev.filter((l) => l.id !== loc.id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Location Management</h1>

      {/* Add */}
      <div className="flex gap-3 mb-6">
        <input
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          className="border px-4 py-2 rounded w-full"
          placeholder="Enter location name"
        />
        <button
          onClick={addLocation}
          className="bg-blue-600 text-white px-4 rounded flex items-center gap-2"
        >
          <Plus size={18} /> Add
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="flex justify-between items-center border p-3 rounded"
          >
            {editingId === loc.id ? (
              <>
                <input
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  className="border px-2 py-1 rounded w-full mr-4"
                />
                <button onClick={() => saveEdit(loc)}>
                  <Save />
                </button>
                <button onClick={cancelEdit}>
                  <X />
                </button>
              </>
            ) : (
              <>
                <span className="font-medium">{loc.location}</span>
                <div className="flex gap-3">
                  <button onClick={() => startEdit(loc)}>
                    <Edit2 />
                  </button>
                  <button onClick={() => deleteLocation(loc)}>
                    <Trash2 />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 font-semibold">Total Locations: {locations.length}</p>
    </div>
  );
};

export default BranchManagementPage;
