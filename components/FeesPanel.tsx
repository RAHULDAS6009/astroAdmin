import React, { useState, useEffect } from "react";
import { Search, DollarSign, Edit2, Save, X } from "lucide-react";

interface FeeRecord {
  details: string;
  date: string;
  fees: number;
  lateFine: number;
  totalAmount: number;
  paymentMode: string;
}

interface Semester {
  name: string;
  dkp: string;
  startMonth: string;
  endMonth: string;
  examDate: string;
  marksObtained: number;
  grade: string;
  fees: FeeRecord[];
}

interface Student {
  id: number;
  name: string;
  rollNo: string;
  semesters: Semester[];
}

interface PaymentDetails {
  fees: string;
  lateFine: string;
  date: string;
  method: string;
}

const FeeManagementSystem: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number>(0);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    fees: "",
    lateFine: "",
    date: "",
    method: "via website",
  });
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("Semester 1");
  const [paidList, setPaidList] = useState<Student[]>([]);
  const [unpaidList, setUnpaidList] = useState<Student[]>([]);

  const generateSemesterData = (): Semester[] => {
    return [
      {
        name: "Semester 1",
        dkp: "DKP",
        startMonth: "Jan-25",
        endMonth: "Mar-25",
        examDate: "29th March 2025",
        marksObtained: 170,
        grade: "1st Division",
        fees: [
          {
            details: "Admission",
            date: "5th Dec 2024",
            fees: 1000,
            lateFine: 0,
            totalAmount: 1000,
            paymentMode: "via website",
          },
          {
            details: "Month Jan 25",
            date: "7th Jan 2025",
            fees: 1000,
            lateFine: 0,
            totalAmount: 1000,
            paymentMode: "via website",
          },
          {
            details: "Month Feb 25",
            date: "10th Jan 2025",
            fees: 1000,
            lateFine: 0,
            totalAmount: 1000,
            paymentMode: "cash manual",
          },
          {
            details: "Month Mar 25",
            date: "15th March 2025",
            fees: 1000,
            lateFine: 50,
            totalAmount: 1050,
            paymentMode: "via website",
          },
        ],
      },
      {
        name: "Semester 2",
        dkp: "DKP",
        startMonth: "Apr-25",
        endMonth: "Jun-25",
        examDate: "28th June 2025",
        marksObtained: 0,
        grade: "",
        fees: [
          {
            details: "Month Apr 25",
            date: "",
            fees: 1000,
            lateFine: 0,
            totalAmount: 1000,
            paymentMode: "",
          },
          {
            details: "Month May 25",
            date: "",
            fees: 1000,
            lateFine: 0,
            totalAmount: 1000,
            paymentMode: "",
          },
          {
            details: "Month Jun 25",
            date: "",
            fees: 1000,
            lateFine: 0,
            totalAmount: 1000,
            paymentMode: "",
          },
        ],
      },
      {
        name: "Semester 3",
        dkp: "DKP",
        startMonth: "Jul-25",
        endMonth: "Sep-25",
        examDate: "30th September 2025",
        marksObtained: 0,
        grade: "",
        fees: [
          {
            details: "Month Jul 25",
            date: "",
            fees: 1000,
            lateFine: 0,
            totalAmount: 1000,
            paymentMode: "",
          },
          {
            details: "Month Aug 25",
            date: "",
            fees: 1000,
            lateFine: 0,
            totalAmount: 1000,
            paymentMode: "",
          },
          {
            details: "Month Sep 25",
            date: "",
            fees: 1000,
            lateFine: 0,
            totalAmount: 1000,
            paymentMode: "",
          },
        ],
      },
      {
        name: "Semester 4",
        dkp: "DKP",
        startMonth: "Oct-25",
        endMonth: "Dec-25",
        examDate: "29th December 2025",
        marksObtained: 0,
        grade: "",
        fees: [
          {
            details: "Month Oct 25",
            date: "",
            fees: 1000,
            lateFine: 0,
            totalAmount: 1000,
            paymentMode: "",
          },
          {
            details: "Month Nov 25",
            date: "",
            fees: 1000,
            lateFine: 0,
            totalAmount: 1000,
            paymentMode: "",
          },
          {
            details: "Month Dec 25",
            date: "",
            fees: 1000,
            lateFine: 0,
            totalAmount: 1000,
            paymentMode: "",
          },
        ],
      },
    ];
  };

  useEffect(() => {
    const sampleStudents: Student[] = [
      {
        id: 1,
        name: "John Smith",
        rollNo: "CS101",
        semesters: generateSemesterData(),
      },
      {
        id: 2,
        name: "Sarah Johnson",
        rollNo: "CS102",
        semesters: generateSemesterData(),
      },
      {
        id: 3,
        name: "Mike Williams",
        rollNo: "CS103",
        semesters: generateSemesterData(),
      },
    ];
    setStudents(sampleStudents);
  }, []);

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const checkMonthlyPayments = () => {
    if (!selectedMonth || !selectedBatch) return;

    const paid: Student[] = [];
    const unpaid: Student[] = [];

    students.forEach((student) => {
      const semester = student.semesters.find(
        (sem) => sem.name === selectedBatch
      );

      if (!semester) return;

      const record = semester.fees.find((fee) =>
        fee.details.toLowerCase().includes(selectedMonth.toLowerCase())
      );

      if (record && record.date) {
        paid.push(student);
      } else {
        unpaid.push(student);
      }
    });

    setPaidList(paid);
    setUnpaidList(unpaid);
  };

  const handleStudentSelect = (student: Student): void => {
    setSelectedStudent(student);
    setSelectedSemester(0);
    setEditingRow(null);
  };

  const handleEditRow = (rowIndex: number): void => {
    if (!selectedStudent) return;

    const fee = selectedStudent.semesters[selectedSemester].fees[rowIndex];
    setEditingRow(rowIndex);
    setPaymentDetails({
      fees: fee.fees.toString(),
      lateFine: fee.lateFine.toString(),
      date: fee.date || new Date().toISOString().split("T")[0],
      method: fee.paymentMode || "via website",
    });
  };

  const handleSavePayment = (): void => {
    if (
      !paymentDetails.fees ||
      !paymentDetails.date ||
      !selectedStudent ||
      editingRow === null
    ) {
      alert("Please fill in all payment details");
      return;
    }

    const updatedStudents = students.map((student) => {
      if (student.id === selectedStudent.id) {
        const updatedSemesters = [...student.semesters];
        const updatedFees = [...updatedSemesters[selectedSemester].fees];
        const fees = parseFloat(paymentDetails.fees);
        const lateFine = parseFloat(paymentDetails.lateFine || "0");

        updatedFees[editingRow] = {
          ...updatedFees[editingRow],
          fees: fees,
          lateFine: lateFine,
          totalAmount: fees + lateFine,
          date: paymentDetails.date,
          paymentMode: paymentDetails.method,
        };
        updatedSemesters[selectedSemester] = {
          ...updatedSemesters[selectedSemester],
          fees: updatedFees,
        };
        return { ...student, semesters: updatedSemesters };
      }
      return student;
    });

    setStudents(updatedStudents);
    const updatedStudent = updatedStudents.find(
      (s) => s.id === selectedStudent.id
    );
    if (updatedStudent) {
      setSelectedStudent(updatedStudent);
    }
    setEditingRow(null);
    setPaymentDetails({
      fees: "",
      lateFine: "",
      date: "",
      method: "via website",
    });
  };

  const calculateTotal = (fees: FeeRecord[]): number => {
    return fees.reduce((sum, fee) => sum + fee.totalAmount, 0);
  };

  const calculateTotalPaid = (student: Student): number => {
    return student.semesters.reduce((total, semester) => {
      return (
        total +
        semester.fees.reduce((sum, fee) => {
          return sum + (fee.date ? fee.totalAmount : 0);
        }, 0)
      );
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Fee Management System
          </h1>
          <p className="text-gray-600">
            Search and manage student fee payments across 4 semesters
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="relative mb-4">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by name or roll no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredStudents.map((student) => {
                  const totalPaid = calculateTotalPaid(student);
                  return (
                    <div
                      key={student.id}
                      onClick={() => handleStudentSelect(student)}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedStudent?.id === student.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-semibold text-gray-800">
                        {student.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {student.rollNo}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        4 Semesters
                      </div>
                      <div className="mt-2 text-xs text-green-600">
                        Total Paid: ₹{totalPaid}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6 mt-16 border">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Monthly Fee Status
                </h3>

                <div className="mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Select Batch
                  </label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full border p-2 rounded-lg mt-1"
                  >
                    {[
                      "Semester 1",
                      "Semester 2",
                      "Semester 3",
                      "Semester 4",
                    ].map((sem) => (
                      <option key={sem}>{sem}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Select Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full border p-2 rounded-lg mt-1"
                  >
                    <option value="">-- Select Month --</option>
                    <option value="jan 25">Jan 25</option>
                    <option value="feb 25">Feb 25</option>
                    <option value="mar 25">Mar 25</option>
                    <option value="apr 25">Apr 25</option>
                    <option value="may 25">May 25</option>
                    <option value="jun 25">Jun 25</option>
                    <option value="jul 25">Jul 25</option>
                    <option value="aug 25">Aug 25</option>
                    <option value="sep 25">Sep 25</option>
                    <option value="oct 25">Oct 25</option>
                    <option value="nov 25">Nov 25</option>
                    <option value="dec 25">Dec 25</option>
                  </select>
                </div>

                <button
                  onClick={checkMonthlyPayments}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg mt-2"
                >
                  Check Status
                </button>

                {selectedMonth && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-green-700 mb-2">
                      Paid Students ({paidList.length})
                    </h4>
                    <ul className="text-sm mb-4">
                      {paidList.map((s) => (
                        <li key={s.id} className="text-green-600">
                          ✓ {s.name} ({s.rollNo})
                        </li>
                      ))}
                    </ul>

                    <h4 className="font-semibold text-red-700 mb-2">
                      Not Paid ({unpaidList.length})
                    </h4>
                    <ul className="text-sm">
                      {unpaidList.map((s) => (
                        <li key={s.id} className="text-red-600">
                          ✗ {s.name} ({s.rollNo})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedStudent ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedStudent.name}
                    </h2>
                    <p className="text-gray-600">{selectedStudent.rollNo}</p>
                  </div>
                </div>

                {selectedStudent.semesters.map((semester, semIndex) => {
                  const total = calculateTotal(semester.fees);

                  return (
                    <div
                      key={semIndex}
                      className="mb-10 border rounded-lg p-5 bg-gray-50"
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        {semester.name}
                      </h3>

                      <div className="grid grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
                        <div>
                          <div className="text-sm text-gray-600">DKP</div>
                          <div className="font-semibold">{semester.dkp}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Duration</div>
                          <div className="font-semibold">
                            {semester.startMonth} - {semester.endMonth}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">
                            DKP Exam Date
                          </div>
                          <div className="font-semibold">
                            {semester.examDate}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">
                            Marks Obtained
                          </div>
                          <div className="font-semibold">
                            {semester.marksObtained > 0
                              ? `${semester.marksObtained} - ${semester.grade}`
                              : "-"}
                          </div>
                        </div>
                      </div>

                      {/* Fee Table */}
                      <div className="border rounded-lg overflow-x-auto bg-white">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-3 text-left">Details</th>
                              <th className="px-4 py-3 text-left">Date</th>
                              <th className="px-4 py-3 text-left">Fees</th>
                              <th className="px-4 py-3 text-left">Late Fine</th>
                              <th className="px-4 py-3 text-left">
                                Total Amount
                              </th>
                              <th className="px-4 py-3 text-left">
                                Payment Mode
                              </th>
                              <th className="px-4 py-3 text-left">Action</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-200">
                            {semester.fees.map((fee, feeIndex) => {
                              const isEditing =
                                editingRow ===
                                Number(`${semIndex}-${feeIndex}`);
                              return (
                                <React.Fragment key={feeIndex}>
                                  <tr
                                    className={isEditing ? "bg-yellow-50" : ""}
                                  >
                                    <td className="px-4 py-3">{fee.details}</td>
                                    <td className="px-4 py-3">
                                      {fee.date || "-"}
                                    </td>
                                    <td className="px-4 py-3">{fee.fees}</td>
                                    <td className="px-4 py-3 text-red-600">
                                      {fee.lateFine > 0 ? fee.lateFine : "0-"}
                                    </td>
                                    <td className="px-4 py-3">
                                      {fee.totalAmount}
                                    </td>
                                    <td className="px-4 py-3">
                                      {fee.paymentMode || "-"}
                                    </td>

                                    <td className="px-4 py-3">
                                      {isEditing ? (
                                        <div className="flex gap-2">
                                          <button
                                            onClick={handleSavePayment}
                                            className="text-green-600"
                                          >
                                            <Save size={18} />
                                          </button>
                                          <button
                                            onClick={() => setEditingRow(null)}
                                            className="text-red-600"
                                          >
                                            <X size={18} />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setSelectedSemester(semIndex);
                                            handleEditRow(feeIndex);
                                            setEditingRow(
                                              Number(`${semIndex}-${feeIndex}`)
                                            );
                                          }}
                                          className="text-blue-600"
                                        >
                                          <Edit2 size={18} />
                                        </button>
                                      )}
                                    </td>
                                  </tr>

                                  {/* Editing form */}
                                  {isEditing && (
                                    <tr className="bg-yellow-50">
                                      <td colSpan={7} className="px-4 py-4">
                                        <div className="grid grid-cols-4 gap-4">
                                          {/* same input fields as before */}
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}

                            {/* Total row */}
                            <tr className="bg-gray-100 font-semibold">
                              <td colSpan={4} className="px-4 py-3 text-right">
                                Total
                              </td>
                              <td className="px-4 py-3">{total}</td>
                              <td colSpan={2}></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}

                {(() => {
                  const semester = selectedStudent.semesters[selectedSemester];
                  const total = calculateTotal(semester.fees);

                  return (
                    <div>
                      <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <div className="text-sm text-gray-600">DKP</div>
                          <div className="font-semibold">{semester.dkp}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Duration</div>
                          <div className="font-semibold">
                            {semester.startMonth} - {semester.endMonth}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">
                            DKP Exam Date
                          </div>
                          <div className="font-semibold">
                            {semester.examDate}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">
                            Marks Obtained
                          </div>
                          <div className="font-semibold">
                            {semester.marksObtained > 0
                              ? `${semester.marksObtained} - ${semester.grade}`
                              : "-"}
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r">
                                Details
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r">
                                Date
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r">
                                Fees
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r">
                                Late Fine
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r">
                                Total Amount
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r">
                                Payment Mode
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {semester.fees.map((fee, index) => (
                              <React.Fragment key={index}>
                                <tr
                                  className={
                                    editingRow === index ? "bg-yellow-50" : ""
                                  }
                                >
                                  <td className="px-4 py-3 border-r font-medium">
                                    {fee.details}
                                  </td>
                                  <td className="px-4 py-3 border-r text-sm">
                                    {fee.date || "-"}
                                  </td>
                                  <td className="px-4 py-3 border-r">
                                    {fee.fees}
                                  </td>
                                  <td className="px-4 py-3 border-r text-red-600">
                                    {fee.lateFine > 0 ? fee.lateFine : "0-"}
                                  </td>
                                  <td className="px-4 py-3 border-r font-semibold">
                                    {fee.totalAmount}
                                  </td>
                                  <td className="px-4 py-3 border-r text-sm">
                                    {fee.paymentMode || "-"}
                                  </td>
                                  <td className="px-4 py-3">
                                    {editingRow === index ? (
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={handleSavePayment}
                                          className="text-green-600 hover:text-green-700"
                                          title="Save"
                                        >
                                          <Save size={18} />
                                        </button>
                                        <button
                                          onClick={() => setEditingRow(null)}
                                          className="text-red-600 hover:text-red-700"
                                          title="Cancel"
                                        >
                                          <X size={18} />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleEditRow(index)}
                                        className="text-blue-600 hover:text-blue-700"
                                        title="Edit Payment"
                                      >
                                        <Edit2 size={18} />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                                {editingRow === index && (
                                  <tr className="bg-yellow-50">
                                    <td colSpan={7} className="px-4 py-4">
                                      <div className="grid grid-cols-4 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fees (₹)
                                          </label>
                                          <input
                                            type="number"
                                            value={paymentDetails.fees}
                                            onChange={(e) =>
                                              setPaymentDetails({
                                                ...paymentDetails,
                                                fees: e.target.value,
                                              })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Late Fine (₹)
                                          </label>
                                          <input
                                            type="number"
                                            value={paymentDetails.lateFine}
                                            onChange={(e) =>
                                              setPaymentDetails({
                                                ...paymentDetails,
                                                lateFine: e.target.value,
                                              })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Payment Date
                                          </label>
                                          <input
                                            type="date"
                                            value={paymentDetails.date}
                                            onChange={(e) =>
                                              setPaymentDetails({
                                                ...paymentDetails,
                                                date: e.target.value,
                                              })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Payment Mode
                                          </label>
                                          <select
                                            value={paymentDetails.method}
                                            onChange={(e) =>
                                              setPaymentDetails({
                                                ...paymentDetails,
                                                method: e.target.value,
                                              })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          >
                                            <option value="via website">
                                              Via Website
                                            </option>
                                            <option value="cash manual">
                                              Cash Manual
                                            </option>
                                            <option value="bank transfer">
                                              Bank Transfer
                                            </option>
                                            <option value="cheque">
                                              Cheque
                                            </option>
                                          </select>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))}
                            <tr className="bg-gray-50 font-semibold">
                              <td
                                colSpan={4}
                                className="px-4 py-3 text-right border-r"
                              >
                                Total
                              </td>
                              <td className="px-4 py-3 border-r">{total}</td>
                              <td colSpan={2} className="px-4 py-3"></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <DollarSign size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Student Selected
                </h3>
                <p className="text-gray-500">
                  Search and select a student to view and manage their fee
                  details across 4 semesters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeManagementSystem;
