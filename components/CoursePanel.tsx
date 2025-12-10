import React, { useState } from "react";
import { Plus, Trash2, Save, ChevronDown, ChevronRight, X } from "lucide-react";
import {
  Branch,
  ClassType,
  Course,
  CourseType,
  DAYS,
  Semester,
} from "./CreateCourse";

// Types

const CoursesAdminPanel = () => {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: "1",
      name: "Web Development",
      type: "ONLINE",
      description: "Complete web development course",
      pdf: null,
      image: null,
      gridTitle: ["HTML", "CSS", "JavaScript", "React"],
      module: "Full Stack",
      branches: [
        {
          id: "b1",
          name: "Frontend Branch",
          color: "#3b82f6",
          durationMonths: 6,
          classType: "WEEKLY",
          daysPerWeek: 3,
          classHours: 2,
          daysJson: { mon: true, wed: true, fri: true },

          semesters: [],
        },
      ],
    },
  ]);

  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(
    new Set()
  );
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(
    new Set()
  );

  const toggleCourse = (id: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCourses(newExpanded);
  };

  const toggleBranch = (id: string) => {
    const newExpanded = new Set(expandedBranches);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedBranches(newExpanded);
  };

  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name: "New Course",
      type: "ONLINE",
      description: "",
      pdf: null,
      image: null,
      gridTitle: [],
      module: "",
      branches: [],
    };
    setCourses([...courses, newCourse]);
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const addBranch = (courseId: string) => {
    const newBranch: Branch = {
      id: Date.now().toString(),
      name: "New Branch",
      color: "#3b82f6",
      durationMonths: 6,
      classType: "WEEKLY",
      daysPerWeek: 3,
      classHours: 2,
      daysJson: {},

      semesters: [],
    };
    setCourses(
      courses.map((c) =>
        c.id === courseId ? { ...c, branches: [...c.branches, newBranch] } : c
      )
    );
  };

  const updateBranch = (
    courseId: string,
    branchId: string,
    updates: Partial<Branch>
  ) => {
    setCourses(
      courses.map((c) =>
        c.id === courseId
          ? {
              ...c,
              branches: c.branches.map((b) =>
                b.id === branchId ? { ...b, ...updates } : b
              ),
            }
          : c
      )
    );
  };

  const deleteBranch = (courseId: string, branchId: string) => {
    setCourses(
      courses.map((c) =>
        c.id === courseId
          ? { ...c, branches: c.branches.filter((b) => b.id !== branchId) }
          : c
      )
    );
  };

  const addSemester = (courseId: string, branchId: string) => {
    const newSemester: Semester = {
      id: Date.now().toString(),
      name: "Semester Name",
      startDate: "",
      endDate: "",
      fees: 0,
      admissionFee: 0,
      lateFeeDate: "",
      lateFeeFine: 0,
    };
    setCourses(
      courses.map((c) =>
        c.id === courseId
          ? {
              ...c,
              branches: c.branches.map((b) =>
                b.id === branchId
                  ? { ...b, semesters: [...b.semesters, newSemester] }
                  : b
              ),
            }
          : c
      )
    );
  };

  const updateSemester = (
    courseId: string,
    branchId: string,
    semesterId: string,
    updates: Partial<Semester>
  ) => {
    setCourses(
      courses.map((c) =>
        c.id === courseId
          ? {
              ...c,
              branches: c.branches.map((b) =>
                b.id === branchId
                  ? {
                      ...b,
                      semesters: b.semesters.map((s) =>
                        s.id === semesterId ? { ...s, ...updates } : s
                      ),
                    }
                  : b
              ),
            }
          : c
      )
    );
  };

  const deleteSemester = (
    courseId: string,
    branchId: string,
    semesterId: string
  ) => {
    setCourses(
      courses.map((c) =>
        c.id === courseId
          ? {
              ...c,
              branches: c.branches.map((b) =>
                b.id === branchId
                  ? {
                      ...b,
                      semesters: b.semesters.filter((s) => s.id !== semesterId),
                    }
                  : b
              ),
            }
          : c
      )
    );
  };

  const addGridTitle = (courseId: string, title: string) => {
    setCourses(
      courses.map((c) =>
        c.id === courseId ? { ...c, gridTitle: [...c.gridTitle, title] } : c
      )
    );
  };

  const removeGridTitle = (courseId: string, index: number) => {
    setCourses(
      courses.map((c) =>
        c.id === courseId
          ? { ...c, gridTitle: c.gridTitle.filter((_, i) => i !== index) }
          : c
      )
    );
  };

  const handleSave = () => {
    console.log("Saving courses:", courses);
    alert("Courses saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Update Courses</h1>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <Save size={20} />
            Save All Changes
          </button>
        </div>

        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleCourse(course.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {expandedCourses.has(course.id) ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                    <input
                      type="text"
                      value={course.name}
                      onChange={(e) =>
                        updateCourse(course.id, { name: e.target.value })
                      }
                      className="text-xl font-semibold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                    />
                    <select
                      value={course.type}
                      onChange={(e) =>
                        updateCourse(course.id, {
                          type: e.target.value as CourseType,
                        })
                      }
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="ONLINE">Online</option>
                      <option value="OFFLINE">Offline</option>
                    </select>
                  </div>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {expandedCourses.has(course.id) && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={course.description}
                        onChange={(e) =>
                          updateCourse(course.id, {
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Module
                      </label>
                      <input
                        type="text"
                        value={course.module}
                        onChange={(e) =>
                          updateCourse(course.id, { module: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grid Titles
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {course.gridTitle.map((title, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                        >
                          <span className="text-sm">{title}</span>
                          <button
                            onClick={() => removeGridTitle(course.id, idx)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add grid title"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            const target = e.target as HTMLInputElement;
                            if (target.value.trim()) {
                              addGridTitle(course.id, target.value.trim());
                              target.value = "";
                            }
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Branches
                      </h3>
                      <button
                        onClick={() => addBranch(course.id)}
                        className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition text-sm"
                      >
                        <Plus size={16} />
                        Add Branch
                      </button>
                    </div>

                    <div className="space-y-3">
                      {course.branches.map((branch) => (
                        <div
                          key={branch.id}
                          className="border border-gray-200 rounded-lg"
                        >
                          <div className="p-3 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <button
                                onClick={() => toggleBranch(branch.id)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                {expandedBranches.has(branch.id) ? (
                                  <ChevronDown size={18} />
                                ) : (
                                  <ChevronRight size={18} />
                                )}
                              </button>
                              <input
                                type="text"
                                value={branch.name}
                                onChange={(e) =>
                                  updateBranch(course.id, branch.id, {
                                    name: e.target.value,
                                  })
                                }
                                className="font-medium border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                              />
                              <input
                                type="color"
                                value={branch.color}
                                onChange={(e) =>
                                  updateBranch(course.id, branch.id, {
                                    color: e.target.value,
                                  })
                                }
                                className="w-8 h-8 rounded cursor-pointer"
                              />
                            </div>
                            <button
                              onClick={() => deleteBranch(course.id, branch.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {expandedBranches.has(branch.id) && (
                            <div className="p-4 space-y-4">
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Duration (Months)
                                  </label>
                                  <input
                                    type="text"
                                    value={branch.durationMonths || ""}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(
                                        /[^0-9]/g,
                                        ""
                                      );
                                      updateBranch(course.id, branch.id, {
                                        durationMonths:
                                          val === "" ? 0 : parseInt(val),
                                      });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Class Type
                                  </label>
                                  <select
                                    value={branch.classType}
                                    onChange={(e) =>
                                      updateBranch(course.id, branch.id, {
                                        classType: e.target.value as ClassType,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  >
                                    <option value="WEEKLY">Weekly</option>
                                    <option value="MONTHLY">Monthly</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Class Hours
                                  </label>
                                  <input
                                    type="text"
                                    value={branch.classHours || ""}
                                    onChange={(e) => {
                                      const val = e.target.value
                                        .replace(/[^0-9.]/g, "")
                                        .replace(/(\..*)\./g, "$1");
                                      updateBranch(course.id, branch.id, {
                                        classHours:
                                          val === "" ? 0 : parseFloat(val),
                                      });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                </div>
                              </div>

                              {branch.classType === "WEEKLY" && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Days Per Week
                                  </label>
                                  <input
                                    type="text"
                                    value={branch.daysPerWeek || ""}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(
                                        /[^0-9]/g,
                                        ""
                                      );
                                      updateBranch(course.id, branch.id, {
                                        daysPerWeek:
                                          val === "" ? 0 : parseInt(val),
                                      });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                </div>
                              )}

                              {branch.classType === "MONTHLY" && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Classes Per Month
                                  </label>
                                  <input
                                    type="text"
                                    value={branch.classesPerMonth || ""}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(
                                        /[^0-9]/g,
                                        ""
                                      );
                                      updateBranch(course.id, branch.id, {
                                        classesPerMonth:
                                          val === "" ? 0 : parseInt(val),
                                      });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                </div>
                              )}

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                  Days
                                </label>
                                <div className="flex gap-2">
                                  {DAYS.map(({ key, label }) => (
                                    <button
                                      key={key}
                                      onClick={() => {
                                        const newDaysJson = {
                                          ...branch.daysJson,
                                          [key]: !branch.daysJson[key],
                                        };
                                        updateBranch(course.id, branch.id, {
                                          daysJson: newDaysJson,
                                        });
                                      }}
                                      className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                                        branch.daysJson[key]
                                          ? "bg-blue-600 text-white"
                                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                      }`}
                                    >
                                      {label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="border-t pt-3">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-sm font-semibold text-gray-900">
                                    Semesters
                                  </h4>
                                  <button
                                    onClick={() =>
                                      addSemester(course.id, branch.id)
                                    }
                                    className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-700 transition text-xs"
                                  >
                                    <Plus size={14} />
                                    Add Semester
                                  </button>
                                </div>

                                <div className="space-y-2">
                                  {branch.semesters.map((semester) => (
                                    <div
                                      key={semester.id}
                                      className="border border-gray-200 rounded p-3 bg-gray-50"
                                    >
                                      <div className="flex justify-between items-start mb-2 ">
                                        <input
                                          type="text"
                                          value={semester.name}
                                          onChange={(e) =>
                                            updateSemester(
                                              course.id,
                                              branch.id,
                                              semester.id,
                                              { name: e.target.value }
                                            )
                                          }
                                          className="font-medium text-sm border-none bg-transparent focus:outline-none ring-2 ring-blue-500 rounded px-2 py-1"
                                        />
                                        <button
                                          onClick={() =>
                                            deleteSemester(
                                              course.id,
                                              branch.id,
                                              semester.id
                                            )
                                          }
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-xs text-gray-600 mb-1">
                                            Start Date
                                          </label>
                                          <input
                                            type="date"
                                            value={semester.startDate}
                                            onChange={(e) =>
                                              updateSemester(
                                                course.id,
                                                branch.id,
                                                semester.id,
                                                { startDate: e.target.value }
                                              )
                                            }
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs text-gray-600 mb-1">
                                            End Date
                                          </label>
                                          <input
                                            type="date"
                                            value={semester.endDate}
                                            onChange={(e) =>
                                              updateSemester(
                                                course.id,
                                                branch.id,
                                                semester.id,
                                                { endDate: e.target.value }
                                              )
                                            }
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs text-gray-600 mb-1">
                                            Fees
                                          </label>
                                          <input
                                            type="text"
                                            value={semester.fees || ""}
                                            onChange={(e) => {
                                              const val = e.target.value
                                                .replace(/[^0-9.]/g, "")
                                                .replace(/(\..*)\./g, "$1");
                                              updateSemester(
                                                course.id,
                                                branch.id,
                                                semester.id,
                                                {
                                                  fees:
                                                    val === ""
                                                      ? 0
                                                      : parseFloat(val),
                                                }
                                              );
                                            }}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs text-gray-600 mb-1">
                                            Admission Fee
                                          </label>
                                          <input
                                            type="text"
                                            value={semester.admissionFee || ""}
                                            onChange={(e) => {
                                              const val = e.target.value
                                                .replace(/[^0-9.]/g, "")
                                                .replace(/(\..*)\./g, "$1");
                                              updateSemester(
                                                course.id,
                                                branch.id,
                                                semester.id,
                                                {
                                                  admissionFee:
                                                    val === ""
                                                      ? 0
                                                      : parseFloat(val),
                                                }
                                              );
                                            }}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs text-gray-600 mb-1">
                                            Late Fee Date
                                          </label>
                                          <input
                                            type="date"
                                            value={semester.lateFeeDate}
                                            onChange={(e) =>
                                              updateSemester(
                                                course.id,
                                                branch.id,
                                                semester.id,
                                                { lateFeeDate: e.target.value }
                                              )
                                            }
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs text-gray-600 mb-1">
                                            Late Fee Fine
                                          </label>
                                          <input
                                            type="text"
                                            value={semester.lateFeeFine || ""}
                                            onChange={(e) => {
                                              const val = e.target.value
                                                .replace(/[^0-9.]/g, "")
                                                .replace(/(\..*)\./g, "$1");
                                              updateSemester(
                                                course.id,
                                                branch.id,
                                                semester.id,
                                                {
                                                  lateFeeFine:
                                                    val === ""
                                                      ? 0
                                                      : parseFloat(val),
                                                }
                                              );
                                            }}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
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
