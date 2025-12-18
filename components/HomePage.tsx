import { useState } from "react";
import DailyHoroscopeManager from "./DailyHoroscopeSection";
import SaveContent from "./SaveContent";
import ServicesOfferedSection from "./ServicesOfferedSection";
import ImageUpload from "./ImageUpload";

const HomePage = () => {
  return (
    <div className="flex flex-col gap-5 ">
      {[
        "About me Para 1 ",
        "About me Para 2",
        "My Philosophy Para 1",
        "My Philosophy Para 2",
        "My Blessing Para 1",
        "My Blessing Para 2",
        "Modern Astrology Para About me 1",
        "Modern Astrology Para About me  2",
      ].map((title, key) => {
        return <SaveContent key={key} title={title} />;
      })}
      <DailyHoroscopeManager />
      <LatestUpdatesSection />
      <ServicesOfferedSection />
    </div>
  );
};

// Mock: replace this with API backend calls
// Example: GET /api/latest-updates, POST /api/latest-updates, DELETE /api/latest-updates/:id
type UploadedImage = {
  id: string;
  url: string;
};

function LatestUpdatesSection() {
  const [images, setImages] = useState<UploadedImage[]>([]);

  // ✅ Called after successful upload
  const handleImageUploaded = (imageUrl: string | null) => {
    if (!imageUrl) return;

    setImages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        url: imageUrl,
      },
    ]);
  };

  // Delete image from UI (optional: also delete from backend)
  const deleteImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="w-full border-y flex justify-center p-6">
      <div className="p-6 bg-white shadow rounded-lg w-full max-w-5xl">
        <h2 className="text-xl font-semibold mb-4">Latest Updates (Images)</h2>

        {/* Upload Section */}
        <div className="mb-6">
          <ImageUpload onFileChange={handleImageUploaded} />
        </div>

        {/* Images Grid */}
        <h3 className="text-lg font-medium mb-2">Uploaded Images</h3>

        {images.length === 0 && (
          <p className="text-gray-500 text-sm">No images uploaded yet.</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="border rounded-lg overflow-hidden shadow-sm bg-gray-50 relative group"
            >
              <img
                src={img.url}
                alt="uploaded"
                className="w-full h-32 object-cover cursor-pointer"
                onClick={() => window.open(img.url, "_blank")}
              />

              <button
                onClick={() => deleteImage(img.id)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default HomePage;
