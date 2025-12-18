"use client";

import { useEffect, useState } from "react";

interface ServiceItem {
  title: string;
  description: string;
  imageUrl: string | null;
}

export default function ServicesManager() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  /* ----------------------------------
     LOAD SERVICES
  ---------------------------------- */
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const res = await fetch("https://api.rahuldev.live/api/v1/cms");
      const { data } = await res.json();

      const cms = data.find((item: any) => item.section === "services_offered");

      if (cms?.content) {
        const parsed = JSON.parse(cms.content);
        setServices(parsed.services || []);
      }
    } catch (err) {
      console.error("Failed to load services", err);
    }
  };

  /* ----------------------------------
     IMAGE UPLOAD
  ---------------------------------- */
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.rahuldev.live/upload-file", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
      },
      body: formData,
    });

    const data = await res.json();
    return data.url;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingIndex === null || !e.target.files?.[0]) return;

    const imageUrl = await uploadImage(e.target.files[0]);

    const updated = [...services];
    updated[editingIndex].imageUrl = imageUrl;
    setServices(updated);
  };

  /* ----------------------------------
     CRUD (LOCAL)
  ---------------------------------- */
  const addService = () => {
    setServices([...services, { title: "", description: "", imageUrl: null }]);
    setEditingIndex(services.length);
  };

  const updateField = (
    index: number,
    field: keyof ServiceItem,
    value: string
  ) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const deleteService = (index: number) => {
    if (!confirm("Delete service?")) return;
    setServices(services.filter((_, i) => i !== index));
  };

  /* ----------------------------------
     SAVE ALL (ONE CLICK)
  ---------------------------------- */
  const saveAll = async () => {
    setLoading(true);
    try {
      await fetch(
        "https://api.rahuldev.live/api/v1/admin/cms/services_offered",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
          body: JSON.stringify({
            content: JSON.stringify({ services }),
            imageUrl: null,
          }),
        }
      );

      alert("Services saved successfully");
      setEditingIndex(null);
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------
     UI
  ---------------------------------- */
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Services Offered</h1>

      <button
        onClick={addService}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        + Add Service
      </button>

      <div className="space-y-4">
        {services.map((s, i) => (
          <div key={i} className="border rounded-lg p-4 bg-white shadow">
            <input
              className="w-full border p-2 rounded mb-2"
              placeholder="Title"
              value={s.title}
              onChange={(e) => updateField(i, "title", e.target.value)}
            />

            <textarea
              className="w-full border p-2 rounded mb-2"
              rows={3}
              placeholder="Description"
              value={s.description}
              onChange={(e) => updateField(i, "description", e.target.value)}
            />

            <input type="file" onChange={handleImageUpload} />

            {s.imageUrl && (
              <img
                src={s.imageUrl}
                className="w-16 h-16 mt-2 rounded object-cover"
              />
            )}

            <button
              onClick={() => deleteService(i)}
              className="mt-3 text-red-600 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={saveAll}
        disabled={loading}
        className="mt-6 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {loading ? "Saving..." : "Save All Services"}
      </button>
    </div>
  );
}
