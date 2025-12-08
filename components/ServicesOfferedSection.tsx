"use client";
import { useState } from "react";

interface Service {
  title: string;
  description: string;
  iconImage: string | null;
}

interface FormState {
  title: string;
  description: string;
  iconImage: string | null;
}

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    iconImage: null,
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, iconImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!form.title || !form.description) {
      alert("Please fill in title and description");
      return;
    }

    if (editingIndex !== null) {
      const updatedList = [...services];
      updatedList[editingIndex] = form as Service;
      setServices(updatedList);
      setEditingIndex(null);
    } else {
      setServices([...services, form as Service]);
    }

    setForm({ title: "", description: "", iconImage: null });
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setForm(services[index]);
  };

  const handleDelete = (index: number) => {
    if (!window.confirm("Delete this service?")) return;
    setServices(services.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-5">Manage Services</h1>

      <div className="bg-gray-100 p-5 rounded-lg space-y-4">
        <input
          className="w-full p-2 border rounded"
          placeholder="Service Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="Service Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium mb-2">Upload Icon</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-2 border rounded bg-white"
          />
          {form.iconImage && (
            <div className="mt-2">
              <img
                src={form.iconImage}
                className="w-20 h-20 object-cover rounded"
                alt="Preview"
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {editingIndex !== null ? "Update Service" : "Add Service"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {services.map((s, i) => (
          <div key={i} className="p-4 shadow border rounded bg-white">
            {s.iconImage && (
              <img
                src={s.iconImage}
                className="w-14 h-14 mb-2 object-cover rounded"
                alt="icon"
              />
            )}

            <h2 className="text-xl font-bold">{s.title}</h2>
            <p className="text-gray-700 mt-1">{s.description}</p>

            <div className="flex gap-3 mt-3">
              <button
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                onClick={() => handleEdit(i)}
              >
                Edit
              </button>

              <button
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => handleDelete(i)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
