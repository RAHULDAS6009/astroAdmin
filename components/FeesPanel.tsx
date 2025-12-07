import { useState } from "react";

interface FeeRecord {
  id: number;
  student: string;
  batch: string;
  month: string;
  status: string;
  amount: number;
}

const FeesPanel: React.FC = () => {
  const [records] = useState<FeeRecord[]>([
    {
      id: 1,
      student: "Rahul",
      batch: "Batch A",
      month: "Nov 2025",
      status: "Paid",
      amount: 2000,
    },
    {
      id: 2,
      student: "Asha",
      batch: "Batch B",
      month: "Nov 2025",
      status: "Pending",
      amount: 2000,
    },
  ]);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">Fees Management</h3>
      <table className="w-full text-sm border">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2">Student</th>
            <th className="p-2">Batch</th>
            <th className="p-2">Month</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Status</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.student}</td>
              <td className="p-2">{r.batch}</td>
              <td className="p-2">{r.month}</td>
              <td className="p-2">₹{r.amount}</td>
              <td className="p-2">{r.status}</td>
              <td className="p-2">
                <button className="px-2 py-1 border rounded">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeesPanel;
