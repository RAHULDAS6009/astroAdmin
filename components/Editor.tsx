"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Heading from "@tiptap/extension-heading";
import TextAlign from "@tiptap/extension-text-align";
import { Extension } from "@tiptap/core";

// Font Size Extension
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              element.style.fontSize.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

// Google Fonts List
const GOOGLE_FONTS = [
  "Roboto",
  "Poppins",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Inter",
  "Noto Serif Bengali",
  "Noto Sans",
  "Merriweather",
  "Playfair Display",
  "Arial",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
];

// Font Sizes
const FONT_SIZES = [8, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

export default function Editor({ onChange, initialContent }: any) {
  const [fontSearch, setFontSearch] = useState("");
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [customSize, setCustomSize] = useState("");
  const [recentFonts, setRecentFonts] = useState<string[]>([]);

  const loadFont = (fontName: string) => {
    if (
      !fontName.includes("Arial") &&
      !fontName.includes("Times") &&
      !fontName.includes("Courier") &&
      !fontName.includes("Georgia") &&
      !fontName.includes("Verdana")
    ) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(
        / /g,
        "+"
      )}:wght@300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }
  };

  const rememberFont = (font: string) => {
    setRecentFonts((prev) => {
      const updated = [font, ...prev.filter((f) => f !== font)];
      return updated.slice(0, 5);
    });
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily.configure({ types: ["textStyle"] }),
      FontSize.configure({ types: ["textStyle"] }),
      Heading.configure({ levels: [1, 2, 3] }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: initialContent || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  const handleCustomSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setCustomSize(value);
    if (value && parseInt(value) >= 8 && parseInt(value) <= 100) {
      editor
        .chain()
        .focus()
        .setFontSize(value + "px")
        .run();
    }
  };

  const applyFontSize = (size: number) => {
    editor
      .chain()
      .focus()
      .setFontSize(size + "px")
      .run();
    setCustomSize(size.toString());
    setShowSizeDropdown(false);
  };

  const applyFont = (font: string) => {
    loadFont(font);
    rememberFont(font);
    editor.chain().focus().setFontFamily(font).run();
    setShowFontDropdown(false);
    setFontSearch("");
  };

  const filteredFonts = GOOGLE_FONTS.filter((font) =>
    font.toLowerCase().includes(fontSearch.toLowerCase())
  );

  return (
    <div className="border p-4 rounded-xl bg-white shadow-md max-w-5xl mx-auto">
      {/* Toolbar */}
      <div className="flex gap-2 mb-4 flex-wrap items-center border-b pb-3">
        {/* Font Family Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowFontDropdown(!showFontDropdown);
              setShowSizeDropdown(false);
            }}
            className="px-3 py-1.5 border rounded hover:bg-gray-50 min-w-[140px] text-left flex items-center justify-between"
          >
            <span className="truncate">
              {editor.getAttributes("textStyle").fontFamily || "Font"}
            </span>
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showFontDropdown && (
            <div className="absolute top-full mt-1 bg-white border shadow-lg w-56 z-50 rounded">
              <input
                type="text"
                placeholder="Search fonts..."
                className="w-full border-b px-3 py-2 outline-none"
                value={fontSearch}
                onChange={(e) => setFontSearch(e.target.value)}
                autoFocus
              />

              {recentFonts.length > 0 && (
                <div className="border-b">
                  <div className="px-3 py-1 text-xs text-gray-500 font-semibold">
                    Recent
                  </div>
                  {recentFonts.map((font) => (
                    <div
                      key={font}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-50"
                      style={{ fontFamily: font }}
                      onClick={() => applyFont(font)}
                    >
                      {font}
                    </div>
                  ))}
                </div>
              )}

              <div className="max-h-64 overflow-auto">
                {filteredFonts.map((font) => (
                  <div
                    key={font}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-50"
                    style={{ fontFamily: font }}
                    onClick={() => applyFont(font)}
                  >
                    {font}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Font Size Dropdown */}
        <div className="relative flex gap-1">
          <input
            type="text"
            placeholder="Size"
            value={customSize}
            onChange={handleCustomSizeChange}
            className="border px-2 py-1.5 rounded w-16 text-center"
          />
          <button
            onClick={() => {
              setShowSizeDropdown(!showSizeDropdown);
              setShowFontDropdown(false);
            }}
            className="px-2 py-1.5 border rounded hover:bg-gray-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showSizeDropdown && (
            <div className="absolute top-full mt-1 bg-white border shadow-lg w-20 z-50 rounded max-h-64 overflow-auto">
              {FONT_SIZES.map((size) => (
                <div
                  key={size}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-center"
                  onClick={() => applyFontSize(size)}
                >
                  {size}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Bold */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 border rounded font-bold hover:bg-gray-50 ${
            editor.isActive("bold") ? "bg-blue-100 border-blue-400" : ""
          }`}
        >
          B
        </button>

        {/* Italic */}
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 border rounded italic hover:bg-gray-50 ${
            editor.isActive("italic") ? "bg-blue-100 border-blue-400" : ""
          }`}
        >
          I
        </button>

        {/* Underline */}
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-3 py-1.5 border rounded underline hover:bg-gray-50 ${
            editor.isActive("underline") ? "bg-blue-100 border-blue-400" : ""
          }`}
        >
          U
        </button>

        <div className="w-px h-6 bg-gray-300" />

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
          className={`px-3 py-1.5 border rounded hover:bg-gray-50 ${
            editor.isActive("heading", { level: 1 })
              ? "bg-blue-100 border-blue-400"
              : ""
          }`}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
          className={`px-3 py-1.5 border rounded hover:bg-gray-50 ${
            editor.isActive("heading", { level: 2 })
              ? "bg-blue-100 border-blue-400"
              : ""
          }`}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().setHeading({ level: 3 }).run()}
          className={`px-3 py-1.5 border rounded hover:bg-gray-50 ${
            editor.isActive("heading", { level: 3 })
              ? "bg-blue-100 border-blue-400"
              : ""
          }`}
        >
          H3
        </button>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`px-3 py-1.5 border rounded hover:bg-gray-50 ${
            editor.isActive("paragraph") ? "bg-blue-100 border-blue-400" : ""
          }`}
        >
          P
        </button>

        <div className="w-px h-6 bg-gray-300" />

        {/* Alignment */}
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`px-3 py-1.5 border rounded hover:bg-gray-50 ${
            editor.isActive({ textAlign: "left" })
              ? "bg-blue-100 border-blue-400"
              : ""
          }`}
        >
          ⬅
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`px-3 py-1.5 border rounded hover:bg-gray-50 ${
            editor.isActive({ textAlign: "center" })
              ? "bg-blue-100 border-blue-400"
              : ""
          }`}
        >
          ↔
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`px-3 py-1.5 border rounded hover:bg-gray-50 ${
            editor.isActive({ textAlign: "right" })
              ? "bg-blue-100 border-blue-400"
              : ""
          }`}
        >
          ➡
        </button>
      </div>

      {/* Editor Body */}
      <EditorContent
        editor={editor}
        className="min-h-[400px] border outline-none p-4 rounded-lg prose max-w-none"
      />
    </div>
  );
}
