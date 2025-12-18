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
  const [batch, setBatch] = useState<string>("");
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
    <div className="min-h-screen bg-white py-10">
      <div className="mx-auto w-full max-w-3xl">
        {/* Title */}
        <div className="bg-purple-700 text-white text-center py-3 text-xl font-bold mb-8">
          Roll No. Creation
        </div>

        {/* Batch Select */}
        <div className="flex items-center gap-6 mb-8">
          <label className="text-green-600 font-semibold">Select Batch:</label>
          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="flex-1 bg-yellow-200 px-3 py-2 outline-none"
          >
            <option value="">-- Select Batch --</option>
            <option value="BATCH_2024">Batch 2024</option>
            <option value="BATCH_2025">Batch 2025</option>
          </select>
        </div>

        {/* Table Header */}
        <div className="flex mb-3 font-bold text-purple-700">
          <div className="w-48">Name:</div>
          <div className="flex-1">Assign Roll No.:</div>
        </div>

        {/* Students */}
        <div className="space-y-3">
          {students.map((student) => (
            <div key={student.id} className="flex items-center gap-4">
              <div className="w-48 font-semibold text-purple-700">
                {student.name}
              </div>
              <input
                type="text"
                value={student.rollNo}
                onChange={(e) => handleRollChange(student.id, e.target.value)}
                className="flex-1 bg-yellow-200 px-3 py-2 outline-none"
              />
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-16">
          <button
            onClick={handleSave}
            className="bg-purple-700 text-white px-10 py-3 text-lg font-semibold hover:bg-purple-800"
          >
            SAVE COURSE
          </button>
        </div>
      </div>
    </div>
  );
}
