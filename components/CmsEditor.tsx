import { useState, ChangeEvent } from "react";

interface CmsPayload {
  heroText: string;
  summary: string;
  about: string;
}

const CmsEditor: React.FC = () => {
  const [heroText, setHeroText] = useState<string>("Welcome to Our Institute");
  const [summary, setSummary] = useState<string>("Short intro summary...");
  const [about, setAbout] = useState<string>("About section content...");
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  async function handleSave() {
    setStatus("Saving...");
    const payload: CmsPayload = { heroText, summary, about };
    try {
      await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus("Saved successfully");
    } catch {
      setStatus("Error saving");
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setHeroImage(e.target.files?.[0] ?? null);
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">
        Homepage Content Management
      </h3>
      <label className="block mb-3">
        <span className="text-sm">Hero Text (headline)</span>
        <input
          value={heroText}
          onChange={(e) => setHeroText(e.target.value)}
          className="mt-1 block w-full border rounded p-2"
        />
      </label>
      <label className="block mb-3">
        <span className="text-sm">Summary / Introduction</span>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="mt-1 block w-full border rounded p-2 h-24"
        />
      </label>
      <label className="block mb-3">
        <span className="text-sm">About Section (rich text)</span>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          className="mt-1 block w-full border rounded p-2 h-36"
        />
      </label>
      <label className="block mb-4">
        <span className="text-sm">Hero Banner Image</span>
        <input type="file" onChange={handleFileChange} className="mt-1" />
      </label>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-sky-600 text-white rounded"
        >
          Save
        </button>
        <span className="text-sm text-gray-600">{status}</span>
      </div>
    </div>
  );
};

export default CmsEditor;
