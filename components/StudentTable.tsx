import { useEffect, useState } from "react";

interface Student {
  id: string;
  studentId?: string;
  name: string;
  email: string;
  status: "pending" | "approved";
}

const StudentsTable: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      const res = await fetch("/api/admin/students");
      const data: Student[] = await res.json();
      setStudents(data || []);
      setLoading(false);
    }
    fetchStudents();
  }, []);

  async function approve(studentId: string) {
    await fetch(`/api/admin/students/${studentId}/approve`, { method: "POST" });
    setStudents((s) =>
      s.map((x) => (x.id === studentId ? { ...x, status: "approved" } : x))
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">Student Management</h3>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full table-auto text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Status</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.studentId || "—"}</td>
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.email}</td>
                <td className="p-2">{s.status}</td>
                <td className="p-2">
                  {s.status === "pending" && (
                    <button
                      onClick={() => approve(s.id)}
                      className="px-2 py-1 bg-green-600 text-white rounded"
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentsTable;
