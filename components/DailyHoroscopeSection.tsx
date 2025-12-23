"use client";

import { useState, useEffect } from "react";
import Editor from "@/components/Editor";

interface HoroscopeContent {
  sign: string;
  content: string;
  date: string;
}

const zodiacSigns = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

export default function DailyHoroscopeManager() {
  const [selectedSign, setSelectedSign] = useState<string>("Aries");
  const [horoscopes, setHoroscopes] = useState<
    Record<string, HoroscopeContent>
  >({});
  const [currentContent, setCurrentContent] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Load horoscopes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`horoscope_${selectedDate}`);
    if (saved) {
      setHoroscopes(JSON.parse(saved));
    } else {
      setHoroscopes({});
    }
  }, [selectedDate]);

  // Load content when sign changes
  useEffect(() => {
    if (horoscopes[selectedSign]) {
      setCurrentContent(horoscopes[selectedSign].content);
    } else {
      setCurrentContent("");
    }
  }, [selectedSign, horoscopes]);

  const saveContent = async () => {
    const updatedHoroscopes = {
      ...horoscopes,
      [selectedSign]: {
        sign: selectedSign,
        content: currentContent,
        date: selectedDate,
      },
    };

    setHoroscopes(updatedHoroscopes);
    localStorage.setItem(
      `horoscope_${selectedDate}`,
      JSON.stringify(updatedHoroscopes)
    );

    alert(`${selectedSign} horoscope saved for ${selectedDate}!`);
  };

  const saveAllToDatabase = async () => {
    if (Object.keys(horoscopes).length !== zodiacSigns.length) {
      alert("Please complete all zodiac signs before saving.");
      return;
    }

    const payload = {
      date: selectedDate,
      horoscopes: Object.fromEntries(
        Object.entries(horoscopes).map(([sign, data]) => [
          sign.toLowerCase(),
          data.content,
        ])
      ),
    };

    try {
      const token = localStorage.getItem("admin_token"); // or wherever you store it

      const res = await fetch(
        "https://api.rahuldev.live/api/v1/admin/cms/planet_horoscope",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: JSON.stringify(payload),
          }),
        }
      );

      if (!res.ok) throw new Error("Failed");

      localStorage.removeItem(`horoscope_${selectedDate}`);
      alert("✅ Daily horoscope saved to CMS!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save horoscope");
    }
  };

  const getCompletionStatus = () => {
    const completed = Object.keys(horoscopes).length;
    return `${completed} / ${zodiacSigns.length}`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4 text-violet-800">
          Daily Horoscope Manager
        </h1>

        {/* Date Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border rounded-lg"
          />
        </div>

        {/* Progress Indicator */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-sm font-medium">
            Completion Status:{" "}
            <span className="text-blue-600">{getCompletionStatus()}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Zodiac Sign Selector */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-3">Zodiac Signs</h2>
          <div className="space-y-2">
            {zodiacSigns.map((sign) => (
              <button
                key={sign}
                onClick={() => setSelectedSign(sign)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedSign === sign
                    ? "bg-violet-600 text-white"
                    : horoscopes[sign]
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{sign}</span>
                  {horoscopes[sign] && <span className="text-xs">✓</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor Section */}
        <div className="lg:col-span-3">
          <div className="border rounded-lg p-4 bg-white">
            <h2 className="text-2xl font-bold mb-4 text-violet-700">
              {selectedSign} - {selectedDate}
            </h2>

            <Editor
              onChange={(content: string) => setCurrentContent(content)}
              value={currentContent}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={saveContent}
                className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              >
                Save {selectedSign}
              </button>

              <button
                onClick={saveAllToDatabase}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={Object.keys(horoscopes).length === 0}
              >
                Save All to Database
              </button>
            </div>
          </div>

          {/* Preview Section */}
          {currentContent && (
            <div className="mt-6 border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Preview</h3>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: currentContent }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
