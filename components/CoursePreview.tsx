import React, { useState } from "react";
import { Trash2, Edit2, Save } from "lucide-react";

interface Semester {
  semesterNumber: number;
  name: string;
  start: string;
  end: string;
  admissionFees: string;
  monthlyFees: string;
  lateFineAfterDate: string;
  lateFineAmount: string;
}

interface CourseData {
  branch: string;
  courseName: string;
  batchCode: string;
  courseDuration: string;
  module: string;
  photo1: { name: string; type: string; size: number } | null;
  photo2: { name: string; type: string; size: number } | null;
  tabName: { header1: string; header2: string };
  daysPerWeek: string;
  classDays: Record<string, boolean>;
  classTime: { hours: string; from: string; to: string };
  staticSemesterInfo: {
    numberOfSemesters: number;
    admissionFee: string;
    monthlyFee: string;
  };
  semesters: Semester[];
}

interface CoursePreviewProps {
  courseData: CourseData;
  onSave: (updatedCourse: CourseData) => void;
}

const CoursePreview: React.FC<CoursePreviewProps> = ({
  courseData,
  onSave,
}) => {
  const [editableData, setEditableData] = useState(courseData);
  const [editMode, setEditMode] = useState(false);

  const handleChange = (field: keyof CourseData, value: any) => {
    setEditableData({ ...editableData, [field]: value });
  };

  const handleSemesterChange = (
    index: number,
    field: keyof Semester,
    value: string
  ) => {
    const updatedSemesters = [...editableData.semesters];
    updatedSemesters[index] = { ...updatedSemesters[index], [field]: value };
    setEditableData({ ...editableData, semesters: updatedSemesters });
  };

  const toggleClassDay = (day: string) => {
    setEditableData({
      ...editableData,
      classDays: {
        ...editableData.classDays,
        [day]: !editableData.classDays[day],
      },
    });
  };

  const handleSave = () => {
    onSave(editableData);
    setEditMode(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-blue-700">Course Preview</h2>
        <button
          onClick={() => (editMode ? handleSave() : setEditMode(true))}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {editMode ? (
            <Save className="w-5 h-5" />
          ) : (
            <Edit2 className="w-5 h-5" />
          )}
          {editMode ? "Save" : "Edit"}
        </button>
      </div>

      {/* Branch */}
      <div>
        <label className="font-semibold text-blue-700">Branch:</label>
        {editMode ? (
          <input
            type="text"
            value={editableData.branch}
            onChange={(e) => handleChange("branch", e.target.value)}
            className="w-full px-3 py-2 border rounded mt-1"
          />
        ) : (
          <p>{editableData.branch}</p>
        )}
      </div>

      {/* Course Name */}
      <div>
        <label className="font-semibold text-blue-700">Course Name:</label>
        {editMode ? (
          <input
            type="text"
            value={editableData.courseName}
            onChange={(e) => handleChange("courseName", e.target.value)}
            className="w-full px-3 py-2 border rounded mt-1"
          />
        ) : (
          <p>{editableData.courseName}</p>
        )}
      </div>

      {/* Batch Code */}
      <div>
        <label className="font-semibold text-blue-700">Batch Code:</label>
        {editMode ? (
          <input
            type="text"
            value={editableData.batchCode}
            onChange={(e) => handleChange("batchCode", e.target.value)}
            className="w-full px-3 py-2 border rounded mt-1"
          />
        ) : (
          <p>{editableData.batchCode}</p>
        )}
      </div>

      {/* Tab Headers */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="font-semibold text-blue-700">Tab Header 1:</label>
          {editMode ? (
            <input
              type="text"
              value={editableData.tabName.header1}
              onChange={(e) =>
                handleChange("tabName", {
                  ...editableData.tabName,
                  header1: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded mt-1"
            />
          ) : (
            <p>{editableData.tabName.header1}</p>
          )}
        </div>
        <div>
          <label className="font-semibold text-blue-700">Tab Header 2:</label>
          {editMode ? (
            <input
              type="text"
              value={editableData.tabName.header2}
              onChange={(e) =>
                handleChange("tabName", {
                  ...editableData.tabName,
                  header2: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded mt-1"
            />
          ) : (
            <p>{editableData.tabName.header2}</p>
          )}
        </div>
      </div>

      {/* Class Days */}
      <div>
        <label className="font-semibold text-blue-700">Class Days:</label>
        <div className="flex gap-3 mt-1 flex-wrap">
          {Object.entries(editableData.classDays).map(([day, checked]) => (
            <label key={day} className="flex items-center gap-1">
              {editMode ? (
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleClassDay(day)}
                  className="w-4 h-4"
                />
              ) : (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="w-4 h-4"
                />
              )}
              <span className="capitalize">{day}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Semesters */}
      <div>
        <h3 className="text-xl font-semibold text-blue-700 mt-4 mb-2">
          Semesters:
        </h3>
        {editableData.semesters.map((sem, index) => (
          <div key={index} className="border p-3 rounded mb-3">
            {editMode ? (
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={sem.name}
                  onChange={(e) =>
                    handleSemesterChange(index, "name", e.target.value)
                  }
                  placeholder="Semester Name"
                  className="px-2 py-1 border rounded"
                />
                <input
                  type="date"
                  value={sem.start}
                  onChange={(e) =>
                    handleSemesterChange(index, "start", e.target.value)
                  }
                  className="px-2 py-1 border rounded"
                />
                <input
                  type="date"
                  value={sem.end}
                  onChange={(e) =>
                    handleSemesterChange(index, "end", e.target.value)
                  }
                  className="px-2 py-1 border rounded"
                />
                <input
                  type="text"
                  value={sem.admissionFees}
                  onChange={(e) =>
                    handleSemesterChange(index, "admissionFees", e.target.value)
                  }
                  placeholder="Admission Fee"
                  className="px-2 py-1 border rounded"
                />
                <input
                  type="text"
                  value={sem.monthlyFees}
                  onChange={(e) =>
                    handleSemesterChange(index, "monthlyFees", e.target.value)
                  }
                  placeholder="Monthly Fee"
                  className="px-2 py-1 border rounded"
                />
                <input
                  type="date"
                  value={sem.lateFineAfterDate}
                  onChange={(e) =>
                    handleSemesterChange(
                      index,
                      "lateFineAfterDate",
                      e.target.value
                    )
                  }
                  className="px-2 py-1 border rounded"
                />
                <input
                  type="text"
                  value={sem.lateFineAmount}
                  onChange={(e) =>
                    handleSemesterChange(
                      index,
                      "lateFineAmount",
                      e.target.value
                    )
                  }
                  placeholder="Late Fine"
                  className="px-2 py-1 border rounded"
                />
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                <p>{sem.name}</p>
                <p>
                  {sem.start} - {sem.end}
                </p>
                <p>
                  Admission: {sem.admissionFees}, Monthly: {sem.monthlyFees}
                </p>
                <p>
                  Late Fine After: {sem.lateFineAfterDate}, Amount:{" "}
                  {sem.lateFineAmount}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursePreview;
