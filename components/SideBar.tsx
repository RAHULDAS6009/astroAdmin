import React from "react";

interface SidebarProps {
  sections: string[];
  active: string;
  onSelect: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sections, active, onSelect }) => {
  return (
    <aside className="w-64 bg-white border-r">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Institute Admin</h2>
        <p className="text-xs text-gray-500">Admin Panel</p>
      </div>
      <nav className="p-4">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className={`w-full text-left py-2 px-3 mb-1 rounded ${
              s === active ? "bg-sky-100 font-medium" : "hover:bg-gray-50"
            }`}
          >
            {s}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
