"use client";

export default function Modal({ show, onClose, children }) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      style={{ overflowY: "auto" }} // Permite scroll si el modal es muy alto
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-xl relative flex flex-col max-h-[90vh]"
        // max height 90vh para no superar pantalla
      >
        <button
          className="absolute top-2 right-2 text-black text-xl font-bold z-10"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          ×
        </button>
        <div
          className="overflow-y-auto p-6"
          style={{ flex: "1 1 auto" }}
          // Scroll interno si contenido es muy alto
        >
          {children}
        </div>
      </div>
    </div>
  );
}
