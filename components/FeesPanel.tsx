import React, { useState, useEffect } from "react";
import {
  Search,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Edit2,
  Save,
  X,
} from "lucide-react";

interface FeeRecord {
  month: string;
  year: number;
  amount: number;
  paid: boolean;
  paidAmount: number;
  paymentDate: string | null;
  paymentMethod: string | null;
}

interface Student {
  id: number;
  name: string;
  rollNo: string;
  semester: string;
  monthlyFee: number;
  fees: FeeRecord[];
}

interface PaymentDetails {
  amount: string;
  date: string;
  method: string;
}

const FeeManagementSystem: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingMonth, setEditingMonth] = useState<number | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    amount: "",
    date: "",
    method: "cash",
  });

  const generateMonthlyFees = (
    semester: string,
    amount: number
  ): FeeRecord[] => {
    const months = ["August", "September", "October", "November", "December"];
    return months.map((month, idx) => ({
      month: month,
      year: 2024,
      amount: amount,
      paid: idx < 2,
      paidAmount: idx < 2 ? amount : 0,
      paymentDate: idx < 2 ? `2024-${8 + idx}-15` : null,
      paymentMethod: idx < 2 ? "online" : null,
    }));
  };

  useEffect(() => {
    const sampleStudents: Student[] = [
      {
        id: 1,
        name: "John Smith",
        rollNo: "CS101",
        semester: "Fall 2024",
        monthlyFee: 5000,
        fees: generateMonthlyFees("Fall 2024", 5000),
      },
      {
        id: 2,
        name: "Sarah Johnson",
        rollNo: "CS102",
        semester: "Fall 2024",
        monthlyFee: 5000,
        fees: generateMonthlyFees("Fall 2024", 5000),
      },
      {
        id: 3,
        name: "Mike Williams",
        rollNo: "CS103",
        semester: "Fall 2024",
        monthlyFee: 5000,
        fees: generateMonthlyFees("Fall 2024", 5000),
      },
    ];
    setStudents(sampleStudents);
  }, []);

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStudentSelect = (student: Student): void => {
    setSelectedStudent(student);
    setEditingMonth(null);
  };

  const handleEditMonth = (monthIndex: number): void => {
    if (!selectedStudent) return;

    const fee = selectedStudent.fees[monthIndex];
    setEditingMonth(monthIndex);
    setPaymentDetails({
      amount: (fee.paidAmount || fee.amount).toString(),
      date: fee.paymentDate || new Date().toISOString().split("T")[0],
      method: fee.paymentMethod || "cash",
    });
  };

  const handleSavePayment = (): void => {
    if (
      !paymentDetails.amount ||
      !paymentDetails.date ||
      !selectedStudent ||
      editingMonth === null
    ) {
      alert("Please fill in all payment details");
      return;
    }

    const updatedStudents = students.map((student) => {
      if (student.id === selectedStudent.id) {
        const updatedFees = [...student.fees];
        updatedFees[editingMonth] = {
          ...updatedFees[editingMonth],
          paid: true,
          paidAmount: parseFloat(paymentDetails.amount),
          paymentDate: paymentDetails.date,
          paymentMethod: paymentDetails.method,
        };
        return { ...student, fees: updatedFees };
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
    setEditingMonth(null);
    setPaymentDetails({ amount: "", date: "", method: "cash" });
  };

  const calculateTotal = (
    fees: FeeRecord[]
  ): { total: number; paid: number; pending: number } => {
    const total = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const paid = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);
    const pending = total - paid;
    return { total, paid, pending };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Fee Management System
          </h1>
          <p className="text-gray-600">
            Search and manage student fee payments
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
                  const totals = calculateTotal(student.fees);
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
                        {student.semester}
                      </div>
                      <div className="flex justify-between mt-2 text-xs">
                        <span className="text-green-600">
                          Paid: ₹{totals.paid}
                        </span>
                        <span className="text-red-600">
                          Pending: ₹{totals.pending}
                        </span>
                      </div>
                    </div>
                  );
                })}
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
                    <p className="text-gray-600">
                      {selectedStudent.rollNo} - {selectedStudent.semester}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Monthly Fee</div>
                    <div className="text-2xl font-bold text-gray-800">
                      ₹{selectedStudent.monthlyFee}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {(() => {
                    const totals = calculateTotal(selectedStudent.fees);
                    return (
                      <>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm text-blue-600 mb-1">
                            Total Fee
                          </div>
                          <div className="text-2xl font-bold text-blue-700">
                            ₹{totals.total}
                          </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-sm text-green-600 mb-1">
                            Paid
                          </div>
                          <div className="text-2xl font-bold text-green-700">
                            ₹{totals.paid}
                          </div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                          <div className="text-sm text-red-600 mb-1">
                            Pending
                          </div>
                          <div className="text-2xl font-bold text-red-700">
                            ₹{totals.pending}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Month
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Payment Date
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Method
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedStudent.fees.map((fee, index) => (
                        <React.Fragment key={index}>
                          <tr
                            className={
                              editingMonth === index ? "bg-yellow-50" : ""
                            }
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <Calendar
                                  size={16}
                                  className="text-gray-400 mr-2"
                                />
                                <span className="font-medium text-gray-800">
                                  {fee.month} {fee.year}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              ₹{fee.amount}
                            </td>
                            <td className="px-4 py-3">
                              {fee.paid ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle size={14} className="mr-1" />
                                  Paid
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <XCircle size={14} className="mr-1" />
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-sm">
                              {fee.paymentDate || "-"}
                            </td>
                            <td className="px-4 py-3">
                              {fee.paymentMethod ? (
                                <span className="text-sm text-gray-600 capitalize">
                                  {fee.paymentMethod}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {editingMonth === index ? (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={handleSavePayment}
                                    className="text-green-600 hover:text-green-700"
                                    title="Save"
                                  >
                                    <Save size={18} />
                                  </button>
                                  <button
                                    onClick={() => setEditingMonth(null)}
                                    className="text-red-600 hover:text-red-700"
                                    title="Cancel"
                                  >
                                    <X size={18} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleEditMonth(index)}
                                  className="text-blue-600 hover:text-blue-700"
                                  title="Edit Payment"
                                >
                                  <Edit2 size={18} />
                                </button>
                              )}
                            </td>
                          </tr>
                          {editingMonth === index && (
                            <tr className="bg-yellow-50">
                              <td colSpan={6} className="px-4 py-4">
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Amount Paid (₹)
                                    </label>
                                    <input
                                      type="number"
                                      value={paymentDetails.amount}
                                      onChange={(e) =>
                                        setPaymentDetails({
                                          ...paymentDetails,
                                          amount: e.target.value,
                                        })
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="Enter amount"
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
                                      Payment Method
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
                                      <option value="cash">Cash</option>
                                      <option value="online">Online</option>
                                      <option value="cheque">Cheque</option>
                                      <option value="card">Card</option>
                                    </select>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <DollarSign size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Student Selected
                </h3>
                <p className="text-gray-500">
                  Search and select a student to view and manage their fee
                  details
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
