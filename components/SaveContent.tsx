"use client";

import { useState } from "react";
import Editor from "@/components/Editor";
import ImageUpload from "./ImageUpload";

export default function SaveContent({ title }: { title: string }) {
  const [html, setHtml] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const section = title.trim().toLowerCase().replace(/\s+/g, "_");

  const saveContent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token"); // or wherever you store it

      const res = await fetch(
        `https://api.rahuldev.live/api/v1/admin/cms/${section}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: html,
            imageUrl,
          }),
        }
      );

      if (!res.ok) throw new Error("Save failed");
      alert("Content saved to database!");
    } catch (err) {
      alert("Error saving content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 border">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>

      <div className="flex gap-5">
        <Editor onChange={(content: string) => setHtml(content)} />

        {title !== "My Philosophy Para" && title !== "My Blessing Para" && (
          <ImageUpload onFileChange={setImageUrl} />
        )}
      </div>

      <button
        onClick={saveContent}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save To Database"}
      </button>
    </div>
  );
}
