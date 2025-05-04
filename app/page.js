export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white text-black">
      <div className="w-full max-w-md text-center px-6 py-12 border border-black rounded-lg shadow-md bg-white">
        <h1 className="text-3xl font-bold mb-4 tracking-tight">
          Bienvenido a tu Portafolio de Ingenieros de Campo
        </h1>
        <p className="mb-8 text-gray-700">
          Administra, consulta y comparte la experiencia y proyectos de tu
          equipo de campo de manera eficiente y profesional.
        </p>
        <button className="w-full py-3 px-6 bg-black text-white font-semibold rounded transition hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black">
          Iniciar sesión
        </button>
      </div>
    </main>
  );
}
