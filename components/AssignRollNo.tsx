"use client";

import { useState } from "react";

interface Student {
  id: number;
  name: string;
  rollNo: string;
}

const studentsData: Student[] = [
  { id: 1, name: "Ram", rollNo: "" },
  { id: 2, name: "Shyam", rollNo: "" },
  { id: 3, name: "Jadu", rollNo: "" },
  { id: 4, name: "Madhu", rollNo: "" },
  { id: 5, name: "Tapan", rollNo: "" },
  { id: 6, name: "Bapan", rollNo: "" },
  { id: 7, name: "Avijit", rollNo: "" },
  { id: 8, name: "Surajit", rollNo: "" },
];

export default function RollNumberCreationPage() {
  const [batch, setBatch] = useState("");
  const [students, setStudents] = useState<Student[]>(studentsData);

  const handleRollChange = (id: number, value: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, rollNo: value } : s))
    );
  };

  const handleSave = () => {
    console.log({ batch, students });
    alert("Roll numbers saved successfully");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="mx-auto max-w-4xl bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-purple-700 text-white text-center py-4 text-2xl font-bold">
          Roll Number Assignment
        </div>

        <div className="p-6">
          {/* Batch Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Batch
            </label>
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full border rounded-md px-4 py-2 bg-yellow-100 focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="">-- Select Batch --</option>
              <option value="BATCH_2024">Batch 2024</option>
              <option value="BATCH_2025">Batch 2025</option>
            </select>
          </div>

          {/* Student Table */}
          <div className="border rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-2 bg-purple-100 text-purple-700 font-semibold px-4 py-2">
              <div>Student Name</div>
              <div>Roll Number</div>
            </div>

            {/* Rows */}
            {students.map((student) => (
              <div
                key={student.id}
                className="grid grid-cols-2 items-center px-4 py-3 border-t hover:bg-gray-50"
              >
                <div className="font-medium text-gray-800">{student.name}</div>
                <input
                  type="text"
                  placeholder="Enter roll no"
                  value={student.rollNo}
                  onChange={(e) => handleRollChange(student.id, e.target.value)}
                  className="border rounded-md px-3 py-2 bg-yellow-100 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleSave}
              disabled={!batch}
              className={`px-10 py-3 text-lg font-semibold rounded-md transition
                ${
                  batch
                    ? "bg-purple-700 text-white hover:bg-purple-800"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
            >
              Save Roll Numbers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
