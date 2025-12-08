"use client";

import { useState } from "react";
import Editor from "@/components/Editor";
import ImageUpload from "./ImageUpload";

export default function SaveContent({ title }: { title: string }) {
  const [html, setHtml] = useState("");

  const saveContent = async () => {
    localStorage.setItem("content", JSON.stringify({ html }));

    alert("Content saved!");
  };

  return (
    <div className="p-2 border">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <div className="flex gap-5">
        <Editor onChange={(content: string) => setHtml(content)} />
        {title !== "My Philosophy Para" && title !== "My Blessing Para" && (
          <ImageUpload />
        )}
      </div>
      <button
        onClick={saveContent}
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
      >
        Save To Database
      </button>
    </div>
  );
}
