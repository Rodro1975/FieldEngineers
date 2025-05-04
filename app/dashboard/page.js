export default function Dashboard() {
  return (
    <div className="min-h-screen flex bg-white text-black">
      {/* Sidebar */}
      <aside className="w-56 border-r border-black flex flex-col p-4">
        <h2 className="text-xl font-bold mb-8 tracking-tight">Bienvenido</h2>
        <p className="text-sm mb-8 tracking-tight">
          Aqui el correo de quien se firmo
        </p>
        <nav className="flex flex-col gap-4">
          <button className="text-left font-semibold">Inicio</button>
          <button className="text-left">Ingenieros</button>
          <button className="text-left">Proyectos</button>
          <button className="text-left">Asignaciones</button>
          <button className="text-left">Reportes</button>
          <button className="text-left">Configuración</button>
        </nav>
      </aside>
      {/* Main workspace */}
      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Panel de Ingenieros</h1>
          <div className="flex gap-4">
            <button className="bg-black text-white px-4 py-2 rounded">
              Botón Auxiliar
            </button>
            <button className="bg-black text-white px-4 py-2 rounded">
              Registrar ingeniero
            </button>
            <button className="bg-black text-white px-4 py-2 rounded">
              Asignar a proyecto
            </button>
          </div>
        </div>
        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar ingeniero..."
          className="border border-black rounded px-3 py-2 mb-6 w-full"
        />
        {/* Tabla de ingenieros */}
        <table className="w-full border border-black">
          <thead>
            <tr>
              <th className="border-b border-black p-2 text-left">Id</th>
              <th className="border-b border-black p-2 text-left">Nombre</th>
              <th className="border-b border-black p-2 text-left">Ciudad</th>
              <th className="border-b border-black p-2 text-left">
                Habilidades
              </th>
              <th className="border-b border-black p-2 text-left">
                Nivel de inglés
              </th>
              <th className="border-b border-black p-2 text-left">
                Disponibilidad
              </th>
              <th className="border-b border-black p-2 text-left">Proyecto</th>
              <th className="border-b border-black p-2 text-left">Correo</th>
              <th className="border-b border-black p-2 text-left">Teléfono</th>
              <th className="border-b border-black p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* Aquí renderizas tus ingenieros */}
            <tr>
              <td className="p-2">1</td>
              <td className="p-2">Juan Pérez</td>
              <td className="p-2">México</td>
              <td className="p-2">Smart hands</td>
              <td className="p-2">B 2</td>
              <td className="p-2">En proyecto</td>
              <td className="p-2">Proyecto X</td>
              <td className="p-2">juan@correo.com</td>
              <td className="p-2">5555555</td>
              <td className="p-2">
                <button className="bg-black text-white px-4 py-2 rounded">
                  Editar
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded">
                  Eliminar
                </button>
              </td>
            </tr>
            {/* ... */}
          </tbody>
        </table>
      </main>
    </div>
  );
}
