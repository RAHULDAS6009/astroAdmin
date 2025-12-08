"use client";
import AdmissionTakenPage from "@/components/AdmissionPage";
import BookingPanel from "@/components/BookingPanel";
import CmsEditor from "@/components/CmsEditor";
import CoursesPanel from "@/components/CoursePanel";
import CreateCourse from "@/components/CreateCourse";
import FeesPanel from "@/components/FeesPanel";
import HomePage from "@/components/HomePage";
import MaterialsPanel from "@/components/MaterialPanel";
import ReviewsPanel from "@/components/ReviewsPanel";
import SaveContent from "@/components/SaveContent";
import SideBar from "@/components/SideBar";
import StudentsTable from "@/components/StudentTable";
import { useState } from "react";

const SECTIONS = [
  "Homepage",
  "Students",
  "Courses",
  "AdmissionPage",
  "CreateCourse",
  "Study Materials",
  "Fees Management",
  "Consultation Bookings",
  "Reviews",
];

export default function AdminDashboard() {
  const [section, setSection] = useState<string>(SECTIONS[0]);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <SideBar sections={SECTIONS} active={section} onSelect={setSection} />

      <main className="flex-1 p-8">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Astrologer / Institute Admin
            </span>
            <button
              onClick={() => {
                localStorage.removeItem("admin_token");
                localStorage.removeItem("admin");
                window.location.href = "/login";
              }}
              className="px-3 py-1 border rounded"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="bg-white rounded shadow p-6">
          {section === "Homepage" && <HomePage />}
          {section === "Students" && <StudentsTable />}
          {section === "Courses" && <CoursesPanel />}
          {section === "CreateCourse" && <CreateCourse />}
          {section === "AdmissionPage" && <AdmissionTakenPage />}
          {section === "Study Materials" && <MaterialsPanel />}
          {section === "Fees Management" && <FeesPanel />}
          {section === "Consultation Bookings" && <BookingPanel />}
          {section === "Reviews" && <ReviewsPanel />}
        </section>
      </main>
    </div>
  );
}
