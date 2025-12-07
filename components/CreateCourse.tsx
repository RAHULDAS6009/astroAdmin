import React, { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";

// Types
type CourseType = "ONLINE" | "OFFLINE";
type OnlineBranchType = "SHORT_DURATION" | "LONG_DURATION";

interface ClassFrequency {
  type: "WEEKLY" | "MONTHLY";
  daysPerWeek?: number;
  classesPerMonth?: number;
}

interface ClassTime {
  hours: number;
}

interface DaySchedule {
  day: string;
  start: string;
  end: string;
}

interface Fees {
  semesterNumber: number;
  admissionFees: number;
  monthlyFees: number;
  admissionFee: number;
}

interface OfflineBranch {
  name: string;
  color: string;
  durationMonths: number;
  module: string;
  classFrequency: ClassFrequency;
  classTime: ClassTime;
  days: DaySchedule[];
  courseStartDate: string;
  courseEndDate: string;
  batchCode: string;
  fees: Fees;
}

interface OnlineBranch {
  type: OnlineBranchType;
  title: string;
  color: string;
  durationMonths: number;
  module: string;
  classFrequency: ClassFrequency;
  classTime: ClassTime;
  days: DaySchedule[];
  courseStartDate: string;
  courseEndDate: string;
  batchCode: string;
  fees: Fees;
}

interface Course {
  id: string;
  name: string;
  type: CourseType;
  gridTitle: string[];
  description: string;
  pdf: string;
  image: string;
  branches: (OfflineBranch | OnlineBranch)[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CourseAdminPage() {
  const [course, setCourse] = useState<Course>({
    id: "",
    name: "",
    type: "OFFLINE",
    gridTitle: [""],
    description: "",
    pdf: "",
    image: "",
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
    const newBranch: OfflineBranch | OnlineBranch =
      course.type === "OFFLINE"
        ? ({
            name: "",
            color: "#000000",
            durationMonths: 0,
            module: "",
            classFrequency: { type: "WEEKLY" as const, daysPerWeek: 0 },
            classTime: { hours: 0 },
            days: [],
            courseStartDate: "",
            courseEndDate: "",
            batchCode: "",
            fees: {
              semesterNumber: 0,
              admissionFees: 0,
              monthlyFees: 0,
              admissionFee: 0,
            },
          } as OfflineBranch)
        : ({
            type: "SHORT_DURATION" as const,
            title: "",
            color: "#000000",
            durationMonths: 0,
            module: "",
            classFrequency: { type: "WEEKLY" as const, daysPerWeek: 0 },
            classTime: { hours: 0 },
            days: [],
            courseStartDate: "",
            courseEndDate: "",
            batchCode: "",
            fees: {
              semesterNumber: 0,
              admissionFees: 0,
              monthlyFees: 0,
              admissionFee: 0,
            },
          } as OnlineBranch);

    setCourse((prev) => ({
      ...prev,
      branches: [...prev.branches, newBranch],
    }));
  };

  const updateBranch = (index: number, field: string, value: any) => {
    setCourse((prev) => ({
      ...prev,
      branches: prev.branches.map((branch, i) =>
        i === index ? ({ ...branch, [field]: value } as typeof branch) : branch
      ),
    }));
  };

  const updateNestedBranch = (
    branchIndex: number,
    path: string[],
    value: any
  ) => {
    setCourse((prev) => ({
      ...prev,
      branches: prev.branches.map((branch, i) => {
        if (i !== branchIndex) return branch;

        const updated: any = { ...branch };
        let current: any = updated;

        for (let j = 0; j < path.length - 1; j++) {
          current[path[j]] = { ...current[path[j]] };
          current = current[path[j]];
        }

        current[path[path.length - 1]] = value;
        return updated as typeof branch;
      }),
    }));
  };

  const addDaySchedule = (branchIndex: number) => {
    setCourse((prev) => ({
      ...prev,
      branches: prev.branches.map((branch, i) => {
        if (i !== branchIndex) return branch;
        const newDay: DaySchedule = {
          day: "Mon",
          start: "09:00",
          end: "10:00",
        };
        return { ...branch, days: [...branch.days, newDay] } as typeof branch;
      }),
    }));
  };

  const updateDaySchedule = (
    branchIndex: number,
    dayIndex: number,
    field: keyof DaySchedule,
    value: string
  ) => {
    setCourse((prev) => {
      const updatedBranches = prev.branches.map((branch, i) => {
        if (i !== branchIndex) return branch;
        const updatedDays = branch.days.map((day, j) =>
          j === dayIndex ? { ...day, [field]: value } : day
        );
        return { ...branch, days: updatedDays } as typeof branch;
      });

      return {
        ...prev,
        branches: updatedBranches as typeof prev.branches,
      };
    });
  };

  const removeDaySchedule = (branchIndex: number, dayIndex: number) => {
    setCourse((prev) => {
      const updatedBranches = prev.branches.map((branch, i) => {
        if (i !== branchIndex) return branch;
        return {
          ...branch,
          days: branch.days.filter((_, j) => j !== dayIndex),
        } as typeof branch;
      });

      return {
        ...prev,
        branches: updatedBranches as typeof prev.branches,
      };
    });
  };

  const removeBranch = (index: number) => {
    setCourse((prev) => ({
      ...prev,
      branches: prev.branches.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
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
                  Course ID
                </label>
                <input
                  type="text"
                  value={course.id}
                  onChange={(e) => setCourse({ ...course, id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="course-001"
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
                  placeholder="Vastu Course"
                />
              </div>
            </div>

            <div className="mb-4">
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
                placeholder="Course description..."
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
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCourse({ ...course, pdf: file.name });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {course.pdf && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {course.pdf}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCourse({ ...course, image: file.name });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {course.image && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {course.image}
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
                    Branch {branchIndex + 1}
                  </h3>
                  <button
                    onClick={() => removeBranch(branchIndex)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {course.type === "ONLINE" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Branch Type
                      </label>
                      <select
                        value={(branch as OnlineBranch).type}
                        onChange={(e) =>
                          updateBranch(branchIndex, "type", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="SHORT_DURATION">Short Duration</option>
                        <option value="LONG_DURATION">Long Duration</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {course.type === "OFFLINE" ? "Name" : "Title"}
                    </label>
                    <input
                      type="text"
                      value={
                        course.type === "OFFLINE"
                          ? (branch as OfflineBranch).name
                          : (branch as OnlineBranch).title
                      }
                      onChange={(e) =>
                        updateBranch(
                          branchIndex,
                          course.type === "OFFLINE" ? "name" : "title",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch Code
                    </label>
                    <input
                      type="text"
                      value={branch.batchCode}
                      onChange={(e) =>
                        updateBranch(branchIndex, "batchCode", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="BATCH-2024-01"
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
                      Module
                    </label>
                    <input
                      type="text"
                      value={branch.module}
                      onChange={(e) =>
                        updateBranch(branchIndex, "module", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Start Date
                    </label>
                    <input
                      type="date"
                      value={branch.courseStartDate}
                      onChange={(e) =>
                        updateBranch(
                          branchIndex,
                          "courseStartDate",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course End Date
                    </label>
                    <input
                      type="date"
                      value={branch.courseEndDate}
                      onChange={(e) =>
                        updateBranch(
                          branchIndex,
                          "courseEndDate",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Class Frequency */}
                <div className="mb-4 p-4 bg-blue-50 rounded-md">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Class Frequency
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={branch.classFrequency.type}
                        onChange={(e) =>
                          updateNestedBranch(
                            branchIndex,
                            ["classFrequency", "type"],
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                      </select>
                    </div>

                    {branch.classFrequency.type === "WEEKLY" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Days Per Week
                        </label>
                        <input
                          type="number"
                          value={branch.classFrequency.daysPerWeek || 0}
                          onChange={(e) =>
                            updateNestedBranch(
                              branchIndex,
                              ["classFrequency", "daysPerWeek"],
                              Number(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    {branch.classFrequency.type === "MONTHLY" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Classes Per Month
                        </label>
                        <input
                          type="number"
                          value={branch.classFrequency.classesPerMonth || 0}
                          onChange={(e) =>
                            updateNestedBranch(
                              branchIndex,
                              ["classFrequency", "classesPerMonth"],
                              Number(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hours Per Class
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={branch.classTime.hours}
                        onChange={(e) =>
                          updateNestedBranch(
                            branchIndex,
                            ["classTime", "hours"],
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Day Schedule */}
                <div className="mb-4 p-4 bg-purple-50 rounded-md">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-700">
                      Day Schedule
                    </h4>
                    <button
                      onClick={() => addDaySchedule(branchIndex)}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
                    >
                      <Plus size={14} /> Add Day
                    </button>
                  </div>

                  {branch.days.map((day, dayIndex) => (
                    <div key={dayIndex} className="grid grid-cols-4 gap-2 mb-2">
                      <select
                        value={day.day}
                        onChange={(e) =>
                          updateDaySchedule(
                            branchIndex,
                            dayIndex,
                            "day",
                            e.target.value
                          )
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {DAYS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={day.start}
                        onChange={(e) =>
                          updateDaySchedule(
                            branchIndex,
                            dayIndex,
                            "start",
                            e.target.value
                          )
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <input
                        type="time"
                        value={day.end}
                        onChange={(e) =>
                          updateDaySchedule(
                            branchIndex,
                            dayIndex,
                            "end",
                            e.target.value
                          )
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeDaySchedule(branchIndex, dayIndex)}
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Fees */}
                <div className="p-4 bg-green-50 rounded-md">
                  <h4 className="font-semibold text-gray-700 mb-3">Fees</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Semester Number
                      </label>
                      <input
                        type="number"
                        value={branch.fees.semesterNumber}
                        onChange={(e) =>
                          updateNestedBranch(
                            branchIndex,
                            ["fees", "semesterNumber"],
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admission Fee
                      </label>
                      <input
                        type="number"
                        value={branch.fees.admissionFee}
                        onChange={(e) =>
                          updateNestedBranch(
                            branchIndex,
                            ["fees", "admissionFee"],
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="3000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admission Fees
                      </label>
                      <input
                        type="number"
                        value={branch.fees.admissionFees}
                        onChange={(e) =>
                          updateNestedBranch(
                            branchIndex,
                            ["fees", "admissionFees"],
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="5000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Fees
                      </label>
                      <input
                        type="number"
                        value={branch.fees.monthlyFees}
                        onChange={(e) =>
                          updateNestedBranch(
                            branchIndex,
                            ["fees", "monthlyFees"],
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="2000"
                      />
                    </div>
                  </div>
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
