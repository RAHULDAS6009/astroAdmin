"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import axios from "axios";

interface AlumniForm {
  name: string;
  registrationNumber: string;
  photo: File | null;
}

interface Alumni {
  id: number;
  name: string;
  RegistrationNumber: string;
  imageUrl?: string;
}

export default function AdminAlumniPage() {
  const [form, setForm] = useState<AlumniForm>({
    name: "",
    registrationNumber: "",
    photo: null,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [listLoading, setListLoading] = useState(false);

  // ---------------- handlers ----------------

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, photo: file }));
    if (file) setPreview(URL.createObjectURL(file));
  };

  // ---------------- fetch alumni ----------------

  const fetchAlumni = async () => {
    try {
      setListLoading(true);
      const res = await axios.get("http://localhost:5000/api/v1/alumnis");
      setAlumniList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch alumni");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  // ---------------- submit ----------------

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.photo) return alert("Please upload alumni photo");

    try {
      setLoading(true);
      setSuccess(null);

      // STEP 1: upload image
      const uploadData = new FormData();
      uploadData.append("file", form.photo);
      uploadData.append("contentType", "alumni");

      const uploadRes = await fetch("http://localhost:5000/upload-file", {
        method: "POST",
        body: uploadData,
      });

      if (!uploadRes.ok) throw new Error("Image upload failed");

      const uploadResult = await uploadRes.json();
      const imageUrl = uploadResult?.url;
      if (!imageUrl) throw new Error("Image URL not returned");

      // STEP 2: save alumni
      await axios.post(
        "http://localhost:5000/api/v1/admin/alumni",
        {
          name: form.name,
          registrationNumber: form.registrationNumber,
          imageUrl,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
        }
      );

      setSuccess("Alumni added successfully");
      setForm({ name: "", registrationNumber: "", photo: null });
      setPreview(null);
      fetchAlumni();
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add Alumni</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-2xl p-6 space-y-5 max-w-2xl"
      >
        <div>
          <label className="block font-medium mb-1">Alumni Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Registration Number</label>
          <input
            type="text"
            name="registrationNumber"
            value={form.registrationNumber}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Alumni Photo</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {/* Preview */}
        {preview && (
          <img
            src={preview}
            alt="Preview"
            width={160}
            height={160}
            className="rounded-xl object-cover"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-xl"
        >
          {loading ? "Uploading..." : "Add Alumni"}
        </button>

        {success && (
          <p className="text-green-600 font-medium text-center">{success}</p>
        )}
      </form>

      {/* Alumni List */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">All Alumni</h2>

        {listLoading ? (
          <p>Loading alumni...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {alumniList.map((alumni) => (
              <div
                key={alumni.id}
                className="bg-white shadow rounded-2xl p-4 text-center"
              >
                {alumni.imageUrl ? (
                  <img
                    src={alumni.imageUrl}
                    alt={alumni.name}
                    width={160}
                    height={160}
                    className="mx-auto rounded-xl h-32 object-fill"
                  />
                ) : (
                  <div className="w-[160px] h-[160px] mx-auto rounded-xl bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                    No Image
                  </div>
                )}

                <h3 className="mt-3 font-semibold">{alumni.name}</h3>
                <p className="text-gray-600 text-sm">
                  {alumni.RegistrationNumber}
                </p>
              </div>
            ))}

            {alumniList.length === 0 && (
              <p className="text-gray-500 col-span-full text-center">
                No alumni found
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
