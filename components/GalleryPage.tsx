// pages/admin/upload.tsx or app/admin/upload/page.tsx
"use client"; // If using App Router

import { useState, useRef, ChangeEvent, FormEvent } from "react";

interface GalleryItem {
  type: "image" | "video" | "youtube" | "article";
  title: string;
  description: string;
  file?: File;
  youtubeUrl?: string;
  articleContent?: string;
  articleLink?: string;
}

export default function AdminGalleryPage() {
  const [itemType, setItemType] = useState<GalleryItem["type"]>("image");
  const [formData, setFormData] = useState<GalleryItem>({
    type: "image",
    title: "",
    description: "",
  });
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (itemType === "image" && !file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select a valid image file" });
      return;
    }
    if (itemType === "video" && !file.type.startsWith("video/")) {
      setMessage({ type: "error", text: "Please select a valid video file" });
      return;
    }

    setFormData((prev) => ({ ...prev, file }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (!formData.title.trim()) {
      setMessage({ type: "error", text: "Title is required" });
      return;
    }
    if (!formData.description.trim()) {
      setMessage({ type: "error", text: "Description is required" });
      return;
    }

    if ((itemType === "image" || itemType === "video") && !formData.file) {
      setMessage({ type: "error", text: "Please select a file" });
      return;
    }

    if (itemType === "youtube" && !formData.youtubeUrl) {
      setMessage({ type: "error", text: "YouTube URL is required" });
      return;
    }

    if (itemType === "article" && !formData.articleContent) {
      setMessage({ type: "error", text: "Article content is required" });
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("type", itemType);
      uploadFormData.append("title", formData.title);
      uploadFormData.append("description", formData.description);

      if (formData.file) {
        uploadFormData.append("file", formData.file);
      }

      if (itemType === "youtube" && formData.youtubeUrl) {
        const videoId = extractYouTubeId(formData.youtubeUrl);
        if (!videoId) {
          setMessage({ type: "error", text: "Invalid YouTube URL" });
          setUploading(false);
          return;
        }
        uploadFormData.append("youtubeUrl", formData.youtubeUrl);
        uploadFormData.append("videoId", videoId);
      }

      if (itemType === "article") {
        uploadFormData.append("articleContent", formData.articleContent || "");
        uploadFormData.append("articleLink", formData.articleLink || "");
      }

      const response = await fetch("/upload-file", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setMessage({ type: "success", text: "Item uploaded successfully!" });

      // Reset form
      setFormData({
        type: itemType,
        title: "",
        description: "",
      });
      setPreview("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to upload item",
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle type change
  const handleTypeChange = (type: GalleryItem["type"]) => {
    setItemType(type);
    setFormData({
      type,
      title: "",
      description: "",
    });
    setPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Upload</h1>
          <p className="text-gray-600 mt-2">Add new items to your gallery</p>
        </div>

        {/* Type Selection */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Select Type
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { type: "image" as const, icon: "🖼", label: "Image" },
              { type: "video" as const, icon: "📹", label: "Video" },
              { type: "youtube" as const, icon: "🎥", label: "YouTube" },
              { type: "article" as const, icon: "📰", label: "Article" },
            ].map(({ type, icon, label }) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  itemType === type
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-3xl mb-1">{icon}</div>
                <div className="text-sm font-medium">{label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow rounded-lg p-6"
        >
          {/* Title */}
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter title"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter description"
              required
            />
          </div>

          {/* File Upload for Image/Video */}
          {(itemType === "image" || itemType === "video") && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload {itemType === "image" ? "Image" : "Video"} *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept={itemType === "image" ? "image/*" : "video/*"}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-4xl mb-2">📤</div>
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {itemType === "image"
                      ? "PNG, JPG, WEBP up to 10MB"
                      : "MP4, WEBM up to 100MB"}
                  </p>
                </label>
              </div>

              {/* Preview */}
              {preview && (
                <div className="mt-4">
                  {itemType === "image" ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                  ) : (
                    <video
                      src={preview}
                      controls
                      className="max-h-64 mx-auto rounded-lg"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* YouTube URL */}
          {itemType === "youtube" && (
            <div className="mb-6">
              <label
                htmlFor="youtubeUrl"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                YouTube URL *
              </label>
              <input
                type="url"
                id="youtubeUrl"
                name="youtubeUrl"
                value={formData.youtubeUrl || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste a valid YouTube video URL
              </p>
            </div>
          )}

          {/* Article Fields */}
          {itemType === "article" && (
            <>
              <div className="mb-6">
                <label
                  htmlFor="articleContent"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Article Content *
                </label>
                <textarea
                  id="articleContent"
                  name="articleContent"
                  value={formData.articleContent || ""}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Write your article content here..."
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="articleLink"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  External Link (Optional)
                </label>
                <input
                  type="url"
                  id="articleLink"
                  name="articleLink"
                  value={formData.articleLink || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/full-article"
                />
              </div>
            </>
          )}

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors ${
              uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </span>
            ) : (
              `Upload ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
