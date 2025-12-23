import React, { useState, useEffect } from "react";
import {
  Search,
  DollarSign,
  Edit2,
  Save,
  X,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api/v1";

interface FeeRecord {
  id?: number;
  semesterId?: string;
  description: string;
  paymentDate: string | null;
  amount: number;
  lateFine: number;
  status: string;
  paymentMode: string | null;
  paymentId?: string | null;
}

interface Semester {
  id: string;
  name: string;
  number: number;
  startDate: string;
  endDate: string;
  fees: number;
  lateFeeDate: string | null;
  lateFeeFine: number;
  admissionFee: number;
}

interface Branch {
  id: string;
  name: string;
  semsters: Semester[];
}

interface Course {
  id: number;
  name: string;
}

interface Student {
  id: number;
  studentId: string;
  name: string;
  email: string;
  mobileNumber: string;
  courseMode: string;
  course: Course | null;
  branch: Branch | null;
  fees: FeeRecord[];
}

interface PaymentDetails {
  amount: string;
  lateFine: string;
  date: string;
  mode: string;
  description: string;
}

const FeeManagementSystem: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingFee, setEditingFee] = useState<any | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    amount: "",
    lateFine: "",
    date: new Date().toISOString().split("T")[0],
    mode: "Cash Manual",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [paidList, setPaidList] = useState<Student[]>([]);
  const [unpaidList, setUnpaidList] = useState<Student[]>([]);

  // Fetch all students
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/students`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch students");

      const result = await response.json();
      console.log("📊 Fetched Students Data:", result.data);

      if (result.success) {
        setStudents(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch students");
      console.error("❌ Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single student details
  const fetchStudentDetails = async (studentId: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/students/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch student details");

      const result = await response.json();
      console.log("📊 Student Details:", result.data);

      if (result.success) {
        setSelectedStudent(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch student");
      console.error("❌ Error fetching student details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (student) =>
      (student.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (student.studentId?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      )
  );

  // Calculate late fine (matching HTML logic)
  // const calculateLateFine = (dueDate: string, semester: Semester) => {
  //   const today = new Date();
  //   const due = new Date(dueDate);

  //   if (today <= due) return 0;

  //   const lateFeeDate = semester.lateFeeDate
  //     ? new Date(semester.lateFeeDate)
  //     : due;

  //   return today > lateFeeDate ? semester.lateFeeFine || 0 : 0;
  // };
  const calculateLateFine = (
    monthIndex: number, // 0–11
    year: number,
    semester: Semester
  ) => {
    if (!semester.lateFeeDate || !semester.lateFeeFine) return 0;

    const lateFeeDay = new Date(semester.lateFeeDate).getDate();
    const today = new Date();

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const todayDate = today.getDate();

    // Future month → no fine
    if (
      year > currentYear ||
      (year === currentYear && monthIndex > currentMonth)
    ) {
      return 0;
    }

    let lateDays = 0;

    // Past month
    if (
      year < currentYear ||
      (year === currentYear && monthIndex < currentMonth)
    ) {
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      lateDays = Math.max(0, daysInMonth - lateFeeDay);
    }

    // Current month
    if (year === currentYear && monthIndex === currentMonth) {
      lateDays = Math.max(0, todayDate - lateFeeDay);
    }

    return lateDays * semester.lateFeeFine;
  };

  // Generate monthly payment structure (EXACTLY matching HTML logic)
  const generateMonthlyPayments = (
    semester: Semester,
    semesterFees: FeeRecord[]
  ) => {
    console.log("hello from semster", semester);
    console.log("hello from Fee Record", semesterFees);
    const startDate = new Date(semester.startDate);
    const endDate = new Date(semester.endDate);
    const payments: any[] = [];

    // Admission Payment
    const admissionPayment = semesterFees.find(
      (f) => f.description === "Admission Fee"
    );

    payments.push({
      id: admissionPayment?.id,
      detail: "Admission",
      date: admissionPayment
        ? formatDate(admissionPayment.paymentDate)
        : "Pending",
      fees: semester.admissionFee || 0,
      lateFine: admissionPayment?.lateFine || 0,
      status: admissionPayment ? "Paid" : "Pending",
      mode: admissionPayment?.paymentMode || "-",
      isPending: !admissionPayment,
      dueDate: formatDate(semester.startDate),
      description: "Admission Fee",
      semesterId: semester.id,
      paymentDate: admissionPayment?.paymentDate || null,
    });

    // Monthly Fees
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Get all monthly fee payments sorted by payment date
    const monthlyPayments = semesterFees
      .filter((f) => f.description === "Monthly Fee" && f.paymentDate)
      .sort(
        (a, b) =>
          new Date(a.paymentDate!).getTime() -
          new Date(b.paymentDate!).getTime()
      );

    let paymentIndex = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dueDate = new Date(current.getFullYear(), current.getMonth(), 5);

      const monthKey = `Month ${monthNames[current.getMonth()]}-${current
        .getFullYear()
        .toString()
        .slice(-2)}`;

      // Check if there's a payment available for this month slot
      const monthPayment =
        paymentIndex < monthlyPayments.length
          ? monthlyPayments[paymentIndex]
          : null;

      const monthIndex = current.getMonth(); // 0–11
      const year = current.getFullYear();

      const lateFine = monthPayment
        ? monthPayment.lateFine
        : calculateLateFine(monthIndex, year, semester);

      payments.push({
        id: monthPayment?.id,
        detail: monthKey,
        date: monthPayment
          ? formatDate(monthPayment.paymentDate)
          : `Due: 5th ${
              monthNames[current.getMonth()]
            } ${current.getFullYear()}`,
        fees: semester.fees || 0,
        lateFine: lateFine,
        status: monthPayment ? "Paid" : "Pending",
        mode: monthPayment?.paymentMode || "-",
        isPending: !monthPayment,
        dueDate: formatDate(dueDate.toISOString()),
        description: "Monthly Fee",
        semesterId: semester.id,
        monthIndex: current.getMonth(),
        year: current.getFullYear(),
        paymentDate: monthPayment?.paymentDate || null,
      });

      // If a payment was used for this month, move to next payment
      if (monthPayment) {
        paymentIndex++;
      }

      current.setMonth(current.getMonth() + 1);
    }

    return payments;
  };

  // Handle manual payment entry
  const handleSavePayment = async () => {
    if (!selectedStudent || !editingFee) {
      alert("No fee record selected");
      return;
    }

    if (!paymentDetails.amount || !paymentDetails.date) {
      alert("Please fill in payment amount and date");
      return;
    }

    setLoading(true);
    try {
      console.log("💳 Saving payment:", {
        studentId: selectedStudent.id,
        semesterId: editingFee.semesterId,
        amount: parseFloat(paymentDetails.amount),
        lateFine: parseFloat(paymentDetails.lateFine) || 0,
        description: paymentDetails.description || editingFee.description,
        paymentMode: paymentDetails.mode,
        paymentDate: paymentDetails.date,
      });

      // Create manual payment record
      const response = await fetch(
        `${API_BASE_URL}/admin/fees/manual-payment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: selectedStudent.id,
            semesterId: editingFee.semesterId,
            amount: parseFloat(paymentDetails.amount),
            lateFine: parseFloat(paymentDetails.lateFine) || 0,
            description: paymentDetails.description || editingFee.description,
            paymentMode: paymentDetails.mode,
            paymentDate: paymentDetails.date,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save payment");
      }

      const result = await response.json();
      console.log("✅ Payment saved:", result);

      if (result.success) {
        alert("Payment saved successfully!");
        await fetchStudentDetails(selectedStudent.id);
        await fetchStudents();
        setEditingFee(null);
        setPaymentDetails({
          amount: "",
          lateFine: "",
          date: new Date().toISOString().split("T")[0],
          mode: "Cash Manual",
          description: "",
        });
      }
    } catch (err) {
      console.error("❌ Payment save error:", err);
      alert(
        "Failed to save payment: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  // Check monthly payment status (matching HTML logic)
  const checkMonthlyPayments = () => {
    if (!selectedMonth || !selectedBatch) {
      alert("Please select both batch and month");
      return;
    }

    const paid: Student[] = [];
    const unpaid: Student[] = [];

    // Parse the selected month (e.g., "Jan 25" -> Jan 2025)
    const [monthName, yearShort] = selectedMonth.split(" ");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthIndex = monthNames.indexOf(monthName);
    const year = 2000 + parseInt(yearShort);

    console.log("🔍 Checking payments for:", {
      selectedBatch,
      selectedMonth,
      monthIndex,
      year,
    });

    students.forEach((student) => {
      if (!student.branch?.semsters) {
        console.warn("⚠️ Student missing branch/semesters:", student.name);
        return;
      }

      // Find the matching semester
      const semester = student.branch.semsters.find(
        (sem) => `Semester ${sem.number}` === selectedBatch
      );

      if (!semester) {
        return;
      }

      if (!student.fees || !Array.isArray(student.fees)) {
        unpaid.push(student);
        return;
      }

      console.log("xyz", semester);

      // Generate payments to check against
      const payments = generateMonthlyPayments(semester, student.fees);

      // Find the payment for this specific month
      const monthPayment = payments.find((p) => {
        if (p.description !== "Monthly Fee") return false;
        return p.monthIndex === monthIndex && p.year === year;
      });

      if (monthPayment && monthPayment.status === "Paid") {
        paid.push(student);
      } else {
        unpaid.push(student);
      }
    });

    console.log("📊 Payment Status Results:", {
      totalStudents: students.length,
      paid: paid.length,
      unpaid: unpaid.length,
    });

    setPaidList(paid);
    setUnpaidList(unpaid);
  };

  const handleStudentSelect = (student: Student) => {
    fetchStudentDetails(student.id);
    setEditingFee(null);
  };

  const handleEditFee = (fee: any) => {
    setEditingFee(fee);
    setPaymentDetails({
      amount: fee.fees.toString(),
      lateFine: fee.lateFine.toString(),
      date: fee.paymentDate
        ? new Date(fee.paymentDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      mode: fee.mode === "-" ? "Cash Manual" : fee.mode,
      description: fee.description,
    });
  };

  // Generate unique identifier for each payment row
  const getPaymentKey = (payment: any) => {
    return `${payment.semesterId}-${payment.description}-${payment.detail}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const calculateTotal = (payments: any[]) => {
    return payments.reduce((sum, p) => sum + p.fees + p.lateFine, 0);
  };

  const calculateTotalPaid = (student: Student) => {
    if (!student.fees || !Array.isArray(student.fees)) {
      return 0;
    }
    return student.fees
      .filter((f) => f && f.status === "Paid")
      .reduce((sum, f) => sum + (f.amount || 0) + (f.lateFine || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Fee Management System
              </h1>
              <p className="text-gray-600">
                Manage student fee payments and track payment status
              </p>
            </div>
            <button
              onClick={fetchStudents}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="relative mb-4">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No students found
                  </div>
                ) : (
                  filteredStudents.map((student) => {
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
                          {student.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {student.studentId || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {student.branch?.semsters?.length || 0} Semesters
                        </div>
                        <div className="mt-2 text-xs text-green-600">
                          Total Paid: ₹{totalPaid}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Monthly Status Checker */}
              <div className="mt-6 pt-6 border-t">
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
                    <option value="">-- Select Batch --</option>
                    {[1, 2, 3, 4].map((num) => (
                      <option key={num} value={`Semester ${num}`}>
                        Semester {num}
                      </option>
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
                    {[
                      "Jan 25",
                      "Feb 25",
                      "Mar 25",
                      "Apr 25",
                      "May 25",
                      "Jun 25",
                      "Jul 25",
                      "Aug 25",
                      "Sep 25",
                      "Oct 25",
                      "Nov 25",
                      "Dec 25",
                    ].map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={checkMonthlyPayments}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Check Status
                </button>

                {(paidList.length > 0 || unpaidList.length > 0) &&
                  selectedMonth && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-green-700 mb-2">
                        Paid Students ({paidList.length})
                      </h4>
                      <ul className="text-sm mb-4 max-h-32 overflow-y-auto">
                        {paidList.length > 0 ? (
                          paidList.map((s) => (
                            <li key={s.id} className="text-green-600">
                              ✓ {s.name} ({s.studentId})
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 italic">
                            No students have paid
                          </li>
                        )}
                      </ul>

                      <h4 className="font-semibold text-red-700 mb-2">
                        Not Paid ({unpaidList.length})
                      </h4>
                      <ul className="text-sm max-h-32 overflow-y-auto">
                        {unpaidList.length > 0 ? (
                          unpaidList.map((s) => (
                            <li key={s.id} className="text-red-600">
                              ✗ {s.name} ({s.studentId})
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 italic">
                            All students have paid
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {selectedStudent ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedStudent.name}
                  </h2>
                  <p className="text-gray-600">{selectedStudent.studentId}</p>
                  <p className="text-sm text-gray-500">
                    {selectedStudent.course?.name} -{" "}
                    {selectedStudent.branch?.name}
                  </p>
                </div>

                {selectedStudent.branch?.semsters?.map((semester, semIndex) => {
                  const semesterFees = selectedStudent.fees.filter(
                    (f) => f.semesterId === semester.id
                  );
                  const payments = generateMonthlyPayments(
                    semester,
                    semesterFees
                  );
                  const total = calculateTotal(payments);
                  console.log("-----------------> >>>>>>", payments);

                  return (
                    <div
                      key={semester.id}
                      className="mb-8 border rounded-lg p-5 bg-gray-50"
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Semester {semester.number}: {semester.name}
                      </h3>

                      <div className="grid grid-cols-2 gap-4 mb-4 bg-white p-4 rounded-lg">
                        <div>
                          <div className="text-sm text-gray-600">Duration</div>
                          <div className="font-semibold">
                            {formatDate(semester.startDate)} -{" "}
                            {formatDate(semester.endDate)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">
                            Monthly Fee
                          </div>
                          <div className="font-semibold">₹{semester.fees}</div>
                        </div>
                      </div>

                      {/* Fee Table */}
                      <div className="border rounded-lg overflow-x-auto bg-white">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-3 text-left">Details</th>
                              <th className="px-4 py-3 text-left">Date</th>
                              <th className="px-4 py-3 text-left">Amount</th>
                              <th className="px-4 py-3 text-left">Late Fine</th>
                              <th className="px-4 py-3 text-left">Total</th>
                              <th className="px-4 py-3 text-left">Status</th>
                              <th className="px-4 py-3 text-left">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {payments.map((payment, idx) => {
                              const isEditing =
                                editingFee?.description ===
                                  payment.description &&
                                editingFee?.semesterId === payment.semesterId;

                              return (
                                <React.Fragment key={idx}>
                                  <tr
                                    className={isEditing ? "bg-yellow-50" : ""}
                                  >
                                    <td className="px-4 py-3">
                                      {payment.detail}
                                    </td>
                                    <td className="px-4 py-3">
                                      {payment.date.startsWith("Due") ||
                                      payment.date.startsWith("Pending")
                                        ? "Will be Paid"
                                        : formatDate(payment.date)}
                                    </td>
                                    <td className="px-4 py-3">
                                      ₹{payment.fees}
                                    </td>
                                    <td className="px-4 py-3 text-red-600">
                                      {payment.lateFine > 0
                                        ? `₹${payment.lateFine}`
                                        : "-"}
                                    </td>
                                    <td className="px-4 py-3 font-bold">
                                      ₹{payment.fees + payment.lateFine}
                                    </td>
                                    <td className="px-4 py-3">
                                      <span
                                        className={`px-3 py-1 rounded-full text-xs ${
                                          payment.status === "Paid"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                        }`}
                                      >
                                        {payment.status}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      {isEditing ? (
                                        <div className="flex gap-2">
                                          <button
                                            onClick={handleSavePayment}
                                            disabled={loading}
                                            className="text-green-600 hover:text-green-700"
                                          >
                                            <Save size={18} />
                                          </button>
                                          <button
                                            onClick={() => setEditingFee(null)}
                                            className="text-red-600 hover:text-red-700"
                                          >
                                            <X size={18} />
                                          </button>
                                        </div>
                                      ) : (
                                        payment.status === "Pending" && (
                                          <button
                                            onClick={() =>
                                              handleEditFee(payment)
                                            }
                                            className="text-blue-600 hover:text-blue-700"
                                          >
                                            <Edit2 size={18} />
                                          </button>
                                        )
                                      )}
                                    </td>
                                  </tr>

                                  {isEditing && (
                                    <tr className="bg-yellow-50">
                                      <td colSpan={7} className="px-4 py-4">
                                        <div className="grid grid-cols-4 gap-4">
                                          <div>
                                            <label className="block text-sm font-medium mb-1">
                                              Amount (₹)
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
                                              className="w-full px-3 py-2 border rounded-lg"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium mb-1">
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
                                              className="w-full px-3 py-2 border rounded-lg"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium mb-1">
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
                                              className="w-full px-3 py-2 border rounded-lg"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium mb-1">
                                              Payment Mode
                                            </label>
                                            <select
                                              value={paymentDetails.mode}
                                              onChange={(e) =>
                                                setPaymentDetails({
                                                  ...paymentDetails,
                                                  mode: e.target.value,
                                                })
                                              }
                                              className="w-full px-3 py-2 border rounded-lg"
                                            >
                                              <option value="Cash Manual">
                                                Cash Manual
                                              </option>
                                              <option value="Bank Transfer">
                                                Bank Transfer
                                              </option>
                                              <option value="Cheque">
                                                Cheque
                                              </option>
                                              <option value="UPI">UPI</option>
                                            </select>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                            <tr className="bg-gray-100 font-bold">
                              <td colSpan={4} className="px-4 py-3 text-right">
                                Total
                              </td>
                              <td colSpan={3} className="px-4 py-3">
                                ₹{total}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
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
