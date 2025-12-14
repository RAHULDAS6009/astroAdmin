"use client";
// CoursesAdminPanel.tsx
import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronRight,
  X,
  RefreshCw,
} from "lucide-react";
import axios from "axios";

/**
 * Full CRUD integrated Courses admin panel.
 * Endpoint base: http://api.astrokama.com/api/v1/admin
 *
 * Upload expectations:
 * - POST http://api.astrokama.com/api/v1/admin/upload
 * - form-data field: "file"
 * - response: { success: true, url: "http://api.astrokama.com/uploads/123.pdf" }
 */

/* ----------------------- Types ----------------------- */
export type CourseType = "ONLINE" | "OFFLINE";
export type ClassType = "WEEKLY" | "MONTHLY";

export interface DaysJson {
  mon?: boolean;
  tue?: boolean;
  wed?: boolean;
  thu?: boolean;
  fri?: boolean;
  sat?: boolean;
  sun?: boolean;
}

export interface Semester {
  id?: string;
  number: number;
  name: string;
  startDate: string;
  endDate: string;
  fees: number;
  lateFeeDate?: string | null;
  lateFeeFine?: number | null;
  admissionFee: number;
  branchId?: string;
}

export interface Branch {
  id?: string;
  branchCode: string;
  name: string;
  color: string;
  durationMonths: number;
  classType: ClassType;
  daysPerWeek?: number;
  classesPerMonth?: number;
  classHours: number;
  daysJson: DaysJson;
  semesters: Semester[];
}

export interface Course {
  id?: number;
  rank: number;
  name: string;
  type: CourseType;
  courseDuration: number;
  courseCode?: string;
  description: string;
  pdf: string | null; // will store full URL (http...) or filename depending on backend
  image: string | null; // will store full URL
  gridTitle: string[];
  module?: string;
  isActive?: boolean;
  branches: Branch[];
}

export const DAYS: Array<{ key: keyof DaysJson; label: string }> = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

/* ------------------- API Response Shape ------------------- */
interface ApiCourse {
  id: number;
  ranking: number;
  name: string;
  type: string; // "online" | "offline"
  description: string;
  duration: number;
  bannerpdf: string | null;
  bannerimage: string | null;
  courseCode: string;
  gridTitle: string[];
  courseType: string; // "ONLINE"|"OFFLINE"
  isActive?: boolean;
  branches: Array<{
    id: string;
    courseId?: number;
    name: string;
    color: string;
    branchCode: string;
    durationMonths: number;
    classType: string; // weekly/monthly
    daysPerClassType: number;
    classHour: number;
    daysJSON: string; // JSON string
    semsters: Array<{
      id: string;
      name: string;
      number: number;
      startDate: string;
      endDate: string;
      fees: number;
      lateFeeDate: string | null;
      lateFeeFine: number | null;
      admissionFee: number;
      branchId?: string;
    }>;
  }>;
}

/* ------------------- Helpers: map API -> UI ------------------- */
const parseDaysJson = (daysJsonString?: string): DaysJson => {
  if (!daysJsonString) return {};
  try {
    return JSON.parse(daysJsonString);
  } catch {
    return {};
  }
};

const mapApiCourse = (apiCourse: ApiCourse): Course => ({
  id: apiCourse.id,
  rank: apiCourse.ranking,
  name: apiCourse.name,
  type: (
    apiCourse.courseType ||
    apiCourse.type ||
    "ONLINE"
  ).toUpperCase() as CourseType,
  courseDuration: apiCourse.duration,
  courseCode: apiCourse.courseCode,
  description: apiCourse.description,
  pdf: apiCourse.bannerpdf || null,
  image: apiCourse.bannerimage || null,
  gridTitle: apiCourse.gridTitle || [],
  module: "",
  isActive: apiCourse.isActive ?? true,
  branches: (apiCourse.branches || []).map((b) => ({
    id: b.id,
    branchCode: b.branchCode,
    name: b.name,
    color: b.color || "#3b82f6",
    durationMonths: b.durationMonths,
    classType: (b.classType || "weekly").toUpperCase() as ClassType,
    daysPerWeek:
      (b.classType || "").toLowerCase() === "weekly"
        ? b.daysPerClassType
        : undefined,
    classesPerMonth:
      (b.classType || "").toLowerCase() === "monthly"
        ? b.daysPerClassType
        : undefined,
    classHours: b.classHour,
    daysJson: parseDaysJson(b.daysJSON),
    semesters: (b.semsters || []).map((s) => ({
      id: s.id,
      number: s.number,
      name: s.name,
      startDate: s.startDate,
      endDate: s.endDate,
      fees: s.fees,
      lateFeeDate: s.lateFeeDate ?? null,
      lateFeeFine: s.lateFeeFine ?? null,
      admissionFee: s.admissionFee,
      branchId: s.branchId,
    })),
  })),
});

