import { useState, ChangeEvent } from "react";

interface Material {
  id: number;
  name: string;
  batch: string;
}

const MaterialsPanel: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [batch, setBatch] = useState<string>("Batch A");
  const [items, setItems] = useState<Material[]>([]);

  function upload() {
    if (!file) return;
    setItems((i) => [{ id: Date.now(), name: file.name, batch }, ...i]);
    setFile(null);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">Study Material Management</h3>
      <div className="mb-4">
        <input type="file" onChange={handleFileChange} className="mb-2" />
        <div className="mb-2">
          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="p-2 border rounded"
          >
            <option>Batch A</option>
            <option>Batch B</option>
          </select>
        </div>
        <button
          onClick={upload}
          className="px-3 py-1 bg-sky-600 text-white rounded"
        >
          Upload & Assign
        </button>
      </div>
      <ul>
        {items.map((it) => (
          <li key={it.id} className="p-3 border-b flex justify-between">
            <div>
              {it.name}
              <div className="text-xs text-gray-500">
                Assigned to: {it.batch}
              </div>
            </div>
            <div>
              <button className="px-2 py-1 border rounded">Download</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MaterialsPanel;
