import React, { useEffect, useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";

interface Location {
  id: string;
  location: string;
}

interface Semester {
  id: string;
  name: string;
  start: string;
  end: string;
  admissionFees: string;
  monthlyFees: string;
  lateFineAfterDate: string;
  lateFineAmount: string;
}

const CourseCreateForm = () => {
  const [photo1, setPhoto1] = useState<File | null>(null);
  const [photo2, setPhoto2] = useState<File | null>(null);
  const [photo1Preview, setPhoto1Preview] = useState<string | null>(null);
  const [photo2Preview, setPhoto2Preview] = useState<string | null>(null);
  const [photo1Uploaded, setPhoto1Uploaded] = useState(false);
  const [photo2Uploaded, setPhoto2Uploaded] = useState(false);
  const [photo1Path, setPhoto1Path] = useState<string | null>(null);
  const [photo2Path, setPhoto2Path] = useState<string | null>(null);
  const [uploadingPhoto1, setUploadingPhoto1] = useState(false);
  const [uploadingPhoto2, setUploadingPhoto2] = useState(false);

  const [branchText, setBranchText] = useState("");
  const [tabHeader1, setTabHeader1] = useState("");
  const [tabHeader2, setTabHeader2] = useState("");

  const [locations, setLocations] = useState<Location[]>([]);
  const [branch, setBranch] = useState("");

  const [courseName, setCourseName] = useState("");
  const [batchCode, setBatchCode] = useState("");
  const [courseDuration, setCourseDuration] = useState("");
  const [module, setModule] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState("");
  const [classDays, setClassDays] = useState({
    sun: false,
    mon: false,
    tue: false,
    wed: false,
    thurs: false,
    fri: false,
    sat: false,
  });
  const [classTimeHrs, setClassTimeHrs] = useState("");
  const [classTimeFrom, setClassTimeFrom] = useState("");
  const [classTimeTo, setClassTimeTo] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([
    {
      id: "1",
      name: "",
      start: "",
      end: "",
      admissionFees: "",
      monthlyFees: "",
      lateFineAfterDate: "",
      lateFineAmount: "",
    },
  ]);

  const [numberOfSemesters, setNumberOfSemesters] = useState(1);
  const [admissionFeesPerSemester, setAdmissionFeesPerSemester] = useState<
    string[]
  >([""]);
  const [monthlyFeesPerSemester, setMonthlyFeesPerSemester] = useState<
    string[]
  >([""]);

  // Handle file upload
  const handleFileUpload = async (file: File, type: "photo1" | "photo2") => {
    if (!file) return;

    const setUploading =
      type === "photo1" ? setUploadingPhoto1 : setUploadingPhoto2;
    const setUploaded =
      type === "photo1" ? setPhoto1Uploaded : setPhoto2Uploaded;
    const setPath = type === "photo1" ? setPhoto1Path : setPhoto2Path;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:5000/upload-file", {
        method: "POST",
        body: formData, // ❗ no headers here
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      // ✅ SAVE URL
      setPath(data.url);
      setUploaded(true);

      alert(
        `✅ ${type === "photo1" ? "Photo 1" : "Photo 2"} uploaded successfully`
      );
    } catch (error) {
      console.error("Upload error:", error);
      alert(`❌ Failed to upload ${type === "photo1" ? "Photo 1" : "Photo 2"}`);
    } finally {
      setUploading(false);
    }
  };

  const uploadPhoto1 = () => {
    if (photo1) handleFileUpload(photo1, "photo1");
  };

  const uploadPhoto2 = () => {
    if (photo2) handleFileUpload(photo2, "photo2");
  };

  const handleNumberOfSemestersChange = (value: number) => {
    setNumberOfSemesters(value);

    const newAdmissionFees = [...admissionFeesPerSemester];
    while (newAdmissionFees.length < value) newAdmissionFees.push("");
    while (newAdmissionFees.length > value) newAdmissionFees.pop();
    setAdmissionFeesPerSemester(newAdmissionFees);

    const newMonthlyFees = [...monthlyFeesPerSemester];
    while (newMonthlyFees.length < value) newMonthlyFees.push("");
    while (newMonthlyFees.length > value) newMonthlyFees.pop();
    setMonthlyFeesPerSemester(newMonthlyFees);
  };

  const updateAdmissionFee = (index: number, value: string) => {
    const fees = [...admissionFeesPerSemester];
    fees[index] = value;
    setAdmissionFeesPerSemester(fees);
  };

  const updateMonthlyFee = (index: number, value: string) => {
    const fees = [...monthlyFeesPerSemester];
    fees[index] = value;
    setMonthlyFeesPerSemester(fees);
  };

  const addSemester = () => {
    const newSemester: Semester = {
      id: Date.now().toString(),
      name: "",
      start: "",
      end: "",
      admissionFees: "",
      monthlyFees: "",
      lateFineAfterDate: "",
      lateFineAmount: "",
    };
    setSemesters([...semesters, newSemester]);
  };

  const removeSemester = (id: string) => {
    if (semesters.length > 1) {
      setSemesters(semesters.filter((sem) => sem.id !== id));
    }
  };

  const updateSemester = (id: string, field: keyof Semester, value: string) => {
    setSemesters(
      semesters.map((sem) => (sem.id === id ? { ...sem, [field]: value } : sem))
    );
  };

  const handleSubmit = async () => {
    console.log("Photo1 URL:", photo1Path);
    console.log("Photo2 URL:", photo2Path);

    if (!photo1Uploaded || !photo2Uploaded) {
      alert("⚠️ Please upload both photos before saving the course!");
      return;
    }

    try {
      const formattedSemesters = semesters.map((sem, index) => ({
        semesterNumber: index + 1,
        name: sem.name,
        start: sem.start,
        end: sem.end,
        admissionFees: sem.admissionFees,
        monthlyFees: sem.monthlyFees,
        lateFineAfterDate: sem.lateFineAfterDate,
        lateFineAmount: sem.lateFineAmount,
      }));

      const courseData = {
        branch,
        courseName,
        batchCode,
        courseDuration,
        module,
        photo1: photo1Path,
        photo2: photo2Path,
        tabName: {
          header1: tabHeader1,
          header2: tabHeader2,
        },
        daysPerWeek,
        classDays,
        classTime: {
          hours: classTimeHrs,
          from: classTimeFrom,
          to: classTimeTo,
        },
        staticSemesterInfo: {
          numberOfSemesters,
          admissionFee: admissionFeesPerSemester[0] || "",
          monthlyFee: monthlyFeesPerSemester[0] || "",
        },
        semesters: formattedSemesters,
        text: branchText,
      };

      const response = await fetch("http://localhost:5000/api/branch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const message =
          errorData.error || errorData.message || "Something went wrong";

        if (response.status === 409) {
          alert(`❌ ${message}`);
        } else if (response.status === 400) {
          alert(`⚠️ ${message}`);
        } else {
          alert("❌ Failed to create batch. Please try again.");
        }
        return;
      }

      alert("✅ Batch created successfully!");
    } catch (error: any) {
      console.error("Create batch error:", error);
      alert("❌ Failed to create batch. Please try again.");
    }
  };

  const handlePhoto1Change = (file: File) => {
    setPhoto1(file);
    setPhoto1Preview(URL.createObjectURL(file));
    setPhoto1Uploaded(false);
    setPhoto1Path(null);
  };

  const handlePhoto2Change = (file: File) => {
    setPhoto2(file);
    setPhoto2Preview(URL.createObjectURL(file));
    setPhoto2Uploaded(false);
    setPhoto2Path(null);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/locations");
      const data = await response.json();
      setLocations(data);
    } catch (err) {
      console.error("Failed to fetch locations", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-center">
            COURSE CREATE for Offline
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
          <div>
            <label className="block text-blue-700 font-semibold text-lg mb-2">
              Select Location:
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg bg-white"
            >
              <option value="">-- Select a Location --</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.location}>
                  {loc.location}
                </option>
              ))}
            </select>
          </div>

          {/* Photo Upload Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* PHOTO 1 */}
            <div className="space-y-3">
              <label className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-purple-300">
                {photo1Preview ? (
                  <div className="text-center">
                    <img
                      src={photo1Preview}
                      alt="Preview"
                      className="h-32 object-cover rounded mb-2"
                    />
                    {photo1Uploaded && (
                      <span className="text-green-600 font-semibold text-sm">
                        ✓ Uploaded
                      </span>
                    )}
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-purple-600 mb-2" />
                    <p className="text-purple-700 font-semibold text-center">
                      Upload Photo (Branch)
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handlePhoto1Change(e.target.files[0]);
                    }
                  }}
                />
              </label>

              {photo1 && !photo1Uploaded && (
                <button
                  onClick={uploadPhoto1}
                  disabled={uploadingPhoto1}
                  className="w-full py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition disabled:bg-purple-400 disabled:cursor-not-allowed"
                >
                  {uploadingPhoto1 ? "Uploading..." : "Upload Photo 1"}
                </button>
              )}
            </div>

            {/* PHOTO 2 */}
            <div className="space-y-3">
              <label className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-purple-300">
                {photo2Preview ? (
                  <div className="text-center">
                    <img
                      src={photo2Preview}
                      alt="Preview"
                      className="h-32 object-cover rounded mb-2"
                    />
                    {photo2Uploaded && (
                      <span className="text-green-600 font-semibold text-sm">
                        ✓ Uploaded
                      </span>
                    )}
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-purple-600 mb-2" />
                    <p className="text-purple-700 font-semibold text-center">
                      Upload Photo (Banner)
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handlePhoto2Change(e.target.files[0]);
                    }
                  }}
                />
              </label>

              {photo2 && !photo2Uploaded && (
                <button
                  onClick={uploadPhoto2}
                  disabled={uploadingPhoto2}
                  className="w-full py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition disabled:bg-purple-400 disabled:cursor-not-allowed"
                >
                  {uploadingPhoto2 ? "Uploading..." : "Upload Photo 2"}
                </button>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-8">
            <textarea
              value={branchText}
              onChange={(e) => setBranchText(e.target.value)}
              className="w-full h-32 px-4 py-3 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
              placeholder="Text As per Branch"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-blue-700 font-semibold mb-2">
                Tab Header 1:
              </label>
              <input
                type="text"
                value={tabHeader1}
                onChange={(e) => setTabHeader1(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Main title"
              />
            </div>

            <div>
              <label className="block text-blue-700 font-semibold mb-2">
                Tab Header 2:
              </label>
              <input
                type="text"
                value={tabHeader2}
                onChange={(e) => setTabHeader2(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Subtitle"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-blue-700 font-semibold mb-2">
                Course Name:
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="e.g. Full Stack Development"
              />
            </div>

            <div>
              <label className="block text-blue-700 font-semibold mb-2">
                Batch Code:
              </label>
              <input
                type="text"
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="e.g. FSD-2025-A"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-blue-700 font-semibold mb-2">
                Course Duration in month:
              </label>
              <input
                type="text"
                value={courseDuration}
                onChange={(e) => setCourseDuration(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-blue-700 font-semibold mb-2">
                Module:
              </label>
              <input
                type="text"
                value={module}
                onChange={(e) => setModule(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-blue-700 font-semibold mb-2">
              Days per week:
            </label>
            <input
              type="text"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-blue-700 font-semibold mb-3">
              Class Day:
            </label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(classDays).map(([day, checked]) => (
                <label
                  key={day}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      setClassDays({ ...classDays, [day]: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-blue-700 font-medium capitalize">
                    {day}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-blue-700 font-semibold mb-2">
                HRS:
              </label>
              <input
                type="text"
                value={classTimeHrs}
                onChange={(e) => setClassTimeHrs(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-blue-700 font-semibold mb-2">
                From:
              </label>
              <input
                type="time"
                value={classTimeFrom}
                onChange={(e) => setClassTimeFrom(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-blue-700 font-semibold mb-2">
                To:
              </label>
              <input
                type="time"
                value={classTimeTo}
                onChange={(e) => setClassTimeTo(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-blue-700 font-semibold mb-2">
                Number of Semesters:
              </label>
              <input
                type="number"
                min={1}
                value={numberOfSemesters}
                onChange={(e) =>
                  handleNumberOfSemestersChange(Number(e.target.value))
                }
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-blue-700 font-semibold mb-2">
                Admission Fee:
              </label>
              <input
                type="text"
                value={admissionFeesPerSemester[0]}
                onChange={(e) => updateAdmissionFee(0, e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-blue-700 font-semibold mb-2">
                Monthly Fee:
              </label>
              <input
                type="text"
                value={monthlyFeesPerSemester[0]}
                onChange={(e) => updateMonthlyFee(0, e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-6">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">
              Fees Structure:
            </h2>
          </div>

          {semesters.map((semester, index) => (
            <div
              key={semester.id}
              className="bg-blue-50 rounded-lg p-6 space-y-4 relative"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-blue-700">
                  Semester {index + 1}
                </h3>
                {semesters.length > 1 && (
                  <button
                    onClick={() => removeSemester(semester.id)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-blue-700 font-semibold mb-2">
                    Semester Name:
                  </label>
                  <input
                    type="text"
                    value={semester.name}
                    onChange={(e) =>
                      updateSemester(semester.id, "name", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-blue-700 font-semibold mb-2">
                    Start:
                  </label>
                  <input
                    type="date"
                    value={semester.start}
                    onChange={(e) =>
                      updateSemester(semester.id, "start", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-blue-700 font-semibold mb-2">
                    End:
                  </label>
                  <input
                    type="date"
                    value={semester.end}
                    onChange={(e) =>
                      updateSemester(semester.id, "end", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-700 font-semibold mb-2">
                    Admission Fees:
                  </label>
                  <input
                    type="text"
                    value={semester.admissionFees}
                    onChange={(e) =>
                      updateSemester(
                        semester.id,
                        "admissionFees",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-blue-700 font-semibold mb-2">
                    Monthly Fees:
                  </label>
                  <input
                    type="text"
                    value={semester.monthlyFees}
                    onChange={(e) =>
                      updateSemester(semester.id, "monthlyFees", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-700 font-semibold mb-2">
                    Late Fine After Date:
                  </label>
                  <input
                    type="date"
                    value={semester.lateFineAfterDate}
                    onChange={(e) =>
                      updateSemester(
                        semester.id,
                        "lateFineAfterDate",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-blue-700 font-semibold mb-2">
                    Late Fine in Rs.:
                  </label>
                  <input
                    type="text"
                    value={semester.lateFineAmount}
                    onChange={(e) =>
                      updateSemester(
                        semester.id,
                        "lateFineAmount",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addSemester}
            className="w-full py-3 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Another Semester
          </button>

          <div className="flex justify-center pt-6">
            <button
              onClick={handleSubmit}
              disabled={!photo1Path || !photo2Path}
              className={`px-12 py-4 font-bold text-xl rounded-lg transition transform
    ${
      !photo1Path || !photo2Path
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-gradient-to-r from-blue-600 to-blue-800 hover:scale-105"
    }
  text-white`}
            >
              SAVE COURSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCreateForm;
