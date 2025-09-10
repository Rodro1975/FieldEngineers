"use client";

import { useState, useCallback } from "react";
import { FaFilePdf, FaTimes, FaEye } from "react-icons/fa";
import { jsPDF } from "jspdf"; // IMPORT CORRECTO EN V2

export default function DocTechnical({ onClose }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const buildPDF = useCallback(async () => {
    // Letter en mm, compresión activada
    const pdf = new jsPDF({ unit: "mm", format: "letter", compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Logo opcional
    let logoDataUrl = null;
    try {
      const blob = await fetch("/LogoYellow.png").then((r) => r.blob());
      logoDataUrl = await new Promise((resolve) => {
        const rd = new FileReader();
        rd.onload = () => resolve(rd.result);
        rd.readAsDataURL(blob);
      });
    } catch {
      // sin logo, seguimos
    }

    // Layout
    const margin = { top: 58, right: 20, bottom: 42, left: 20 };
    const yellow = { r: 248, g: 212, b: 50 };

    // Base de texto y alto de línea real
    pdf.setFont("times", "normal");
    pdf.setFontSize(11);
    const lineHeight = Math.max(5, pdf.getTextDimensions("Mg").h * 1.2); // ~leading

    const usableWidth = pageWidth - margin.left - margin.right;
    const signatureReserve = 34; // reserva para la firma

    const drawHeader = () => {
      if (logoDataUrl) {
        pdf.addImage(logoDataUrl, "PNG", 10, 10, 40, 20);
      }
      pdf.setFont("times", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(title || "Documento Técnico", pageWidth / 2, 40, {
        align: "center",
      });

      pdf.setDrawColor(yellow.r, yellow.g, yellow.b);
      pdf.setLineWidth(1.5);
      pdf.line(margin.left, 45, pageWidth - margin.right, 45);

      pdf.setFont("times", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
    };

    const drawSignature = () => {
      const y = pageHeight - 40;
      pdf.setTextColor(yellow.r, yellow.g, yellow.b);
      pdf.setFontSize(11);
      pdf.text("Rodrigo Iván Ordóñez Chávez", margin.left, y);

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.text("rodrigoivanordonezchavez@gmail.com", margin.left, y + 6);
      pdf.textWithLink("WhatsApp: +57 302 228 3964", margin.left, y + 12, {
        url: "https://wa.me/573022283964",
      });

      pdf.setTextColor(30, 58, 138);
      pdf.setFontSize(9);
      pdf.textWithLink(
        "Soporte Técnico y Soluciones Tecnológicas",
        margin.left,
        y + 20,
        {
          url: "https://soporte-t-cnico-y-solucion-git-e46f24-rodrigo-ordonezs-projects.vercel.app/",
        }
      );

      pdf.setTextColor(0, 0, 0);
      pdf.setFont("times", "normal");
      pdf.setFontSize(11);
    };

    const drawPageNumbers = () => {
      const total = pdf.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(120);
        pdf.text(
          `Página ${i} de ${total}`,
          pageWidth - margin.right,
          pageHeight - 8,
          {
            align: "right",
          }
        );
      }
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
    };

    // Comienza documento
    drawHeader();

    let cursorY = margin.top;

    const ensurePage = (reserve = 0) => {
      // Si no cabe otra línea + reserva, crea nueva página
      if (cursorY + lineHeight + reserve > pageHeight - margin.bottom) {
        pdf.addPage();
        drawHeader();
        cursorY = margin.top;
      }
    };

    const body = content || "Contenido del documento técnico.";
    const paragraphs = body.split(/\r?\n/);

    for (const p of paragraphs) {
      const lines = pdf.splitTextToSize(p || " ", usableWidth);
      for (const line of lines) {
        ensurePage(signatureReserve); // respeta la reserva para la firma final
        pdf.text(line, margin.left, cursorY);
        cursorY += lineHeight;
      }
      // espacio entre párrafos
      ensurePage(signatureReserve);
      cursorY += lineHeight * 0.5;
    }

    // Asegura espacio para firma en la última página
    if (cursorY + signatureReserve > pageHeight - margin.bottom) {
      pdf.addPage();
      drawHeader();
      cursorY = margin.top;
    }
    drawSignature();

    drawPageNumbers();

    // Debug opcional:
    console.log("Páginas generadas:", pdf.getNumberOfPages());

    return pdf;
  }, [title, content]);

  const handleDownload = async () => {
    const pdf = await buildPDF();
    pdf.save("documento_tecnico.pdf");
  };

  const handlePreview = async () => {
    const pdf = await buildPDF();
    // Evita problemas del viewer con bloburl
    pdf.output("dataurlnewwindow");
  };

  return (
    <div className="p-4 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
        <FaFilePdf /> Generar Documento Técnico
      </h2>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium">
            Título del documento
          </label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            placeholder="Ej. Informe de instalación de cargador"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Contenido</label>
          <textarea
            className="w-full border px-3 py-2 rounded min-h-[200px]"
            placeholder="Describa aquí el procedimiento, observaciones, características técnicas, etc."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 flex-wrap">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded flex items-center gap-2"
          >
            <FaTimes /> Cerrar
          </button>

          <button
            onClick={handlePreview}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded flex items-center gap-2"
          >
            <FaEye /> Vista previa PDF
          </button>

          <button
            onClick={handleDownload}
            className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FaFilePdf /> Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
