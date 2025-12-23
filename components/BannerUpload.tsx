"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import ImageUpload from "./ImageUpload";

const CMS_GET_URL = "https://api.rahuldev.live/api/v1/cms";
const CMS_ADMIN_URL = "https://api.rahuldev.live/api/v1/admin/cms";

type CmsItem = {
  id: number;
  section: string;
  content: string;
  imageUrl: string | null;
};

export default function AdminBannerPage() {
  const [homeBanners, setHomeBanners] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);

  const [academicBanners, setAcademicBanners] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =====================================
     FETCH CMS DATA (YOUR RESPONSE FORMAT)
  ====================================== */
  useEffect(() => {
    const fetchCMS = async () => {
      try {
        const res = await axios.get(CMS_GET_URL);
        const cmsList: CmsItem[] = res.data.data;

        const home = cmsList.find(
          (item) => item.section === "home_banner_section"
        );

        const academic = cmsList.find(
          (item) => item.section === "academic_banner_section"
        );

        if (home?.content) {
          setHomeBanners(JSON.parse(home.content));
        }

        if (academic?.content) {
          setAcademicBanners(JSON.parse(academic.content));
        }
      } catch (error) {
        console.error("CMS fetch failed", error);
        alert("Failed to load banners");
      } finally {
        setLoading(false);
      }
    };

    fetchCMS();
  }, []);

  /* =====================================
     SAVE SECTION (REUSABLE)
  ====================================== */
  const saveSection = async (
    section: "home_banner_section" | "academic_banner_section",
    banners: (string | null)[]
  ) => {
    try {
      setSaving(true);
      const adminToken = localStorage.getItem("admin_token");

      await axios.put(
        `${CMS_ADMIN_URL}/${section}`,
        {
          content: JSON.stringify(banners.filter(Boolean)),
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {
      console.error("Save error", err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* =====================================
     UPDATE SINGLE IMAGE (AUTO SAVE)
  ====================================== */
  const updateHomeBanner = async (index: number, url: string | null) => {
    const updated = [...homeBanners];
    updated[index] = url;
    setHomeBanners(updated);

    await saveSection("home_banner_section", updated);
  };

  const updateAcademicBanner = async (index: number, url: string | null) => {
    const updated = [...academicBanners];
    updated[index] = url;
    setAcademicBanners(updated);

    await saveSection("academic_banner_section", updated);
  };

  /* =====================================
     UI
  ====================================== */
  if (loading) {
    return <p className="p-6">Loading banners...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-8">Admin • Banner Management</h1>

      {/* HOME BANNERS */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">
          Home Page Banners (Max 3)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {homeBanners.map((banner, i) => (
            <ImageUpload
              key={i}
              initialImageUrl={banner}
              onFileChange={(url) => updateHomeBanner(i, url)}
            />
          ))}
        </div>
      </section>

      {/* ACADEMIC BANNERS */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          Academic Page Banners (Max 3)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {academicBanners.map((banner, i) => (
            <ImageUpload
              key={i}
              initialImageUrl={banner}
              onFileChange={(url) => updateAcademicBanner(i, url)}
            />
          ))}
        </div>
      </section>

      {saving && (
        <p className="mt-6 text-sm text-gray-500">Saving changes...</p>
      )}
    </div>
  );
}
