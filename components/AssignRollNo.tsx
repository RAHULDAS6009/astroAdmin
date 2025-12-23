"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

/* ---------------- TYPES ---------------- */

interface Branch {
  id: string;
  name: string;
  branchCode: string;
  location?: {
    location: string;
  };
}

interface Student {
  id: number;
  name: string;
  rollNo: number | null;
}

/* ---------------- COMPONENT ---------------- */

export default function RollNumberCreationPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchCode, setBranchCode] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  /* ---------------- FETCH BRANCHES ---------------- */

  useEffect(() => {
    axios
      .get(`${API_BASE}/branches`)
      .then((res) => setBranches(res.data))
      .catch(() => alert("Failed to load branches"));
  }, []);

  /* ---------------- FETCH STUDENTS ---------------- */

  useEffect(() => {
    if (!branchCode) {
      setStudents([]);
      return;
    }

    setLoading(true);

    axios
      .get(`${API_BASE}/v1/admin/by-branch-code/${branchCode}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      })
      .then((res) => setStudents(res.data.students))
      .catch(() => alert("Failed to load students"))
      .finally(() => setLoading(false));
  }, [branchCode]);

  /* ---------------- ROLL INPUT HANDLER ---------------- */

  const updateRollNo = (id: number, value: string) => {
    // allow empty
    if (value === "") {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, rollNo: null } : s))
      );
      return;
    }

    // REGEX: only positive numbers
    if (!/^[1-9][0-9]*$/.test(value)) return;

    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, rollNo: Number(value) } : s))
    );
  };

  /* ---------------- SAVE HANDLER ---------------- */

  const handleSave = async () => {
    if (!branchCode) return;

    const payload = students
      .filter((s) => s.rollNo !== null)
      .map((s) => ({
        studentId: s.id,
        rollNo: s.rollNo!,
      }));

    if (payload.length === 0) {
      alert("Please assign at least one roll number");
      return;
    }

    // Frontend duplicate check
    const rollSet = new Set(payload.map((p) => p.rollNo));
    if (rollSet.size !== payload.length) {
      alert("Duplicate roll numbers found");
      return;
    }

    try {
      setLoading(true);

      await axios.put(
        `${API_BASE}/v1/admin/bulk-roll-update-by-branch-code`,
        {
          branchCode,
          rolls: payload,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
        }
      );

      alert("Roll numbers assigned successfully");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="mx-auto max-w-4xl bg-white shadow-lg rounded-xl">
        {/* HEADER */}
        <div className="bg-purple-700 text-white text-center py-4 text-2xl font-bold">
          Manpasand Roll Number Assignment
        </div>

        <div className="p-6 space-y-6">
          {/* BRANCH SELECT */}
          <div>
            <label className="block mb-2 font-semibold">Select Branch</label>
            <select
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value)}
              className="w-full border px-4 py-2 rounded-md bg-yellow-100"
            >
              <option value="">-- Select Branch --</option>
              {branches.map((b) => (
                <option key={b.branchCode} value={b.branchCode}>
                  {b.name}
                  {b.location?.location ? ` - ${b.location.location}` : ""} (
                  {b.branchCode})
                </option>
              ))}
            </select>
          </div>

          {/* STUDENT TABLE */}
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-2 bg-purple-100 px-4 py-2 font-semibold">
              <div>Student Name</div>
              <div>Roll Number</div>
            </div>

            {loading && (
              <div className="text-center py-6 text-gray-500">
                Loading students...
              </div>
            )}

            {!loading && students.length === 0 && branchCode && (
              <div className="text-center py-6 text-gray-500">
                No students found
              </div>
            )}

            {!loading &&
              students.map((s) => (
                <div
                  key={s.id}
                  className="grid grid-cols-2 px-4 py-3 border-t items-center"
                >
                  <div className="font-medium">{s.name}</div>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={s.rollNo ?? ""}
                    placeholder="Enter roll"
                    onChange={(e) => updateRollNo(s.id, e.target.value)}
                    className="border px-3 py-1 rounded-md bg-yellow-50 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              ))}
          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSave}
              disabled={
                loading ||
                !branchCode ||
                students.every((s) => s.rollNo === null)
              }
              className={`px-10 py-3 font-semibold rounded-md text-white
                ${
                  !loading &&
                  branchCode &&
                  students.some((s) => s.rollNo !== null)
                    ? "bg-purple-700 hover:bg-purple-800"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              {loading ? "Saving..." : "Save Roll Numbers"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
