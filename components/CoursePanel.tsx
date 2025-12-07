import React, { useState } from "react";

// -------------------- Sample data --------------------
const coursesData: Course[] = [
  {
    id: "offline",
    name: "Offline Course",
    type: "OFFLINE",
    gridTitle: ["Online Astrology", "Full Course"],
    description: "Complete Astrology Program",
    pdf: "Course Details 12 Months.pdf",
    image: "course.png",
    subCourses: [
      {
        name: "Tollygunge",
        color: "purple",
        duration: "1 Year",
        module: "Basic to Advance",
        classFreq: "Weekly 1 Day",
        time: "4 Hours",
        days: ["Sun - 1:00 pm to 5:00 pm", "Sun - 1:00 pm to 5:00 pm"],
        fees: {
          admissionLabel: "4 Semester Admission",
          admission: "1000 × 4 = 4000",
          monthlyLabel: "12 Month Fees",
          monthly: "2000 × 12 = 24000",
          total: "₹28,000",
        },
      },
      {
        name: "Midnapore",
        color: "orange",
        duration: "1 Year",
        module: "Basic to Advance",
        classFreq: "Weekly 1 Day",
        time: "4 Hour/day",
        days: ["Sun - 1:00 pm to 5:00 pm", "Sun - 1:00 pm to 5:00 pm"],
        fees: {
          admissionLabel: "4 Semester Admission",
          admission: "1000 × 4 = 4000",
          monthlyLabel: "12 Month Fees",
          monthly: "2000 × 12 = 24000",
          total: "₹28,000",
        },
      },
    ],
  },
  {
    id: "online",
    name: "Online Course",
    type: "ONLINE",
    gridTitle: ["Online Astrology", "Short Duration Full Course"],
    description: "Short Duration Astrology Course",
    pdf: "Course Details 12 Months.pdf",
    image: "course.png",
    subCourses: [
      {
        name: "Long Duration",
        color: "blue",
        duration: "2 Year",
        module: "Basic to Advance",
        classFreq: "Weekly 1 Day",
        time: "2 Hour/day",
        days: ["Fri - 6:00 pm to 10:00 pm"],
        fees: {
          admissionLabel: "4 Semester Admission",
          admission: "1000 × 4 = 4000",
          monthlyLabel: "24 Month Fees",
          monthly: "1000 × 24 = 24000",
          total: "₹28,000",
        },
      },
      {
        name: "Short Duration",
        color: "green",
        duration: "6 Months",
        module: "Basic to Advance",
        classFreq: "Weekly 3 Days",
        time: "2 Hour/day",
        days: ["Fri - 6:00 pm to 10:00 pm"],
        fees: {
          admissionLabel: "4 Semester Admission",
          admission: "No fees",
          monthlyLabel: "6 Month Fees",
          monthly: "5000 × 6 = 30000",
          total: "₹30,000",
        },
      },
    ],
  },
  {
    id: "kavach",
    name: "Kavach Course",
    type: "KAVACH",
    gridTitle: ["Kavach"],
    description: "Spiritual Protection Course",
    pdf: "Course Details 12 Months.pdf",
    image: "course.png",
    subCourses: [
      {
        name: "Tollygunge - Offline Only",
        color: "yellow",
        duration: "3 Months",
        module: "Vedic Paddhati",
        classFreq: "Weekly 1 Day",
        time: "4 Hour/day",
        days: ["Fri - 6:00 pm to 10:00 pm"],
        fees: {
          admissionLabel: "Admission",
          admission: "No fees",
          monthlyLabel: "3 Month Fees",
          monthly: "5000 × 3 = 15000",
          total: "₹15,000",
        },
      },
    ],
  },
  {
    id: "vastu",
    name: "Vastu Course",
    type: "VASTU",
    gridTitle: ["Vastu Full Course"],
    description: "Complete Vastu Shastra Course",
    pdf: "Course Details 12 Months.pdf",
    image: "course.png",
    subCourses: [
      {
        name: "Tollygunge - Offline Only",
        color: "blue",
        duration: "3 Months",
        module: "Basic To Advanced",
        classFreq: "Weekly 1 Day",
        time: "2 Hour/day",
        days: ["Fri - 6:00 pm to 10:00 pm"],
        fees: {
          admissionLabel: "Admission",
          admission: "No fees",
          monthlyLabel: "3 Month Fees",
          monthly: "6333 × 3 = 19000",
          total: "₹19,000",
        },
      },
    ],
  },
  {
    id: "reiki",
    name: "Reiki Course",
    type: "REIKI",
    gridTitle: ["Reiki Course"],
    description: "Reiki Healing Training",
    pdf: "Course Details 12 Months.pdf",
    image: "course.png",
    sessions: [
      { degree: "1st Degree", day: "12 Dec 2025", fees: 6500 },
      { degree: "2nd Degree", day: "15 Jan 2026", fees: 4500 },
      { degree: "Grand Master", day: "20 Mar 2026", fees: 50000 },
    ],
  },
  {
    id: "online-long",
    name: "Online Long Course",
    type: "GRID_ONLY",
    gridTitle: ["Online Astrology", "Long Duration Full Course"],
    description: "Long Duration Astrology Course",
    pdf: "Course Details 12 Months.pdf",
    image: "course.png",
  },
];

