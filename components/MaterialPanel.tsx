import React, { useState } from "react";
import {
  Upload,
  FileText,
  Image,
  File,
  Trash2,
  Edit,
  Plus,
  X,
  Save,
  Search,
  FolderOpen,
} from "lucide-react";

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  fileType: "pdf" | "image" | "document" | "other";
  fileName: string;
  fileUrl: string;
  fileSize: string;
  uploadedAt: string;
  batchId: string;
}

interface Batch {
  id: string;
  name: string;
  code: string;
  studentCount: number;
}

const StudyMaterialAdmin: React.FC = () => {
  const [batches] = useState<Batch[]>([
    {
      id: "1",
      name: "Astrology Beginner - Batch A",
      code: "AST-BEG-A",
      studentCount: 25,
    },
    {
      id: "2",
      name: "Astrology Advanced - Batch B",
      code: "AST-ADV-B",
      studentCount: 18,
    },
    {
      id: "3",
      name: "Tarot Reading - Batch C",
      code: "TRT-001-C",
      studentCount: 30,
    },
    {
      id: "4",
      name: "Numerology Foundation",
      code: "NUM-FND-D",
      studentCount: 22,
    },
  ]);

  const [materials, setMaterials] = useState<StudyMaterial[]>([
    {
      id: "1",
      title: "Introduction to Vedic Astrology",
      description:
        "Complete guide covering basics of Vedic astrology, planetary positions, and house systems",
      fileType: "pdf",
      fileName: "vedic-astrology-intro.pdf",
      fileUrl: "#",
      fileSize: "2.5 MB",
      uploadedAt: "2024-12-01",
      batchId: "1",
    },
    {
      id: "2",
      title: "Planetary Charts Reference",
      description: "Visual reference charts for all planets and their symbols",
      fileType: "image",
      fileName: "planetary-charts.png",
      fileUrl: "#",
      fileSize: "1.2 MB",
      uploadedAt: "2024-12-05",
      batchId: "1",
    },
  ]);

  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    file: null as File | null,
  });

  const filteredMaterials = materials.filter((material) => {
    const matchesBatch = !selectedBatch || material.batchId === selectedBatch;
    const matchesSearch =
      searchQuery === "" ||
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesBatch && matchesSearch;
  });

  const getFileType = (
    fileName: string
  ): "pdf" | "image" | "document" | "other" => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "pdf";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || ""))
      return "image";
    if (["doc", "docx", "txt"].includes(ext || "")) return "document";
    return "other";
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-600" />;
      case "image":
        return <Image className="w-5 h-5 text-blue-600" />;
      case "document":
        return <File className="w-5 h-5 text-blue-600" />;
      default:
        return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm({ ...uploadForm, file: e.target.files[0] });
    }
  };

  const handleUploadSubmit = () => {
    if (!uploadForm.title || !uploadForm.file || !selectedBatch) {
      alert("Please fill all required fields and select a batch");
      return;
    }

    const newMaterial: StudyMaterial = {
      id: `material-${Date.now()}`,
      title: uploadForm.title,
      description: uploadForm.description,
      fileType: getFileType(uploadForm.file.name),
      fileName: uploadForm.file.name,
      fileUrl: URL.createObjectURL(uploadForm.file),
      fileSize: `${(uploadForm.file.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadedAt: new Date().toISOString().split("T")[0],
      batchId: selectedBatch,
    };

    setMaterials([...materials, newMaterial]);
    setUploadForm({ title: "", description: "", file: null });
    setShowUploadModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this study material?")) {
      setMaterials(materials.filter((m) => m.id !== id));
    }
  };

  const handleEditClick = (material: StudyMaterial) => {
    setEditingMaterial(material);
    setShowEditModal(true);
  };

  const handleUpdateMaterial = () => {
    if (!editingMaterial) return;

    setMaterials(
      materials.map((m) => (m.id === editingMaterial.id ? editingMaterial : m))
    );
    setShowEditModal(false);
    setEditingMaterial(null);
  };

  const getBatchName = (batchId: string) => {
    return batches.find((b) => b.id === batchId)?.name || "Unknown Batch";
  };

  const getMaterialCountByBatch = (batchId: string) => {
    return materials.filter((m) => m.batchId === batchId).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Study Material Management
          </h1>
          <p className="text-gray-600">
            Upload, manage, and organize study materials for different batches
          </p>
        </div>

        {/* Batch Selection & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Batch Selector */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Batch
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {batches.map((batch) => (
                <button
                  key={batch.id}
                  onClick={() => setSelectedBatch(batch.id)}
                  className={`p-4 rounded-lg border-2 transition text-left ${
                    selectedBatch === batch.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {batch.name}
                      </h3>
                      <p className="text-sm text-gray-600">{batch.code}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500">
                          {batch.studentCount} students
                        </span>
                        <span className="text-xs text-blue-600">
                          {getMaterialCountByBatch(batch.id)} materials
                        </span>
                      </div>
                    </div>
                    {selectedBatch === batch.id && (
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Total Materials</div>
                <div className="text-2xl font-bold text-gray-900">
                  {materials.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">
                  Selected Batch Materials
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {selectedBatch ? getMaterialCountByBatch(selectedBatch) : 0}
                </div>
              </div>
              <button
                onClick={() => {
                  if (!selectedBatch) {
                    alert("Please select a batch first");
                    return;
                  }
                  setShowUploadModal(true);
                }}
                className="w-full mt-4 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Upload Material
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search materials by title, description, or file name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Materials List */}
        {selectedBatch ? (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Study Materials - {getBatchName(selectedBatch)}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {filteredMaterials.length} material
                {filteredMaterials.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {filteredMaterials.length > 0 ? (
              <div className="divide-y">
                {filteredMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="p-6 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {getFileIcon(material.fileType)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {material.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {material.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <File className="w-4 h-4" />
                            {material.fileName}
                          </span>
                          <span>{material.fileSize}</span>
                          <span>Uploaded: {material.uploadedAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={material.fileUrl}
                          download
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Download"
                        >
                          <Upload className="w-5 h-5 rotate-180" />
                        </a>
                        <button
                          onClick={() => handleEditClick(material)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(material.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  No study materials found for this batch
                </p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Upload your first material
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Please select a batch to view study materials
            </p>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Upload Study Material
                  </h2>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadForm({ title: "", description: "", file: null });
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Batch
                    </label>
                    <p className="px-4 py-2 bg-blue-50 text-blue-900 rounded-lg font-medium">
                      {getBatchName(selectedBatch)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) =>
                        setUploadForm({ ...uploadForm, title: e.target.value })
                      }
                      placeholder="Enter material title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) =>
                        setUploadForm({
                          ...uploadForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter material description or notes"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      File <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, TXT
                    </p>
                  </div>

                  {uploadForm.file && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Selected File:
                      </p>
                      <div className="flex items-center gap-2">
                        {getFileIcon(getFileType(uploadForm.file.name))}
                        <span className="text-sm text-gray-900">
                          {uploadForm.file.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({(uploadForm.file.size / (1024 * 1024)).toFixed(2)}{" "}
                          MB)
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUploadSubmit}
                      className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      Upload Material
                    </button>
                    <button
                      onClick={() => {
                        setShowUploadModal(false);
                        setUploadForm({
                          title: "",
                          description: "",
                          file: null,
                        });
                      }}
                      className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingMaterial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Edit Study Material
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingMaterial(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editingMaterial.title}
                      onChange={(e) =>
                        setEditingMaterial({
                          ...editingMaterial,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editingMaterial.description}
                      onChange={(e) =>
                        setEditingMaterial({
                          ...editingMaterial,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Current File:
                    </p>
                    <div className="flex items-center gap-2">
                      {getFileIcon(editingMaterial.fileType)}
                      <span className="text-sm text-gray-900">
                        {editingMaterial.fileName}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUpdateMaterial}
                      className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingMaterial(null);
                      }}
                      className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyMaterialAdmin;
