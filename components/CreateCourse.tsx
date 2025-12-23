import React, { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import axios from "axios";

interface Course {
  rank: number;
  name: string;
  description: string;
  pdf: string | null;
  image: string | null;
  gridTitle: string[];
}

export default function CourseAdminPage() {
  const [course, setCourse] = useState<Course>({
    rank: 0,
    name: "",
    description: "",
    pdf: null,
    image: null,
    gridTitle: [""],
  });

  /* ================= GRID TITLES ================= */

  const addGridTitle = () => {
    setCourse((prev) => ({
      ...prev,
      gridTitle: [...prev.gridTitle, ""],
    }));
  };

  const updateGridTitle = (index: number, value: string) => {
    setCourse((prev) => ({
      ...prev,
      gridTitle: prev.gridTitle.map((t, i) => (i === index ? value : t)),
    }));
  };

  const removeGridTitle = (index: number) => {
    setCourse((prev) => ({
      ...prev,
      gridTitle: prev.gridTitle.filter((_, i) => i !== index),
    }));
  };

  /* ================= FILE UPLOAD ================= */

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "pdf" | "image"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      "http://localhost:5000/upload-file",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setCourse((prev) => ({
      ...prev,
      [type]: res.data.url,
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    const payload = {
      ranking: course.rank,
      name: course.name,
      description: course.description,
      bannerpdf: course.pdf,
      bannerimage: course.image,
      gridTitle: course.gridTitle,
    };

    console.log("FINAL PAYLOAD:", payload);

    await axios.post("http://localhost:5000/api/v1/admin/course", payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
      },
    });
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Course Admin</h1>

        {/* Course Rank */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Course Rank</label>
          <input
            type="number"
            value={course.rank}
            onChange={(e) =>
              setCourse({ ...course, rank: Number(e.target.value) })
            }
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Course Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Course Name</label>
          <input
            type="text"
            value={course.name}
            onChange={(e) => setCourse({ ...course, name: e.target.value })}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Description (Admin) */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Description (Admin)
          </label>
          <textarea
            value={course.description}
            onChange={(e) =>
              setCourse({ ...course, description: e.target.value })
            }
            rows={3}
            className="w-full border px-3 py-2 rounded"
            placeholder="Internal/admin description of the course"
          />
        </div>

        {/* PDF Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Upload PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileUpload(e, "pdf")}
          />
          {course.pdf && (
            <p className="text-green-600 text-sm mt-1">PDF uploaded</p>
          )}
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "image")}
          />
          {course.image && (
            <p className="text-green-600 text-sm mt-1">Image uploaded</p>
          )}
        </div>

        {/* Grid Titles */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Grid Titles</label>
            <button
              onClick={addGridTitle}
              className="flex items-center gap-1 text-blue-600"
            >
              <Plus size={16} /> Add
            </button>
          </div>

          {course.gridTitle.map((title, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={title}
                onChange={(e) => updateGridTitle(index, e.target.value)}
                className="flex-1 border px-3 py-2 rounded"
                placeholder={`Grid title ${index + 1}`}
              />
              <button
                onClick={() => removeGridTitle(index)}
                className="text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Save */}
        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white py-3 rounded flex items-center justify-center gap-2"
        >
          <Save size={18} /> Save Course
        </button>
      </div>
    </div>
  );
}