/* ------------------- Helpers: map UI -> API payload ------------------- */
const mapCourseToApiPayload = (course: Course) => {
  return {
    ranking: course.rank,
    name: course.name,
    type: course.type.toLowerCase(),
    description: course.description,
    duration: course.courseDuration,
    bannerpdf: course.pdf || null,
    bannerimage: course.image || null,
    courseCode: course.courseCode || "",
    gridTitle: course.gridTitle || [],
    courseType: (course.type || "ONLINE").toUpperCase(),
    isActive: !!course.isActive,
    branches: (course.branches || []).map((b) => {
      const daysPerClassType =
        (b.classType === "WEEKLY" ? b.daysPerWeek : b.classesPerMonth) || 0;
      return {
        id: b.id,
        branchCode: b.branchCode,
        name: b.name,
        color: b.color,
        durationMonths: b.durationMonths,
        classType: b.classType.toLowerCase(),
        daysPerClassType,
        classHour: b.classHours,
        daysJSON: JSON.stringify(b.daysJson || {}),
        semsters: (b.semesters || []).map((s) => ({
          id: s.id,
          name: s.name,
          number: s.number,
          startDate: s.startDate,
          endDate: s.endDate,
          fees: s.fees,
          lateFeeDate: s.lateFeeDate || null,
          lateFeeFine: s.lateFeeFine || null,
          admissionFee: s.admissionFee,
          branchId: b.id,
        })),
      };
    }),
  };
};

