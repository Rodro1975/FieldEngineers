"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { Toaster, toast } from "react-hot-toast";
import { FaFilePdf, FaUpload, FaTrash, FaPaintBrush } from "react-icons/fa";

/** Util: HEX -> RGB */
const hexToRgb = (hex) => {
  try {
    const clean = hex.replace("#", "");
    const n = parseInt(clean, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  } catch {
    return { r: 0, g: 0, b: 0 };
  }
};

export default function PersonalizedQuote({ onReady }) {
  // Datos de membrete / organización
  const [org, setOrg] = useState({
    name: "Wattly",
    subheading: "Documento personalizado",
    address: "",
    email: "rodrigoivanordonezchavez@gmail.com",
    phone: "",
    website: "",
    accent: "#F8D432",
  });

  // Documento
  const [doc, setDoc] = useState({
    date: new Date().toLocaleDateString("es-MX"),
    subject: "Asunto del documento",
    toName: "",
    toOrg: "",
    body: "",
  });

  // Opciones visuales
  const [opts, setOpts] = useState({
    template: "classic", // classic | bordered | minimal
    watermark: false,
    footer: true,
  });

  // Logo
  const [logoDataUrl, setLogoDataUrl] = useState(null);
  const logoRef = useRef(null);

  const onOrg = (e) =>
    setOrg((s) => ({ ...s, [e.target.name]: e.target.value }));
  const onDoc = (e) =>
    setDoc((s) => ({ ...s, [e.target.name]: e.target.value }));
  const onOpts = (e) =>
    setOpts((s) => ({
      ...s,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const handleLogoUpload = (file) => {
    const fr = new FileReader();
    fr.onload = (ev) => setLogoDataUrl(ev.target.result);
    fr.readAsDataURL(file);
  };

  // ---- Generación de PDF ----
  const generatePDF = useCallback(() => {
    const pdf = new jsPDF({ unit: "mm", format: "letter", compress: true });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const mx = 18;
    const top = 22;

    const { r, g, b } = hexToRgb(org.accent);

    // Header / acento
    if (opts.template !== "minimal") {
      pdf.setDrawColor(r, g, b);
      pdf.setLineWidth(opts.template === "bordered" ? 1.2 : 0.8);
      pdf.line(mx, top, pageW - mx, top);
    }

    // Logo
    if (logoDataUrl) {
      try {
        pdf.addImage(logoDataUrl, "PNG", mx, top + 4, 40, 16);
      } catch {}
    }

    // Datos de organización
    const textX = logoDataUrl ? mx + 46 : mx;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text(org.name || "", textX, top + 8);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    let y = top + 14;
    const orgLines = [
      org.subheading,
      org.address && `Dirección: ${org.address}`,
      org.email && `Email: ${org.email}`,
      org.phone && `Tel: ${org.phone}`,
      org.website && `Web: ${org.website}`,
    ].filter(Boolean);
    orgLines.forEach((ln) => {
      pdf.text(ln, textX, y);
      y += 4.4;
    });

    // Borde externo (opcional)
    if (opts.template === "bordered") {
      pdf.setDrawColor(r, g, b);
      pdf.setLineWidth(0.6);
      pdf.rect(mx - 6, top - 10, pageW - (mx - 6) * 2, pageH - (top - 10) * 2);
    }

    // Asunto y metadatos
    y = Math.max(y, top + 22) + 8;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text(doc.subject || "Asunto", mx, y);
    y += 8;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    if (doc.date) {
      pdf.text(`Fecha: ${doc.date}`, mx, y);
      y += 5;
    }
    if (doc.toName) {
      pdf.text(`Para: ${doc.toName}`, mx, y);
      y += 5;
    }
    if (doc.toOrg) {
      pdf.text(`Organización: ${doc.toOrg}`, mx, y);
      y += 7;
    }

    // Cuerpo libre
    const wrap = pageW - mx * 2;
    const bodyLines = pdf.splitTextToSize(doc.body || "", wrap);
    const lineH = 6;
    bodyLines.forEach((ln) => {
      if (y > pageH - 20) {
        pdf.addPage();
        y = top;
      }
      pdf.text(ln, mx, y);
      y += lineH;
    });

    // Watermark
    if (opts.watermark) {
      pdf.setFontSize(60);
      pdf.setTextColor(r, g, b, 30);
      pdf.text("WATTLY", pageW / 2, pageH / 2, { angle: 35, align: "center" });
      pdf.setTextColor(0);
    }

    // Footer
    if (opts.footer) {
      const fy = pageH - 12;
      pdf.setDrawColor(r, g, b);
      pdf.setLineWidth(0.3);
      pdf.line(mx, fy - 4, pageW - mx, fy - 4);
      pdf.setFontSize(8.8);
      pdf.setTextColor(70);
      const left = [
        org.email && `Email: ${org.email}`,
        org.phone && `Tel: ${org.phone}`,
      ]
        .filter(Boolean)
        .join("   |   ");
      const right = org.website || "";
      if (left) pdf.text(left, mx, fy);
      if (right) pdf.text(right, pageW - mx, fy, { align: "right" });
      pdf.setTextColor(0);
    }

    // Paginación
    const pages = pdf.getNumberOfPages();
    pdf.setFontSize(9);
    pdf.setTextColor(120);
    for (let i = 1; i <= pages; i++) {
      pdf.setPage(i);
      pdf.text(`Página ${i} de ${pages}`, pageW / 2, pageH - 6, {
        align: "center",
      });
    }
    pdf.setTextColor(0);

    return pdf;
  }, [org, doc, opts, logoDataUrl]);

  const handlePreview = useCallback(() => {
    if (!doc.body?.trim()) {
      toast.error("Escribe el cuerpo del documento.");
      return;
    }
    const pdf = generatePDF();
    pdf.output("dataurlnewwindow");
  }, [generatePDF, doc.body]);

  const handleDownload = () => {
    if (!doc.body?.trim()) {
      toast.error("Escribe el cuerpo del documento.");
      return;
    }
    const pdf = generatePDF();
    const safeSubject = (doc.subject || "Documento").replace(/[^\w\-]+/g, "_");
    pdf.save(`${safeSubject}.pdf`);
    toast.success("PDF descargado");
  };

  const handleClear = () => {
    setDoc({
      date: new Date().toLocaleDateString("es-MX"),
      subject: "Asunto del documento",
      toName: "",
      toOrg: "",
      body: "",
    });
    toast("Formulario limpio");
  };

  // Exponer handlePreview al header (como QuoteGenerator)
  useEffect(() => {
    if (onReady) onReady({ handlePreview });
    return () => {
      if (onReady) onReady(null);
    };
  }, [onReady, handlePreview]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto px-2 sm:px-4">
      <Toaster position="top-center" />

      {/* Membrete + Opciones */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 border rounded p-4">
          <h3 className="font-semibold text-lg mb-3">Membrete</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">
                Nombre / Marca
              </label>
              <input
                name="name"
                value={org.name}
                onChange={onOrg}
                className="w-full min-w-0 border px-3 py-2 rounded"
                placeholder="Ej. Wattly"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Subtítulo</label>
              <input
                name="subheading"
                value={org.subheading}
                onChange={onOrg}
                className="w-full min-w-0 border px-3 py-2 rounded"
                placeholder="Lema o descripción corta"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium">Dirección</label>
              <input
                name="address"
                value={org.address}
                onChange={onOrg}
                className="w-full min-w-0 border px-3 py-2 rounded"
                placeholder="Calle, número, ciudad, país"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Correo</label>
              <input
                name="email"
                value={org.email}
                onChange={onOrg}
                className="w-full min-w-0 border px-3 py-2 rounded"
                placeholder="correo@dominio.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Teléfono</label>
              <input
                name="phone"
                value={org.phone}
                onChange={onOrg}
                className="w-full min-w-0 border px-3 py-2 rounded"
                placeholder="+52 ..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Sitio web</label>
              <input
                name="website"
                value={org.website}
                onChange={onOrg}
                className="w-full min-w-0 border px-3 py-2 rounded"
                placeholder="https://tusitio.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Color acento</label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="color"
                  name="accent"
                  value={org.accent}
                  onChange={onOrg}
                  className="h-10 w-14 border rounded"
                  title="Elige un color"
                />
                <input
                  name="accent"
                  value={org.accent}
                  onChange={onOrg}
                  className="flex-1 min-w-0 border px-3 py-2 rounded"
                  placeholder="#F8D432"
                />
                <FaPaintBrush className="text-gray-600" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">
                Logo (PNG/JPG)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleLogoUpload(f);
                  }}
                />
                <button
                  type="button"
                  onClick={() => logoRef.current?.click()}
                  className="bg-gray-800 text-white px-3 py-2 rounded font-semibold hover:bg-black"
                >
                  <FaUpload className="inline mr-2" />
                  Cargar logo
                </button>
                {logoDataUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoDataUrl(null)}
                    className="text-red-600 hover:text-red-800"
                    title="Quitar logo"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Opciones (sin botón de Vista previa aquí) */}
        <div className="border rounded p-4">
          <h3 className="font-semibold text-lg mb-3">Opciones</h3>
          <label className="block text-sm font-medium">Plantilla</label>
          <select
            name="template"
            value={opts.template}
            onChange={onOpts}
            className="w-full min-w-0 border px-3 py-2 rounded mb-3"
          >
            <option value="classic">Clásica</option>
            <option value="bordered">Bordeada</option>
            <option value="minimal">Minimal</option>
          </select>

          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              name="watermark"
              checked={opts.watermark}
              onChange={onOpts}
            />
            Mostrar marca de agua
          </label>

          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              name="footer"
              checked={opts.footer}
              onChange={onOpts}
            />
            Mostrar pie de página
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="bg-red-600 text-white px-3 py-2 rounded font-semibold hover:bg-red-700"
            >
              <FaFilePdf className="inline mr-2" />
              Descargar PDF
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-700 border px-3 py-2 rounded font-semibold hover:bg-gray-50"
            >
              <FaTrash className="inline mr-2" />
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Encabezado del documento */}
      <div className="border rounded p-4">
        <h3 className="font-semibold text-lg mb-3">Encabezado del documento</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium">Fecha</label>
            <input
              name="date"
              value={doc.date}
              onChange={onDoc}
              className="w-full min-w-0 border px-3 py-2 rounded"
              placeholder="dd/mm/aaaa"
            />
          </div>
          <div className="sm:col-span-1 lg:col-span-2">
            <label className="block text-sm font-medium">Asunto</label>
            <input
              name="subject"
              value={doc.subject}
              onChange={onDoc}
              className="w-full min-w-0 border px-3 py-2 rounded"
              placeholder="Título del documento"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Para (Nombre)</label>
            <input
              name="toName"
              value={doc.toName}
              onChange={onDoc}
              className="w-full min-w-0 border px-3 py-2 rounded"
              placeholder="Nombre del destinatario"
            />
          </div>
          <div className="sm:col-span-1 lg:col-span-2">
            <label className="block text-sm font-medium">Organización</label>
            <input
              name="toOrg"
              value={doc.toOrg}
              onChange={onDoc}
              className="w-full min-w-0 border px-3 py-2 rounded"
              placeholder="Empresa / institución"
            />
          </div>
        </div>
      </div>

      {/* Cuerpo del documento */}
      <div className="border rounded p-4">
        <h3 className="font-semibold text-lg mb-3">Cuerpo del documento</h3>
        <textarea
          name="body"
          value={doc.body}
          onChange={onDoc}
          rows={10}
          className="w-full min-w-0 border px-3 py-2 rounded"
          placeholder={`Escribe o pega tu contenido aquí.\n\nEjemplo:\nPor medio de la presente...`}
        />
      </div>
    </div>
  );
}
