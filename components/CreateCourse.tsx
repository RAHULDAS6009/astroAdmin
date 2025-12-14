import React, { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import axios from "axios";

// Types
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
  // manual-only semester number
  number: number;
  name: string;
  startDate: string;
  endDate: string;
  fees: number;
  lateFeeDate?: string;
  lateFeeFine?: number;
  admissionFee: number;
}

export interface Branch {
  branchCode: string; // manual input
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
  rank: number;
  name: string;
  type: CourseType;
  courseDuration: number;
  courseCode?: string;
  description: string;
  pdf: string | null;
  image: string | null;
  gridTitle: string[];
  module: string;
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

export default function CourseAdminPage() {
  const [course, setCourse] = useState<Course>({
    rank: 0,
    name: "",
    type: "OFFLINE",
    description: "",
    courseDuration: 0,
    pdf: null,
    image: null,
    gridTitle: [""],
    module: "",
    branches: [],
  });

  const addGridTitle = () => {
    setCourse((prev) => ({
      ...prev,
      gridTitle: [...prev.gridTitle, ""],
    }));
  };

  const updateGridTitle = (index: number, value: string) => {
    setCourse((prev) => ({
      ...prev,
      gridTitle: prev.gridTitle.map((item, i) => (i === index ? value : item)),
    }));
  };

  const removeGridTitle = (index: number) => {
    setCourse((prev) => ({
      ...prev,
      gridTitle: prev.gridTitle.filter((_, i) => i !== index),
    }));
  };

  const addBranch = () => {
    const newBranch: Branch = {
      branchCode: "",
      name: "",
      color: "#4287f5",
      durationMonths: 0,
      classType: "WEEKLY",
      daysPerWeek: 0,
      classesPerMonth: 0,
      classHours: 0,
      daysJson: {},
      semesters: [],
    };

    setCourse((prev) => ({
      ...prev,
      branches: [...prev.branches, newBranch],
    }));
  };

  const updateBranch = (index: number, field: keyof Branch, value: any) => {
    setCourse((prev) => ({
      ...prev,
      branches: prev.branches.map((branch, i) =>
        i === index ? { ...branch, [field]: value } : branch
      ),
    }));
  };

  const updateDayJson = (
    branchIndex: number,
    day: keyof DaysJson,
    checked: boolean
  ) => {
    setCourse((prev) => ({
      ...prev,
      branches: prev.branches.map((branch, i) =>
        i === branchIndex
          ? {
              ...branch,
              daysJson: { ...branch.daysJson, [day]: checked },
            }
          : branch
      ),
    }));
  };

  const removeBranch = (index: number) => {
    setCourse((prev) => ({
      ...prev,
      branches: prev.branches.filter((_, i) => i !== index),
    }));
  };

  const addSemester = (branchIndex: number) => {
    const newSemester: Semester = {
      number: 0, // manual input expected; default 0
      name: "",
      startDate: "",
      endDate: "",
      fees: 0,
      admissionFee: 0,
    };

    setCourse((prev) => ({
      ...prev,
      branches: prev.branches.map((branch, i) =>
        i === branchIndex
          ? { ...branch, semesters: [...branch.semesters, newSemester] }
          : branch
      ),
    }));
  };

  const updateSemester = (
    branchIndex: number,
    semesterIndex: number,
    field: keyof Semester,
    value: any
  ) => {
    setCourse((prev) => ({
      ...prev,
      branches: prev.branches.map((branch, i) =>
        i === branchIndex
          ? {
              ...branch,
              semesters: branch.semesters.map((sem, j) =>
                j === semesterIndex ? { ...sem, [field]: value } : sem
              ),
            }
          : branch
      ),
    }));
  };

  const removeSemester = (branchIndex: number, semesterIndex: number) => {
    setCourse((prev) => ({
      ...prev,
      branches: prev.branches.map((branch, i) =>
        i === branchIndex
          ? {
              ...branch,
              semesters: branch.semesters.filter((_, j) => j !== semesterIndex),
            }
          : branch
      ),
    }));
  };

  // Productionize it carefully
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "pdf" | "image"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const res = await axios.post(
        "https://api.astrokama.com/upload-file",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Cloudinary URL returned from backend
      const uploadedUrl = res.data.url;

      setCourse((prev) => ({
        ...prev,
        [type]: uploadedUrl, // store cloudinary url
      }));
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleSubmit = async () => {
    const mappedPayload: any = {
      ranking: course.rank,
      name: course.name,
      type: course.type?.toLowerCase(), // ONLINE → online
      description: course.description,
      duration: course.courseDuration,
      bannerpdf: course.pdf,
      bannerimage: course.image,
      courseCode: course.module,
      gridTitle: course.gridTitle,
      courseType: course.type, // You can adjust if needed

      branches: course.branches.map((b) => ({
        name: b.name,
        color: b.color,
        durationMonths: b.durationMonths,
        classType: b.classType?.toLowerCase(), // MONTHLY → monthly, WEEKLY → weekly
        branchCode: b.branchCode,
        // class durations: backend wants daysPerClassType & classHour
        daysPerClassType:
          b.classType === "WEEKLY" ? b.daysPerWeek : b.classesPerMonth,

        classHour: b.classHours,

        // backend expects STRING JSON
        daysJSON: JSON.stringify(b.daysJson),

        // semesters spelling must match backend "semsters"
        semsters: b.semesters.map((s) => ({
          name: s.name,
          number: s.number,
          startDate: s.startDate,
          endDate: s.endDate,
          fees: s.fees,
          admissionFee: s.admissionFee,
          lateFeeDate: s.lateFeeDate || null,
          lateFeeFine: s.lateFeeFine || null,
        })),
      })),
    };
    const token = localStorage.getItem("admin_token");

    const res = await axios.post(
      "https://api.astrokama.com/api/v1/admin/course",
      mappedPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    console.log(res);

    // Final sanity: ensure semester.number is number (already enforced)
    console.log("Course Data:", JSON.stringify(course, null, 2));
    alert("Course saved! Check console for JSON output.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Course Admin Panel
          </h1>

          {/* Basic Information */}
          <section className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Basic Information
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Rank
                </label>
                <input
                  type="number"
                  value={Number(course.rank)}
                  onChange={(e) =>
                    setCourse({ ...course, rank: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="course_web_dev"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name
                </label>
                <input
                  type="text"
                  value={course.name}
                  onChange={(e) =>
                    setCourse({ ...course, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full Stack Web Development"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="number"
                  value={Number(course.courseDuration)}
                  onChange={(e) =>
                    setCourse({
                      ...course,
                      courseDuration: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Duration in months"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Type
                </label>
                <select
                  value={course.type}
                  onChange={(e) =>
                    setCourse({
                      ...course,
                      type: e.target.value as CourseType,
                      branches: [],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="OFFLINE">Offline</option>
                  <option value="ONLINE">Online</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module
                </label>
                <input
                  type="text"
                  value={course.module}
                  onChange={(e) =>
                    setCourse({ ...course, module: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="FULL_STACK"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={course.description}
                onChange={(e) =>
                  setCourse({ ...course, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Learn MERN stack from basics to advanced."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload PDF
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, "pdf")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {course.pdf && (
                  <p className="mt-2 text-sm text-green-600">✓ PDF uploaded</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "image")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {course.image && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ Image uploaded
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Grid Titles */}
          <section className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Grid Titles
              </h2>
              <button
                onClick={addGridTitle}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus size={16} /> Add Title
              </button>
            </div>

            {course.gridTitle.map((title, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => updateGridTitle(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Grid title ${index + 1}`}
                />
                <button
                  onClick={() => removeGridTitle(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </section>

          {/* Branches */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Branches</h2>
              <button
                onClick={addBranch}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Plus size={16} /> Add Branch
              </button>
            </div>

            {course.branches.map((branch, branchIndex) => (
              <div
                key={branchIndex}
                className="mb-6 p-6 bg-white border-2 border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Branch {branchIndex + 1}:{" "}
                    {branch.name || branch.branchCode || "Unnamed"}
                  </h3>
                  <button
                    onClick={() => removeBranch(branchIndex)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch Code
                    </label>
                    <input
                      type="text"
                      value={String(branch.branchCode || "")}
                      onChange={(e) =>
                        updateBranch(branchIndex, "branchCode", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="branch_morning_web"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      value={branch.name}
                      onChange={(e) =>
                        updateBranch(branchIndex, "name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Morning Batch"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={branch.color}
                      onChange={(e) =>
                        updateBranch(branchIndex, "color", e.target.value)
                      }
                      className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (Months)
                    </label>
                    <input
                      type="number"
                      value={branch.durationMonths}
                      onChange={(e) =>
                        updateBranch(
                          branchIndex,
                          "durationMonths",
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class Type
                    </label>
                    <select
                      value={branch.classType}
                      onChange={(e) =>
                        updateBranch(
                          branchIndex,
                          "classType",
                          e.target.value as ClassType
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>

                  {branch.classType === "WEEKLY" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Days Per Week
                      </label>
                      <input
                        type="number"
                        value={branch.daysPerWeek || 0}
                        onChange={(e) =>
                          updateBranch(
                            branchIndex,
                            "daysPerWeek",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {branch.classType === "MONTHLY" && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Classes Per Month
                      </label>
                      <input
                        type="number"
                        value={branch.classesPerMonth || 0}
                        onChange={(e) =>
                          updateBranch(
                            branchIndex,
                            "classesPerMonth",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={branch.classHours}
                      onChange={(e) =>
                        updateBranch(
                          branchIndex,
                          "classHours",
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Days Selection */}
                <div className="mb-4 p-4 bg-purple-50 rounded-md">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Class Days
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {DAYS.map((day) => (
                      <label
                        key={day.key}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={branch.daysJson[day.key] || false}
                          onChange={(e) =>
                            updateDayJson(
                              branchIndex,
                              day.key,
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {day.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Semesters */}
                <div className="p-4 bg-green-50 rounded-md">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-700">Semesters</h4>
                    <button
                      onClick={() => addSemester(branchIndex)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                    >
                      <Plus size={14} /> Add Semester
                    </button>
                  </div>

                  {branch.semesters.map((semester, semesterIndex) => (
                    <div
                      key={semesterIndex}
                      className="mb-3 p-3 bg-white rounded-md border border-green-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="text-sm font-semibold text-gray-700">
                          Semester {semester.number || semesterIndex + 1}
                        </h5>
                        <button
                          onClick={() =>
                            removeSemester(branchIndex, semesterIndex)
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Semester Number
                          </label>
                          <input
                            type="number"
                            value={semester.number}
                            onChange={(e) =>
                              updateSemester(
                                branchIndex,
                                semesterIndex,
                                "number",
                                Number(e.target.value)
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                            placeholder="1"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={semester.name}
                            onChange={(e) =>
                              updateSemester(
                                branchIndex,
                                semesterIndex,
                                "name",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                            placeholder="Semester 1"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={semester.startDate}
                            onChange={(e) =>
                              updateSemester(
                                branchIndex,
                                semesterIndex,
                                "startDate",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={semester.endDate}
                            onChange={(e) =>
                              updateSemester(
                                branchIndex,
                                semesterIndex,
                                "endDate",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Semester Fees
                          </label>
                          <input
                            type="number"
                            value={semester.fees}
                            onChange={(e) =>
                              updateSemester(
                                branchIndex,
                                semesterIndex,
                                "fees",
                                Number(e.target.value)
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                            placeholder="7000"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Semester Admission Fee
                          </label>
                          <input
                            type="number"
                            value={semester.admissionFee}
                            onChange={(e) =>
                              updateSemester(
                                branchIndex,
                                semesterIndex,
                                "admissionFee",
                                Number(e.target.value)
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                            placeholder="2000"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {branch.semesters.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No semesters added yet
                    </p>
                  )}
                </div>
              </div>
            ))}
          </section>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 shadow-lg"
            >
              <Save size={20} /> Save Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