/* ------------------- Axios instance helper ------------------- */
const api = axios.create({
  baseURL: "https://api.rahuldev.live/api/v1/admin",
  headers: { "Content-Type": "application/json" },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ------------------- Upload helper ------------------- */
const UPLOAD_URL = "https://api.rahuldev.live/upload-file"; // change if your route differs

/**
 * Uploads a file and returns the full URL returned by the API (or null).
 * Expects response: { success: true, url: "http://api.astrokama.com/uploads/123.pdf" }
 */
const uploadFile = async (file: File): Promise<string | null> => {
  try {
    const fd = new FormData();
    fd.append("file", file);
    const res = await axios.post(UPLOAD_URL, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.data?.success && res.data.url) {
      return res.data.url as string;
    }
    return null;
  } catch (err) {
    console.warn("uploadFile failed", err);
    return null;
  }
};

/* ------------------- Component ------------------- */
const CoursesAdminPanel: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<number | string>>(
    new Set()
  );
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(
    new Set()
  );
  const [saving, setSaving] = useState<boolean>(false);

  /* Fetch courses */
  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/course");
      if (res.data?.success && res.data.data) {
        const mapped = res.data.data.map((c: ApiCourse) => mapApiCourse(c));
        setCourses(mapped);
      } else {
        setError("Failed to fetch courses");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  /* ------------------- Local UI helpers ------------------- */
  const toggleCourse = (id: number | string) => {
    const s = new Set(expandedCourses);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpandedCourses(s);
  };

  const toggleBranch = (id: string) => {
    const s = new Set(expandedBranches);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpandedBranches(s);
  };

  const addCourseLocal = () => {
    const newCourse: Course = {
      rank: courses.length + 1,
      name: "New Course",
      type: "ONLINE",
      courseDuration: 0,
      description: "",
      pdf: null,
      image: null,
      gridTitle: [],
      module: "",
      isActive: true,
      branches: [],
    };
    setCourses((p) => [...p, newCourse]);
  };

  const updateCourseLocal = (index: number, updates: Partial<Course>) => {
    setCourses((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const deleteCourseLocal = (index: number) => {
    setCourses((prev) => prev.filter((_, i) => i !== index));
  };

  const addBranchLocal = (courseIndex: number) => {
    const newBranch: Branch = {
      branchCode: "BR" + Date.now(),
      name: "New Branch",
      color: "#3b82f6",
      durationMonths: 6,
      classType: "WEEKLY",
      daysPerWeek: 3,
      classHours: 2,
      daysJson: {},
      semesters: [],
    };
    setCourses((prev) => {
      const next = [...prev];
      next[courseIndex].branches.push(newBranch);
      return next;
    });
  };

  const updateBranchLocal = (
    courseIndex: number,
    branchIndex: number,
    updates: Partial<Branch>
  ) => {
    setCourses((prev) => {
      const next = [...prev];
      next[courseIndex].branches[branchIndex] = {
        ...next[courseIndex].branches[branchIndex],
        ...updates,
      };
      return next;
    });
  };

  const deleteBranchLocal = (courseIndex: number, branchIndex: number) => {
    setCourses((prev) => {
      const next = [...prev];
      next[courseIndex].branches.splice(branchIndex, 1);
      return next;
    });
  };

  const addSemesterLocal = (courseIndex: number, branchIndex: number) => {
    setCourses((prev) => {
      const next = [...prev];
      const branch = next[courseIndex].branches[branchIndex];
      const newSemester: Semester = {
        number: branch.semesters.length + 1,
        name: "New Sem",
        startDate: "",
        endDate: "",
        fees: 0,
        admissionFee: 0,
        lateFeeDate: null,
        lateFeeFine: null,
      };
      branch.semesters.push(newSemester);
      return next;
    });
  };

  const updateSemesterLocal = (
    courseIndex: number,
    branchIndex: number,
    semesterIndex: number,
    updates: Partial<Semester>
  ) => {
    setCourses((prev) => {
      const next = [...prev];
      next[courseIndex].branches[branchIndex].semesters[semesterIndex] = {
        ...next[courseIndex].branches[branchIndex].semesters[semesterIndex],
        ...updates,
      };
      return next;
    });
  };

  const deleteSemesterLocal = (
    courseIndex: number,
    branchIndex: number,
    semesterIndex: number
  ) => {
    setCourses((prev) => {
      const next = [...prev];
      next[courseIndex].branches[branchIndex].semesters.splice(
        semesterIndex,
        1
      );
      return next;
    });
  };

  const addGridTitleLocal = (courseIndex: number, title: string) => {
    setCourses((prev) => {
      const next = [...prev];
      next[courseIndex].gridTitle.push(title);
      return next;
    });
  };

  const removeGridTitleLocal = (courseIndex: number, index: number) => {
    setCourses((prev) => {
      const next = [...prev];
      next[courseIndex].gridTitle.splice(index, 1);
      return next;
    });
  };

  /* ------------------- API Actions ------------------- */

  // Create course (POST)
  const createCourse = async (courseIndex: number) => {
    setSaving(true);
    try {
      const course = courses[courseIndex];
      const payload = mapCourseToApiPayload(course);
      const res = await api.post("/course", payload);
      if (res.data?.success && res.data.data) {
        const updatedCourse = mapApiCourse(res.data.data);
        setCourses((prev) => {
          const next = [...prev];
          next[courseIndex] = updatedCourse;
          return next;
        });
        alert("Course created successfully");
      } else {
        throw new Error(res.data?.message || "Failed to create course");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  // Update course (PUT /course/:id)
  const updateCourseById = async (courseIndex: number) => {
    setSaving(true);
    try {
      const course = courses[courseIndex];
      if (!course.id) {
        await createCourse(courseIndex);
        return;
      }
      const payload = mapCourseToApiPayload(course);
      const res = await api.put(`/course/${course.id}`, payload);
      if (res.data?.success && res.data.data) {
        const updatedCourse = mapApiCourse(res.data.data);
        setCourses((prev) => {
          const next = [...prev];
          next[courseIndex] = updatedCourse;
          return next;
        });
        alert("Course updated successfully");
      } else {
        throw new Error(res.data?.message || "Failed to update course");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // Delete course (DELETE /course/:id) — if course has no id, only delete locally
  const deleteCourseById = async (courseIndex: number) => {
    const course = courses[courseIndex];
    if (!course) return;
    if (!course.id) {
      deleteCourseLocal(courseIndex);
      return;
    }
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      setSaving(true);
      const res = await api.delete(`/course/${course.id}`);
      if (res.data?.success) {
        deleteCourseLocal(courseIndex);
        alert("Course deleted");
      } else {
        throw new Error(res.data?.message || "Failed to delete");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  /* ------------------- UI Render ------------------- */
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchCourses}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg mx-auto"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // util: get display URL (if backend sometimes returns filename instead of full url)
  const normalizeUrl = (maybeUrl: string | null) => {
    if (!maybeUrl) return null;
    if (maybeUrl.startsWith("http")) return maybeUrl;
    // fallback: build using server base
    return `https://api.rahuldev.live/uploads/${maybeUrl}`;
  };

  // handle file input upload for image/pdf
  const handleFileUpload = async (
    file: File,
    courseIndex: number,
    field: "image" | "pdf"
  ) => {
    const uploadedUrl = await uploadFile(file);
    if (!uploadedUrl) {
      alert("Upload failed");
      return null;
    }
    // store returned url in local state
    updateCourseLocal(
      courseIndex,
      field === "image" ? { image: uploadedUrl } : { pdf: uploadedUrl }
    );

    // if course exists on server, auto-save the change
    const course = courses[courseIndex];
    if (course?.id) {
      try {
        setSaving(true);
        const payload = mapCourseToApiPayload({
          ...course,
          ...(field === "image"
            ? { image: uploadedUrl }
            : { pdf: uploadedUrl }),
        });
        const res = await api.put(`/course/${course.id}`, payload);
        if (res.data?.success && res.data.data) {
          const updated = mapApiCourse(res.data.data);
          setCourses((prev) => {
            const next = [...prev];
            next[courseIndex] = updated;
            return next;
          });
          alert(`${field === "image" ? "Image" : "PDF"} uploaded and saved.`);
        } else {
          alert("Uploaded but failed to save to server.");
        }
      } catch (err: any) {
        alert(
          err?.response?.data?.message || err?.message || "Upload save failed"
        );
      } finally {
        setSaving(false);
      }
    } else {
      // local only; admin can Create later
      alert("File uploaded locally. Click Create to persist course.");
    }
    return uploadedUrl;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Courses (CRUD)</h1>
          <div className="flex gap-2">
            <button
              onClick={fetchCourses}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              <RefreshCw size={20} /> Refresh
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={addCourseLocal}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
          >
            <Plus size={16} /> Add Course
          </button>
        </div>

        <div className="space-y-4">
          {courses.map((course, cIndex) => (
            <div
              key={course.id ?? `local-${cIndex}`}
              className="bg-white rounded-lg border shadow"
            >
              <div className="p-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-3 flex-1">
                  <button onClick={() => toggleCourse(cIndex)}>
                    {expandedCourses.has(cIndex) ? (
                      <ChevronDown />
                    ) : (
                      <ChevronRight />
                    )}
                  </button>

                  <input
                    type="text"
                    value={course.name}
                    onChange={(e) =>
                      updateCourseLocal(cIndex, { name: e.target.value })
                    }
                    className="text-lg font-semibold border-none focus:ring px-2 py-1"
                  />

                  <select
                    value={course.type}
                    onChange={(e) =>
                      updateCourseLocal(cIndex, {
                        type: e.target.value as CourseType,
                      })
                    }
                    className="px-2 py-1 border rounded"
                  >
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                  </select>

                  <div className="ml-2 text-sm text-gray-500">Rank</div>
                  <input
                    type="number"
                    value={course.rank}
                    onChange={(e) =>
                      updateCourseLocal(cIndex, {
                        rank: Number(e.target.value),
                      })
                    }
                    className="w-20 px-2 py-1 border rounded"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteCourseById(cIndex)}
                    className="text-red-600 hover:text-red-700"
                    disabled={saving}
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>

              {expandedCourses.has(cIndex) && (
                <div className="p-4 space-y-4">
                  {/* Banner Image + PDF */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Image */}
                    <div>
                      <label className="text-sm font-medium">
                        Banner Image
                      </label>

                      {course.image ? (
                        <div className="mt-2">
                          <img
                            src={String(normalizeUrl(course.image))}
                            alt="banner"
                            className="h-32 rounded border object-cover"
                          />
                          <div className="flex gap-2 items-center mt-1">
                            <button
                              onClick={() => {
                                updateCourseLocal(cIndex, { image: null });
                                // optionally save removal immediately
                                if (course.id) {
                                  updateCourseById(cIndex);
                                }
                              }}
                              className="text-red-600 text-sm underline"
                            >
                              Remove Image
                            </button>
                            <a
                              href={String(normalizeUrl(course.image))}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-blue-600 underline"
                            >
                              Open
                            </a>
                          </div>
                        </div>
                      ) : null}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          await handleFileUpload(f, cIndex, "image");
                          // clear input
                          (e.target as HTMLInputElement).value = "";
                        }}
                        className="mt-2 w-full border rounded px-3 py-2"
                      />
                    </div>

                    {/* PDF */}
                    <div>
                      <label className="text-sm font-medium">Banner PDF</label>

                      {course.pdf ? (
                        <div className="mt-2">
                          <a
                            href={String(normalizeUrl(course.pdf))}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline text-sm"
                          >
                            View PDF
                          </a>
                          <div className="inline-flex items-center gap-2 ml-2">
                            <button
                              onClick={() => {
                                updateCourseLocal(cIndex, { pdf: null });
                                if (course.id) updateCourseById(cIndex);
                              }}
                              className="text-red-600 text-sm underline"
                            >
                              Remove PDF
                            </button>
                          </div>
                        </div>
                      ) : null}

                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          await handleFileUpload(f, cIndex, "pdf");
                          (e.target as HTMLInputElement).value = "";
                        }}
                        className="mt-2 w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        value={course.description}
                        onChange={(e) =>
                          updateCourseLocal(cIndex, {
                            description: e.target.value,
                          })
                        }
                        className="w-full border rounded px-3 py-2"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Course Duration (Months)
                      </label>
                      <input
                        type="number"
                        value={course.courseDuration}
                        onChange={(e) =>
                          updateCourseLocal(cIndex, {
                            courseDuration: Number(e.target.value),
                          })
                        }
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Grid Titles</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {course.gridTitle.map((t, i) => (
                        <div
                          key={i}
                          className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                        >
                          <span>{t}</span>
                          <button
                            onClick={() => removeGridTitleLocal(cIndex, i)}
                            className="ml-2 hover:text-blue-900"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Add grid title (press Enter)"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = (
                            e.target as HTMLInputElement
                          ).value.trim();
                          if (val) {
                            addGridTitleLocal(cIndex, val);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                      className="border rounded px-3 py-2 mt-2 w-full"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold">Branches</h3>
                      <button
                        onClick={() => addBranchLocal(cIndex)}
                        className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        <Plus size={14} /> Add Branch
                      </button>
                    </div>

                    <div className="space-y-3">
                      {course.branches.map((branch, bIndex) => (
                        <div
                          key={branch.id ?? bIndex}
                          className="border rounded"
                        >
                          <div className="p-3 bg-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-3 flex-1">
                              <button
                                onClick={() => toggleBranch(branch.branchCode)}
                              >
                                {expandedBranches.has(branch.branchCode) ? (
                                  <ChevronDown size={18} />
                                ) : (
                                  <ChevronRight size={18} />
                                )}
                              </button>

                              <input
                                type="text"
                                value={branch.name}
                                onChange={(e) =>
                                  updateBranchLocal(cIndex, bIndex, {
                                    name: e.target.value,
                                  })
                                }
                                className="font-medium px-2 py-1 border rounded"
                              />

                              <input
                                type="color"
                                value={branch.color}
                                onChange={(e) =>
                                  updateBranchLocal(cIndex, bIndex, {
                                    color: e.target.value,
                                  })
                                }
                                className="w-8 h-8"
                              />

                              <input
                                type="text"
                                value={branch.branchCode || ""}
                                onChange={(e) =>
                                  updateBranchLocal(cIndex, bIndex, {
                                    branchCode: e.target.value,
                                  })
                                }
                                className="w-52 h-8 focus:outline-none ring-2 rounded-md px-2"
                              />
                            </div>

                            <button
                              onClick={() => deleteBranchLocal(cIndex, bIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {expandedBranches.has(branch.branchCode) && (
                            <div className="p-4 space-y-4">
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="text-xs">
                                    Duration (Months)
                                  </label>
                                  <input
                                    type="number"
                                    value={branch.durationMonths}
                                    onChange={(e) =>
                                      updateBranchLocal(cIndex, bIndex, {
                                        durationMonths: Number(e.target.value),
                                      })
                                    }
                                    className="w-full border rounded px-2 py-1"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs">Class Type</label>
                                  <select
                                    value={branch.classType}
                                    onChange={(e) =>
                                      updateBranchLocal(cIndex, bIndex, {
                                        classType: e.target.value as ClassType,
                                      })
                                    }
                                    className="w-full border rounded px-2 py-1"
                                  >
                                    <option value="WEEKLY">Weekly</option>
                                    <option value="MONTHLY">Monthly</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="text-xs">Class Hours</label>
                                  <input
                                    type="number"
                                    value={branch.classHours}
                                    onChange={(e) =>
                                      updateBranchLocal(cIndex, bIndex, {
                                        classHours: Number(e.target.value),
                                      })
                                    }
                                    className="w-full border rounded px-2 py-1"
                                  />
                                </div>
                              </div>

                              {branch.classType === "WEEKLY" && (
                                <div>
                                  <label className="text-xs">
                                    Days Per Week
                                  </label>
                                  <input
                                    type="number"
                                    value={branch.daysPerWeek || 0}
                                    onChange={(e) =>
                                      updateBranchLocal(cIndex, bIndex, {
                                        daysPerWeek: Number(e.target.value),
                                      })
                                    }
                                    className="w-full border rounded px-2 py-1"
                                  />
                                </div>
                              )}

                              {branch.classType === "MONTHLY" && (
                                <div>
                                  <label className="text-xs">
                                    Classes Per Month
                                  </label>
                                  <input
                                    type="number"
                                    value={branch.classesPerMonth || 0}
                                    onChange={(e) =>
                                      updateBranchLocal(cIndex, bIndex, {
                                        classesPerMonth: Number(e.target.value),
                                      })
                                    }
                                    className="w-full border rounded px-2 py-1"
                                  />
                                </div>
                              )}

                              <div>
                                <label className="text-xs font-medium mb-1 block">
                                  Days
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                  {DAYS.map(({ key, label }) => (
                                    <button
                                      key={key}
                                      onClick={() => {
                                        const updatedDays = {
                                          ...branch.daysJson,
                                          [key]: !branch.daysJson[key],
                                        };
                                        updateBranchLocal(cIndex, bIndex, {
                                          daysJson: updatedDays,
                                        });
                                      }}
                                      className={`px-3 py-2 rounded text-sm ${
                                        branch.daysJson[key]
                                          ? "bg-blue-600 text-white"
                                          : "bg-gray-200 hover:bg-gray-300"
                                      }`}
                                    >
                                      {label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="border-t pt-3">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-semibold text-sm">
                                    Semesters
                                  </h4>
                                  <button
                                    onClick={() =>
                                      addSemesterLocal(cIndex, bIndex)
                                    }
                                    className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                                  >
                                    <Plus size={14} /> Add
                                  </button>
                                </div>

                                <div className="space-y-3 mt-2">
                                  {branch.semesters.map((sem, sIndex) => (
                                    <div
                                      key={sem.id ?? sIndex}
                                      className="border p-3 rounded bg-gray-50"
                                    >
                                      <div className="flex justify-between mb-2">
                                        <input
                                          type="text"
                                          value={sem.name}
                                          onChange={(e) =>
                                            updateSemesterLocal(
                                              cIndex,
                                              bIndex,
                                              sIndex,
                                              { name: e.target.value }
                                            )
                                          }
                                          className="px-2 py-1 border rounded text-sm"
                                        />

                                        <button
                                          onClick={() =>
                                            deleteSemesterLocal(
                                              cIndex,
                                              bIndex,
                                              sIndex
                                            )
                                          }
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-xs">
                                            Start Date
                                          </label>
                                          <input
                                            type="date"
                                            value={sem.startDate}
                                            onChange={(e) =>
                                              updateSemesterLocal(
                                                cIndex,
                                                bIndex,
                                                sIndex,
                                                { startDate: e.target.value }
                                              )
                                            }
                                            className="w-full border rounded px-2 py-1 text-xs"
                                          />
                                        </div>

                                        <div>
                                          <label className="text-xs">
                                            End Date
                                          </label>
                                          <input
                                            type="date"
                                            value={sem.endDate}
                                            onChange={(e) =>
                                              updateSemesterLocal(
                                                cIndex,
                                                bIndex,
                                                sIndex,
                                                { endDate: e.target.value }
                                              )
                                            }
                                            className="w-full border rounded px-2 py-1 text-xs"
                                          />
                                        </div>

                                        <div>
                                          <label className="text-xs">
                                            Fees
                                          </label>
                                          <input
                                            type="number"
                                            value={sem.fees}
                                            onChange={(e) =>
                                              updateSemesterLocal(
                                                cIndex,
                                                bIndex,
                                                sIndex,
                                                { fees: Number(e.target.value) }
                                              )
                                            }
                                            className="w-full border rounded px-2 py-1 text-xs"
                                          />
                                        </div>

                                        <div>
                                          <label className="text-xs">
                                            Admission Fee
                                          </label>
                                          <input
                                            type="number"
                                            value={sem.admissionFee}
                                            onChange={(e) =>
                                              updateSemesterLocal(
                                                cIndex,
                                                bIndex,
                                                sIndex,
                                                {
                                                  admissionFee: Number(
                                                    e.target.value
                                                  ),
                                                }
                                              )
                                            }
                                            className="w-full border rounded px-2 py-1 text-xs"
                                          />
                                        </div>

                                        <div>
                                          <label className="text-xs">
                                            Late Fee Date
                                          </label>
                                          <input
                                            type="date"
                                            value={sem.lateFeeDate ?? ""}
                                            onChange={(e) =>
                                              updateSemesterLocal(
                                                cIndex,
                                                bIndex,
                                                sIndex,
                                                { lateFeeDate: e.target.value }
                                              )
                                            }
                                            className="w-full border rounded px-2 py-1 text-xs"
                                          />
                                        </div>

                                        <div>
                                          <label className="text-xs">
                                            Late Fee Fine
                                          </label>
                                          <input
                                            type="number"
                                            value={sem.lateFeeFine ?? 0}
                                            onChange={(e) =>
                                              updateSemesterLocal(
                                                cIndex,
                                                bIndex,
                                                sIndex,
                                                {
                                                  lateFeeFine: Number(
                                                    e.target.value
                                                  ),
                                                }
                                              )
                                            }
                                            className="w-full border rounded px-2 py-1 text-xs"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => updateCourseById(cIndex)}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      disabled={saving}
                    >
                      <Save size={18} /> {course.id ? "Update" : "Create"}
                    </button>

                    <button
                      onClick={() => {
                        if (course.id) {
                          fetchCourses();
                        } else {
                          deleteCourseLocal(cIndex);
                        }
                      }}
                      className="flex items-center gap-2 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                      disabled={saving}
                    >
                      <RefreshCw size={16} /> Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesAdminPanel;
