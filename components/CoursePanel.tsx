"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Save,
  Trash2,
  Plus,
  Upload,
} from "lucide-react";
import axios from "axios";

/* ================= TYPES ================= */

interface Course {
  id: number;
  ranking: number;
  name: string;
  description: string;
  bannerpdf: string;
  bannerimage: string | null;
  gridTitle: string[];
}

/* ================= CONFIG ================= */

const LIST_API = "http://localhost:5000/api/v1/admin/allcourse";
const UPDATE_API = "http://localhost:5000/api/v1/admin/course";
const DELETE_API = "http://localhost:5000/api/v1/admin/course";
const UPLOAD_API = "http://localhost:5000/upload-file";

/* ================= COMPONENT ================= */

const CourseManagementPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  /* ================= LOAD COURSES ================= */

  const loadCourses = async () => {
    const res = await fetch(LIST_API);
    const json = await res.json();
    if (json.success) setCourses(json.data);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  /* ================= HELPERS ================= */

  const updateCourseField = (
    index: number,
    field: keyof Course,
    value: any
  ) => {
    const copy = [...courses];
    copy[index] = { ...copy[index], [field]: value };
    setCourses(copy);
  };

  const updateGridTitle = (cIndex: number, gIndex: number, value: string) => {
    const copy = [...courses];
    copy[cIndex].gridTitle[gIndex] = value;
    setCourses(copy);
  };

  const addGridTitle = (index: number) => {
    const copy = [...courses];
    copy[index].gridTitle.push("");
    setCourses(copy);
  };

  const removeGridTitle = (cIndex: number, gIndex: number) => {
    const copy = [...courses];
    copy[cIndex].gridTitle.splice(gIndex, 1);
    setCourses(copy);
  };

  /* ================= FILE UPLOAD ================= */

  const uploadFile = async (
    file: File,
    courseIndex: number,
    field: "bannerpdf" | "bannerimage"
  ) => {
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(UPLOAD_API, {
      method: "POST",
      body: formData,
    });

    const json = await res.json();

    if (json.success && json.url) {
      updateCourseField(courseIndex, field, json.url);
    } else {
      alert("Upload failed");
    }

    setUploading(false);
  };

  /* ================= ACTIONS ================= */

  const saveCourse = async (course: Course) => {
    await fetch(`${UPDATE_API}/${course.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
      },
      body: JSON.stringify({
        ranking: course.ranking,
        name: course.name,
        description: course.description,
        bannerpdf: course.bannerpdf,
        bannerimage: course.bannerimage,
        gridTitle: course.gridTitle,
      }),
    });

    alert("Course updated successfully");
    loadCourses();
  };

  const deleteCourse = async (id: number) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    await axios.delete(`${DELETE_API}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
      },
    });

    alert("Course deleted");
    loadCourses();
  };

  /* ================= UI ================= */

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Course Management</h1>

      {courses.map((course, index) => (
        <div key={course.id} className="border rounded-lg mb-4 bg-white">
          {/* HEADER */}
          <div
            className="p-4 flex justify-between items-center cursor-pointer bg-gray-100"
            onClick={() => setOpenId(openId === course.id ? null : course.id)}
          >
            <div>
              <h2 className="font-semibold">{course.name}</h2>
              <p className="text-sm text-gray-500">Rank: {course.ranking}</p>
            </div>
            {openId === course.id ? <ChevronDown /> : <ChevronRight />}
          </div>

          {/* BODY */}
          {openId === course.id && (
            <div className="p-5 space-y-4">
              <NumberField
                label="Ranking"
                value={course.ranking}
                onChange={(v) => updateCourseField(index, "ranking", v)}
              />

              <Field
                label="Course Name"
                value={course.name}
                onChange={(v) => updateCourseField(index, "name", v)}
              />

              <TextArea
                label="Description"
                value={course.description}
                onChange={(v) => updateCourseField(index, "description", v)}
              />

              {/* PDF UPLOAD */}
              <FileUpload
                label="Banner PDF"
                accept=".pdf"
                currentUrl={course.bannerpdf}
                uploading={uploading}
                onUpload={(file) => uploadFile(file, index, "bannerpdf")}
              />

              {/* IMAGE UPLOAD */}
              <FileUpload
                label="Banner Image"
                accept="image/*"
                currentUrl={course.bannerimage}
                uploading={uploading}
                onUpload={(file) => uploadFile(file, index, "bannerimage")}
              />

              {/* GRID TITLES */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium">Grid Titles</label>
                  <button
                    onClick={() => addGridTitle(index)}
                    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>

                {course.gridTitle.map((g, gIndex) => (
                  <div key={gIndex} className="flex gap-2 mb-2">
                    <input
                      value={g}
                      onChange={(e) =>
                        updateGridTitle(index, gIndex, e.target.value)
                      }
                      className="border rounded px-2 py-1 flex-1"
                    />
                    <button
                      onClick={() => removeGridTitle(index, gIndex)}
                      className="text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => saveCourse(course)}
                  className="bg-green-600 text-white px-5 py-2 rounded flex items-center gap-2"
                >
                  <Save size={16} /> Save
                </button>

                <button
                  onClick={() => deleteCourse(course.id)}
                  className="bg-red-600 text-white px-5 py-2 rounded flex items-center gap-2"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CourseManagementPage;

/* ================= REUSABLE ================= */

const Field = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded px-3 py-2"
    />
  </div>
);

const NumberField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">{label}</label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="border rounded px-3 py-2"
    />
  </div>
);

const TextArea = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded px-3 py-2 min-h-[90px]"
    />
  </div>
);

const FileUpload = ({
  label,
  accept,
  currentUrl,
  uploading,
  onUpload,
}: {
  label: string;
  accept: string;
  currentUrl?: string | null;
  uploading: boolean;
  onUpload: (file: File) => void;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium">{label}</label>

    {currentUrl && (
      <a
        href={currentUrl}
        target="_blank"
        className="text-blue-600 text-sm underline"
      >
        View current file
      </a>
    )}

    <input
      type="file"
      accept={accept}
      disabled={uploading}
      onChange={(e) => {
        if (e.target.files?.[0]) {
          onUpload(e.target.files[0]);
        }
      }}
    />

    {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
  </div>
);
