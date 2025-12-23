import React, { useRef, useState, useCallback } from "react";

/* ---------- Spinner ---------- */
function Spinner() {
  return (
    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
  );
}

type Props = {
  onFileChange?: (imageUrl: string | null) => void;
  accept?: string;
  initialImageUrl?: string | null;
};

export default function ImageUpload({
  onFileChange,
  accept = "image/*",
  initialImageUrl = null,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialImageUrl);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const reset = useCallback(() => {
    setFile(null);
    setPreview(initialImageUrl);
    setError(null);
    onFileChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [initialImageUrl, onFileChange]);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const uploadToServer = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.rahuldev.live/upload-file", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    return res.json(); // { url }
  };

  const handleFiles = async (files: FileList | null) => {
    setError(null);
    if (!files || files.length === 0) return;

    const file = files[0];

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    try {
      const previewUrl = await readFileAsDataUrl(file);
      setFile(file);
      setPreview(previewUrl);
      setUploading(true);

      try {
        const result = await uploadToServer(file);
        onFileChange?.(result.url);
      } catch {
        setError("Image upload failed");
      } finally {
        setUploading(false);
      }
    } catch {
      setError("Failed to read file");
    }
  };

  return (
    <div className="w-full max-w-md">
      <label className="block text-sm font-medium mb-2">Upload image</label>

      <div
        className={`relative border-2 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition ${
          dragOver
            ? "border-dashed border-indigo-400 bg-indigo-50"
            : "border-gray-200 bg-white"
        } ${uploading ? "pointer-events-none opacity-70" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {preview ? (
          <div className="w-full flex flex-col gap-3">
            <div className="relative h-48 rounded-md overflow-hidden">
              <img
                src={preview}
                alt="preview"
                className={`w-full h-full object-cover ${
                  uploading ? "blur-sm" : ""
                }`}
              />

              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white text-sm">
                    <Spinner />
                    Uploading...
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 truncate">
                {file?.name}
              </span>

              <div className="flex gap-2">
                <button
                  disabled={uploading}
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Remove
                </button>

                <button
                  disabled={uploading}
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Replace
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
            <span>Drag & drop image or click</span>
            <span className="text-xs">Any image size allowed</span>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
