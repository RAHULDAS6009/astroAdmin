import React, { useRef, useState, useCallback } from "react";

type Props = {
  /** Called when a valid file is selected. Receives the File object. */
  onFileChange?: (file: File | null) => void;
  /** Accept attribute for input (default: images) */
  accept?: string;
  /** Maximum file size in bytes (default: 5 MB) */
  maxSizeBytes?: number;
  /** Optional initial image URL to show as preview */
  initialImageUrl?: string | null;
  /** Whether to show an upload button (if false, component acts as selector only) */
  showUploadButton?: boolean;
};

export default function ImageUpload({
  onFileChange,
  accept = "image/*",
  maxSizeBytes = 5 * 1024 * 1024,
  initialImageUrl = null,
  showUploadButton = false,
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

  const readFileAsDataUrl = (f: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const handleFiles = async (files: FileList | null) => {
    setError(null);
    if (!files || files.length === 0) return;
    const f = files[0];

    // Validate type
    if (!f.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    // Validate size
    if (f.size > maxSizeBytes) {
      setError(
        `File is too large. Maximum allowed size is ${Math.round(
          maxSizeBytes / 1024 / 1024
        )} MB.`
      );
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(f);
      setFile(f);
      setPreview(dataUrl);
      onFileChange?.(f);
    } catch (err) {
      setError("Failed to read the file.");
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave: React.DragEventHandler<HTMLDivElement> = () => {
    setDragOver(false);
  };

  const simulateUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      // Simulate network activity. Replace this with real upload logic.
      await new Promise((r) => setTimeout(r, 1200));
      // On success you might return a server URL — here we keep the preview.
      // Example: onFileChange?.(file) could be used to kick off the upload outside.
    } catch (e) {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <label className="block text-sm font-medium mb-2">Upload image</label>

      <div
        className={`relative border-2 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-offset-2" ${
          dragOver
            ? "border-dashed border-indigo-400 bg-indigo-50"
            : "border-gray-200 bg-white"
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        aria-label="Image upload dropzone"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={onInputChange}
        />

        {preview ? (
          <div className="w-full flex flex-col items-center gap-3">
            <img
              src={preview}
              alt="preview"
              className="w-full h-48 object-cover rounded-md shadow-sm"
            />

            <div className="w-full flex justify-between items-center">
              <div className="text-sm text-gray-600 truncate">
                {file ? file.name : "Selected image"}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                  className="px-3 py-1 text-sm rounded border hover:bg-gray-100"
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  className="px-3 py-1 text-sm rounded border hover:bg-gray-100"
                >
                  Replace
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-upload-icon lucide-upload"
            >
              <path d="M12 3v12" />
              <path d="m17 8-5-5-5 5" />
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            </svg>
            <div className="text-sm text-gray-600 text-center px-4">
              Drag & drop an image here, or click to select one.
            </div>
            <div className="text-xs text-gray-400">
              Max size: {Math.round(maxSizeBytes / 1024 / 1024)} MB
            </div>
          </div>
        )}
      </div>

      {/* Errors */}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
        {showUploadButton && (
          <button
            type="button"
            onClick={simulateUpload}
            disabled={!file || uploading}
            className="px-4 py-2 rounded bg-indigo-600 text-white text-sm disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        )}

        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded border text-sm hover:bg-gray-50"
        >
          Clear
        </button>

        <div className="ml-auto text-xs text-gray-500">
          Tip: click the box to choose an image or drag & drop one.
        </div>
      </div>
    </div>
  );
}

/*
Usage example:

import ImageUpload from "./ImageUpload";

function Page() {
  const handleFile = (file: File | null) => {
    console.log("selected file", file);
    // send to server or save in state
  };

  return <ImageUpload onFileChange={handleFile} showUploadButton />;
}
*/