// -------------------- Types --------------------
interface Course {
  id: string;
  name: string;
  type: string;
  gridTitle?: string[];
  description: string;
  pdf?: string;
  image?: string;
  subCourses?: SubCourse[];
  sessions?: Session[];
}

interface SubCourse {
  name: string;
  color: string;
  duration: string;
  module: string;
  classFreq: string;
  time: string;
  days: string[];
  fees: {
    admissionLabel: string;
    admission: string;
    monthlyLabel: string;
    monthly: string;
    total: string;
  };
}

interface Session {
  degree: string;
  day: string;
  fees: number;
}

// -------------------- Component --------------------
export default function CoursesPanel() {
  const [courses, setCourses] = useState<Course[]>(coursesData);
  const [openId, setOpenId] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);

  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    id: "",
    name: "",
    type: "GRID_ONLY",
    description: "",
    pdf: "",
    image: "",
    gridTitle: [],
  });

  const createCourse = () => {
    if (!newCourse.id || !newCourse.name) {
      alert("Please fill ID and Name");
      return;
    }

    const courseToAdd: Course = {
      id: String(newCourse.id),
      name: String(newCourse.name),
      type: String(newCourse.type || "GRID_ONLY"),
      description: String(newCourse.description || ""),
      pdf: newCourse.pdf,
      image: newCourse.image,
      gridTitle: newCourse.gridTitle || [],
    };

    setCourses((s) => [...s, courseToAdd]);
    setShowCreate(false);
    setNewCourse({
      id: "",
      name: "",
      type: "GRID_ONLY",
      description: "",
      pdf: "",
      image: "",
      gridTitle: [],
    });
  };

  // Helper to render a small badge for course type
  const TypeBadge = ({ type }: { type: string }) => (
    <span className="text-xs px-2 py-1 rounded-full border">{type}</span>
  );

  return (
    <div className="space-y-6 p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Courses Management</h2>

        <div className="flex gap-3 items-center">
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow"
          >
            + Create Course
          </button>
        </div>
      </div>

      {/* CREATE COURSE POPUP */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[520px] space-y-4 shadow-lg">
            <h3 className="text-xl font-bold">Create New Course</h3>

            <input
              placeholder="Course ID"
              className="border p-2 w-full rounded"
              value={newCourse.id as string}
              onChange={(e) =>
                setNewCourse({ ...newCourse, id: e.target.value })
              }
            />

            <input
              placeholder="Name"
              className="border p-2 w-full rounded"
              value={newCourse.name as string}
              onChange={(e) =>
                setNewCourse({ ...newCourse, name: e.target.value })
              }
            />

            <textarea
              rows={2}
              placeholder="Description"
              className="border p-2 w-full rounded"
              value={newCourse.description as string}
              onChange={(e) =>
                setNewCourse({ ...newCourse, description: e.target.value })
              }
            />

            <select
              className="border p-2 rounded w-full"
              value={newCourse.type}
              onChange={(e) =>
                setNewCourse({ ...newCourse, type: e.target.value })
              }
            >
              <option value="OFFLINE">Offline</option>
              <option value="ONLINE">Online</option>
              <option value="KAVACH">Kavach</option>
              <option value="VASTU">Vastu</option>
              <option value="REIKI">Reiki (Sessions)</option>
              <option value="GRID_ONLY">Grid Only</option>
            </select>

            <div className="flex gap-2">
              <input
                placeholder="PDF filename (optional)"
                className="border p-2 w-full rounded"
                value={newCourse.pdf as string}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, pdf: e.target.value })
                }
              />

              <input
                placeholder="Image filename (optional)"
                className="border p-2 w-[180px] rounded"
                value={newCourse.image as string}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, image: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="px-3 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={createCourse}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COURSE CARDS */}
      {courses.map((course) => (
        <div
          key={course.id}
          className="border rounded-lg p-4 bg-white shadow-sm"
        >
          {/* HEADER */}
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setOpenId(openId === course.id ? null : course.id)}
          >
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-3">
                {course.name}
                <TypeBadge type={course.type} />
              </h3>
              <p className="text-sm text-gray-600">{course.description}</p>
            </div>

            <button className="px-3 py-1 border rounded">
              {openId === course.id ? "Close" : "Manage"}
            </button>
          </div>

          {/* DETAILS */}
          {openId === course.id && (
            <div className="mt-4 border-t pt-4 space-y-5">
              {/* Grid titles if any */}
              {course.gridTitle && course.gridTitle.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Grid Titles</h4>
                  <div className="flex gap-2 flex-wrap">
                    {course.gridTitle.map((g, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1 border rounded bg-gray-50 text-sm"
                      >
                        {g}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub Courses */}
              {course.subCourses && (
                <div>
                  <h4 className="font-semibold mb-2">Sub-Courses</h4>

                  <div className="space-y-3">
                    {course.subCourses.map((sc, i) => (
                      <div
                        key={i}
                        className="p-3 border rounded shadow-sm bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-lg">{sc.name}</div>
                          <div className="text-sm">
                            {sc.duration} • {sc.module}
                          </div>
                        </div>

                        <div className="mt-2 text-sm grid grid-cols-2 gap-2">
                          <div>Class Frequency: {sc.classFreq}</div>
                          <div>Time: {sc.time}</div>
                          <div className="col-span-2">
                            Days: {sc.days.join(", ")}
                          </div>
                        </div>

                        <div className="mt-2 text-sm grid grid-cols-2 gap-2">
                          <div>
                            {sc.fees.admissionLabel}: {sc.fees.admission}
                          </div>
                          <div>
                            {sc.fees.monthlyLabel}: {sc.fees.monthly}
                          </div>
                          <div className="font-bold col-span-2">
                            {sc.fees.total}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <button className="px-2 py-1 border rounded">
                            Edit Sub Course
                          </button>
                          <button
                            className="px-2 py-1 border rounded text-red-600"
                            onClick={() => {
                              // quick delete example
                              if (confirm(`Delete sub-course "${sc.name}" ?`)) {
                                setCourses((prev) =>
                                  prev.map((c) =>
                                    c.id === course.id
                                      ? {
                                          ...c,
                                          subCourses: c.subCourses!.filter(
                                            (_, idx2) => idx2 !== i
                                          ),
                                        }
                                      : c
                                  )
                                );
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reiki Sessions */}
              {course.sessions && (
                <div>
                  <h4 className="font-semibold mb-2">Reiki Sessions</h4>

                  {course.sessions.map((s, i) => (
                    <div
                      key={i}
                      className="p-3 border rounded shadow-sm bg-purple-50"
                    >
                      <div className="font-semibold">{s.degree}</div>
                      <div className="text-sm">
                        Date: {s.day} • Fees: ₹{s.fees}
                      </div>

                      <div className="flex gap-2 mt-2">
                        <button className="px-2 py-1 border rounded">
                          Edit Session
                        </button>
                        <button
                          className="px-2 py-1 border rounded text-red-600"
                          onClick={() => {
                            if (confirm(`Delete session "${s.degree}" ?`)) {
                              setCourses((prev) =>
                                prev.map((c) =>
                                  c.id === course.id
                                    ? {
                                        ...c,
                                        sessions: c.sessions!.filter(
                                          (_, idx2) => idx2 !== i
                                        ),
                                      }
                                    : c
                                )
                              );
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* GRID ONLY */}
              {!course.subCourses && !course.sessions && (
                <div className="p-3 bg-gray-100 rounded text-sm">
                  No Sub-Courses / Sessions. Grid-only course.
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Helpful note */}
      <div className="text-sm text-gray-500">
        Tip: All fields are editable in this component; extend it to add image
        upload, day/time pickers, or richer fee editors as needed.
      </div>
    </div>
  );
}
