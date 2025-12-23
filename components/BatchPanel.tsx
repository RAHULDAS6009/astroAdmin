"use client";

import React, { useEffect, useState } from "react";

/* ================= TYPES ================= */

interface Semester {
  id?: string;
  name: string;
  number?: number;
  startDate?: string;
  endDate?: string;
  fees?: number;
  admissionFee?: number;
  lateFeeDate?: string;
  lateFeeFine?: number;
}

interface Branch {
  id: string;
  name: string;
  branchCode?: string;
  durationMonths?: number;
  daysJSON?: string;
  noofsemster?: number;
  admissionfee?: number;
  monthlyfee?: number;
  classHour?: number;
  classType?: string;
  semesters: Semester[];
}

/* ================= CONFIG ================= */

const API_URL = "https://api.rahuldev.live/api/branches";

/* ================= COMPONENT ================= */

const BranchBatchPanel = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  /* ================= FETCH ================= */

  const loadBranches = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();

    setBranches(
      data.map((b: any) => ({
        ...b,
        semesters: b.semsters || [],
      }))
    );
  };

  useEffect(() => {
    loadBranches();
  }, []);

  /* ================= BRANCH HANDLERS ================= */

  const updateBranch = (index: number, field: keyof Branch, value: any) => {
    const copy = [...branches];
    copy[index] = { ...copy[index], [field]: value };
    setBranches(copy);
  };

  const deleteBranch = async (id: string) => {
    if (!confirm("⚠️ Delete this branch and all its semesters?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadBranches();
  };

  const saveBranch = async (branch: Branch) => {
    await fetch(`${API_URL}/${branch.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...branch,
        semsters: branch.semesters,
      }),
    });

    alert("Branch & semesters updated successfully");
    setEditingId(null);
    loadBranches();
  };

  /* ================= SEMESTER HANDLERS ================= */

  const updateSemester = (
    bIndex: number,
    sIndex: number,
    field: keyof Semester,
    value: any
  ) => {
    const copy = [...branches];
    copy[bIndex].semesters[sIndex] = {
      ...copy[bIndex].semesters[sIndex],
      [field]: value,
    };
    setBranches(copy);
  };

  const addSemester = (bIndex: number) => {
    const copy = [...branches];
    copy[bIndex].semesters.push({
      name: "",
      number: copy[bIndex].semesters.length + 1,
    });
    setBranches(copy);
  };

  const deleteSemester = (bIndex: number, sIndex: number) => {
    if (!confirm("Delete this semester?")) return;
    const copy = [...branches];
    copy[bIndex].semesters.splice(sIndex, 1);
    setBranches(copy);
  };

  /* ================= UI ================= */

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Branch / Batch & Semester Management
      </h1>

      {branches.map((branch, bIndex) => (
        <div key={branch.id} className="border rounded-lg p-5 mb-6 bg-white">
          {/* ===== HEADER ===== */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{branch.name}</h2>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  setEditingId(editingId === branch.id ? null : branch.id)
                }
                className="bg-blue-600 text-white px-4 py-1 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => deleteBranch(branch.id)}
                className="bg-red-600 text-white px-4 py-1 rounded"
              >
                Delete Branch
              </button>
            </div>
          </div>

          {/* ===== EDIT MODE ===== */}
          {editingId === branch.id && (
            <>
              {/* ================= BRANCH FIELDS ================= */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <Input
                  label="Branch Name"
                  value={branch.name}
                  onChange={(v) => updateBranch(bIndex, "name", v)}
                />

                <Input
                  label="Branch Code"
                  value={branch.branchCode || ""}
                  onChange={(v) => updateBranch(bIndex, "branchCode", v)}
                />

                <NumberInput
                  label="Duration (Months)"
                  value={branch.durationMonths}
                  onChange={(v) => updateBranch(bIndex, "durationMonths", v)}
                />

                <Input
                  label="Class Schedule (Days & Time)"
                  value={branch.daysJSON || ""}
                  onChange={(v) => updateBranch(bIndex, "daysJSON", v)}
                />

                <NumberInput
                  label="Monthly Fee (₹)"
                  value={branch.monthlyfee}
                  onChange={(v) => updateBranch(bIndex, "monthlyfee", v)}
                />

                <NumberInput
                  label="Admission Fee (₹)"
                  value={branch.admissionfee}
                  onChange={(v) => updateBranch(bIndex, "admissionfee", v)}
                />

                <NumberInput
                  label="Number of Semesters"
                  value={branch.noofsemster}
                  onChange={(v) => updateBranch(bIndex, "noofsemster", v)}
                />

                <NumberInput
                  label="Class Hours"
                  value={branch.classHour}
                  onChange={(v) => updateBranch(bIndex, "classHour", v)}
                />

                <Input
                  label="Class Type (weekly / monthly)"
                  value={branch.classType || ""}
                  onChange={(v) => updateBranch(bIndex, "classType", v)}
                />
              </div>

              {/* ================= SEMESTERS ================= */}
              <div className="mb-6">
                <div className="flex justify-between mb-3">
                  <h3 className="text-lg font-semibold">Semesters</h3>

                  <button
                    onClick={() => addSemester(bIndex)}
                    className="bg-purple-600 text-white px-3 py-1 rounded"
                  >
                    + Add Semester
                  </button>
                </div>

                {branch.semesters.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No semesters added yet
                  </p>
                )}

                {branch.semesters.map((s, sIndex) => (
                  <div
                    key={sIndex}
                    className="border rounded p-4 mb-3 bg-gray-50"
                  >
                    <div className="flex justify-between mb-3">
                      <h4 className="font-semibold">Semester {sIndex + 1}</h4>
                      <button
                        onClick={() => deleteSemester(bIndex, sIndex)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <Input
                        label="Semester Name"
                        value={s.name}
                        onChange={(v) =>
                          updateSemester(bIndex, sIndex, "name", v)
                        }
                      />

                      <NumberInput
                        label="Semester Number"
                        value={s.number}
                        onChange={(v) =>
                          updateSemester(bIndex, sIndex, "number", v)
                        }
                      />

                      <Input
                        label="Start Date"
                        type="date"
                        value={s.startDate || ""}
                        onChange={(v) =>
                          updateSemester(bIndex, sIndex, "startDate", v)
                        }
                      />

                      <Input
                        label="End Date"
                        type="date"
                        value={s.endDate || ""}
                        onChange={(v) =>
                          updateSemester(bIndex, sIndex, "endDate", v)
                        }
                      />

                      <NumberInput
                        label="Semester Fees (₹)"
                        value={s.fees}
                        onChange={(v) =>
                          updateSemester(bIndex, sIndex, "fees", v)
                        }
                      />

                      <NumberInput
                        label="Admission Fee (₹)"
                        value={s.admissionFee}
                        onChange={(v) =>
                          updateSemester(bIndex, sIndex, "admissionFee", v)
                        }
                      />

                      <Input
                        label="Late Fee Date"
                        type="date"
                        value={s.lateFeeDate || ""}
                        onChange={(v) =>
                          updateSemester(bIndex, sIndex, "lateFeeDate", v)
                        }
                      />

                      <NumberInput
                        label="Late Fee Fine (₹)"
                        value={s.lateFeeFine}
                        onChange={(v) =>
                          updateSemester(bIndex, sIndex, "lateFeeFine", v)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => saveBranch(branch)}
                className="bg-green-600 text-white px-6 py-2 rounded"
              >
                Save Branch & Semesters
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default BranchBatchPanel;

/* ================= REUSABLE INPUTS ================= */

const Input = ({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: any;
  onChange: (v: any) => void;
  type?: string;
}) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded px-2 py-1"
    />
  </div>
);

const NumberInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">{label}</label>
    <input
      type="number"
      value={value ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
      className="border rounded px-2 py-1"
    />
  </div>
);
