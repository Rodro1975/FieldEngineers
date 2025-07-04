"use client";

export default function DashboardHeader({ title = "Dashboard", actions = [] }) {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white sticky top-0 z-20">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        {actions.map(({ label, onClick }, i) => (
          <button
            key={i}
            onClick={onClick}
            className="bg-black text-white px-4 py-2 rounded hover:bg-white hover:text-black border border-black transition"
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}
