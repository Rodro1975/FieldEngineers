import { useEffect, useState, useCallback } from "react";
import { FaFilePdf, FaEnvelope, FaWhatsapp, FaTrash } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import supabase from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

export default function QuoteGenerator({ onReady }) {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    client_id: "",
    custom_client_name: "",
    country: "",
    currency: "",
    validity: "",
    notes: "",
    description: "",
  });
  const [customValidity, setCustomValidity] = useState("");
  const [folio, setFolio] = useState("CARGANDO...");
  const [items, setItems] = useState([{ description: "", amount: "" }]);

  useEffect(() => {
    async function fetchClients() {
      const { data, error } = await supabase
        .from("clients")
        .select("id, contact_name, company_name");
      if (!error) setClients(data);
    }
    fetchClients();
  }, []);

  useEffect(() => {
    async function generateFolio() {
      const prefix =
        formData.country === "MX"
          ? "QMEX"
          : formData.country === "CO"
          ? "QCOL"
          : "QINT";
      const { count, error } = await supabase
        .from("quotes")
        .select("*", { count: "exact", head: true });
      if (!error && typeof count === "number") {
        const next = count + 1;
        setFolio(`${prefix}${next.toString().padStart(5, "0")}`);
      } else {
        setFolio(`${prefix}XXXXX`);
      }
    }
    generateFolio();
  }, [formData.country]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { description: "", amount: "" }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const updated = [...items];
      updated.splice(index, 1);
      setItems(updated);
    }
  };

  const generatePDF = useCallback(() => {
    const client =
      formData.client_id === "otro"
        ? { contact_name: formData.custom_client_name, company_name: "" }
        : clients.find((c) => c.id === formData.client_id);

    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const totalPages = []; // acumulador para páginas

    const addNewPageIfNeeded = (extraSpace = 20) => {
      const yNow = pdf.lastAutoTable?.finalY || pdf.previousY || 20;
      if (yNow + extraSpace > pageHeight - 20) {
        pdf.addPage();
        pdf.previousY = 20;
      } else {
        pdf.previousY = yNow;
      }
    };

    // Logo y encabezado
    pdf.addImage("/LogoYellow.png", "PNG", 140, 10, 50, 20);
    pdf.setFontSize(18);
    pdf.setTextColor("#000000");
    pdf.text("COTIZACIÓN", 20, 40);
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Folio: ${folio}`, 20, 48);
    pdf.text(`Cliente: ${client?.contact_name || ""}`, 20, 56);
    pdf.text(`Empresa: ${client?.company_name || ""}`, 20, 64);
    pdf.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 72);

    const descripcionTexto =
      formData.description ||
      "Esta cotización detalla el alcance y costo de los servicios requeridos por el cliente para la solución solicitada.";
    pdf.setFontSize(11);
    pdf.setTextColor(60, 60, 60);
    const lines = pdf.splitTextToSize(descripcionTexto, 170);
    pdf.text(lines, 20, 82);
    let y = 82 + lines.length * 6;
    pdf.previousY = y;

    autoTable(pdf, {
      startY: y,
      head: [["Descripción", "Monto"]],
      body: items.map((item) => [
        item.description,
        `${formData.currency} $${item.amount}`,
      ]),
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [248, 212, 50],
        textColor: [0, 0, 0],
      },
      margin: { left: 20, right: 20 },
    });
    y = pdf.lastAutoTable.finalY + 10;

    // Notas
    addNewPageIfNeeded();
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Notas adicionales:", 20, y);
    y += 6;

    const notaLines = pdf.splitTextToSize(formData.notes || "Sin notas", 170);
    pdf.setFontSize(10);
    notaLines.forEach((line) => {
      addNewPageIfNeeded(6);
      pdf.text(line, 20, y);
      y += 6;
    });

    // Total
    const total = items.reduce((acc, i) => acc + Number(i.amount), 0);
    addNewPageIfNeeded(10);
    pdf.setFontSize(11);
    pdf.setTextColor("#000000");
    pdf.text(`Total: ${formData.currency} $${total.toFixed(2)}`, 20, y);
    y += 10;

    // Aclaraciones legales
    pdf.setFontSize(9);
    pdf.setTextColor(80, 80, 80);
    addNewPageIfNeeded(8);
    pdf.text(
      "* Los valores presentados son netos. No incluyen IVA ni impuestos locales o internacionales aplicables.",
      20,
      y
    );
    y += 8;

    if (formData.currency === "USD") {
      addNewPageIfNeeded(8);
      pdf.text(
        "* Esta cotización tiene una vigencia de 15 días y está sujeta a la TRM vigente al día de pago.",
        20,
        y
      );
      y += 8;
    }

    // Firma
    addNewPageIfNeeded(28);
    pdf.setTextColor("#f8d432");
    pdf.setFontSize(11);
    pdf.text("Rodrigo Iván Ordóñez Chávez", 20, y);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text("rodrigoivanordonezchavez@gmail.com", 20, y + 6);
    pdf.textWithLink("WhatsApp: +57 302 228 3964", 20, y + 12, {
      url: "https://wa.me/573022283964",
    });
    pdf.setTextColor(30, 58, 138);
    pdf.setFontSize(9);
    pdf.textWithLink("Soporte Técnico y Soluciones Tecnológicas", 20, y + 20, {
      url: "https://soporte-t-cnico-y-solucion-git-e46f24-rodrigo-ordonezs-projects.vercel.app/",
    });
    pdf.setTextColor(80, 80, 80);

    // Número de página
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(150);
      pdf.text(`Página ${i} de ${pageCount}`, 180, pageHeight - 10);
    }

    return pdf;
  }, [clients, formData, folio, items]);

  const handlePreview = useCallback(() => {
    if (!formData.client_id || items.some((i) => !i.description || !i.amount)) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }
    const pdf = generatePDF();
    window.open(pdf.output("bloburl"), "_blank");
  }, [formData, items, generatePDF]);

  useEffect(() => {
    if (onReady) onReady({ handlePreview });
  }, [onReady, handlePreview]);

  // handleDownload se mantiene igual...

  const handleDownload = async () => {
    try {
      if (
        !formData.client_id ||
        !formData.country ||
        !formData.currency ||
        items.some((i) => !i.description || !i.amount)
      ) {
        toast.error("Completa todos los campos obligatorios");
        return;
      }

      // Generar el PDF y obtenerlo como Blob
      const pdf = generatePDF();
      const pdfBlob = pdf.output("blob"); // Usa "blob" directamente

      // Obtener sesión de usuario
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        toast.error("Error al obtener sesión de usuario");
        return;
      }

      const user_id = sessionData?.session?.user?.id;
      if (!user_id) {
        toast.error("No se pudo obtener el usuario autenticado.");
        return;
      }

      const fileName = `${folio}-${uuidv4()}.pdf`;
      const filePath = `${user_id}/${fileName}`;

      // Subir el archivo PDF a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("quotes-pdfs")
        .upload(filePath, pdfBlob, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        console.error("❌ Error al subir archivo:", uploadError);
        toast.error("Error al subir el archivo PDF.");
        return;
      }

      // Crear URL firmada
      const { data: urlData, error: urlError } = await supabase.storage
        .from("quotes-pdfs")
        .createSignedUrl(filePath, 60 * 60 * 24 * 7);

      if (urlError || !urlData?.signedUrl) {
        console.error("❌ Error al generar signed URL:", urlError);
        toast.error("No se pudo generar la URL del archivo.");
        return;
      }

      const total = items.reduce((acc, i) => acc + Number(i.amount), 0);

      // Insertar la cotización en la base de datos
      const { error: insertError } = await supabase.from("quotes").insert([
        {
          user_id,
          client_id: formData.client_id === "otro" ? null : formData.client_id,
          folio,
          concept: items.map((i) => i.description).join(", "),
          amount: total,
          currency: formData.currency,
          validity:
            formData.validity === "otra" ? customValidity : formData.validity,
          notes:
            formData.notes +
            (formData.client_id === "otro"
              ? ` | Cliente provisional: ${formData.custom_client_name}`
              : ""),
          pdf_url: urlData.signedUrl,
          country: formData.country,
          description: formData.description,
        },
      ]);

      if (insertError) {
        console.error("❌ Error al insertar en la tabla quotes:", insertError);
        toast.error("No se pudo guardar la cotización en la base de datos.");
        return;
      }

      pdf.save(`${folio}.pdf`);
      toast.success("Cotización registrada y descargada.");
    } catch (err) {
      console.error("🚨 Error general en handleDownload:", err);
      toast.error("Error inesperado. Consulta consola.");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      <div className="text-center text-lg font-semibold text-blue-900">
        Folio: {folio}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* País destino */}
        <div>
          <label className="block font-medium">País destino</label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Selecciona un país</option>
            <option value="MX">México</option>
            <option value="CO">Colombia</option>
            <option value="INT">Internacional</option>
          </select>
        </div>

        {/* Cliente */}
        <div>
          <label className="block font-medium">Cliente</label>
          <select
            name="client_id"
            value={formData.client_id}
            onChange={(e) => {
              handleChange(e);
              if (e.target.value !== "otro") {
                setFormData((prev) => ({ ...prev, custom_client_name: "" }));
              }
            }}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Selecciona un cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.contact_name} - {c.company_name}
              </option>
            ))}
            <option value="otro">Otro (cliente no registrado)</option>
          </select>

          {formData.client_id === "otro" && (
            <input
              type="text"
              name="custom_client_name"
              value={formData.custom_client_name}
              onChange={handleChange}
              placeholder="Nombre del cliente provisional"
              className="w-full mt-2 border px-3 py-2 rounded"
            />
          )}
        </div>

        {/* Ítems dinámicos */}
        <div className="sm:col-span-2">
          <label className="block font-medium">Ítems de la cotización</label>
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                className="flex-1 border px-3 py-2 rounded"
                placeholder="Descripción"
                value={item.description}
                onChange={(e) =>
                  handleItemChange(index, "description", e.target.value)
                }
              />
              <input
                className="w-32 border px-3 py-2 rounded"
                placeholder="Monto"
                type="number"
                value={item.amount}
                onChange={(e) =>
                  handleItemChange(index, "amount", e.target.value)
                }
              />
              <button
                className="text-red-600 hover:text-red-800"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            onClick={addItem}
            className="mt-2 text-sm text-blue-600 font-semibold hover:underline"
          >
            + Agregar ítem
          </button>
        </div>

        {/* Moneda */}
        <div>
          <label className="block font-medium">Moneda</label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Selecciona un tipo de moneda</option>{" "}
            {/* 🔹 Opción por defecto */}
            <option value="USD">USD</option>
            <option value="COP">COP</option>
            <option value="MXN">MXN</option>
          </select>
        </div>

        {/* Validez */}
        <div>
          <label className="block font-medium">Validez</label>
          <select
            name="validity"
            value={formData.validity}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Selecciona validez</option>
            <option value="15 días">15 días</option>
            <option value="30 días">30 días</option>
            <option value="otra">Otra</option>
          </select>
          {formData.validity === "otra" && (
            <input
              className="mt-2 w-full border px-3 py-2 rounded"
              placeholder="Escribe la validez"
              value={customValidity}
              onChange={(e) => setCustomValidity(e.target.value)}
            />
          )}
        </div>

        {/* Notas */}
        <div className="sm:col-span-2">
          <label className="block font-medium">Notas adicionales</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            rows={4}
            placeholder="Escribe condiciones especiales o aclaraciones"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-6">
        <button
          onClick={handleDownload}
          className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700"
        >
          <FaFilePdf className="inline mr-2" />
          Descargar PDF
        </button>

        <button
          onClick={() => toast("Función de correo en desarrollo")}
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
        >
          <FaEnvelope className="inline mr-2" />
          Enviar por correo
        </button>

        <a
          href="https://wa.me/573022283964"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#22c55e] text-white px-4 py-2 rounded font-semibold hover:bg-[#16a34a] flex items-center gap-2"
        >
          <FaWhatsapp />
          Enviar por WhatsApp
        </a>
      </div>
    </div>
  );
}
