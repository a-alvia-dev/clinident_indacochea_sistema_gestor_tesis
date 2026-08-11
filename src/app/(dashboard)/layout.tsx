import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#eef2f6]">
      
      {/* Sidebar Fijo solo para el Panel del Sistema */}
      <aside className="w-64 bg-[#0d1527] border-r border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="p-6 space-y-8">
          {/* Logo e Identidad */}
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Clinident</h1>
            <p className="text-xs text-slate-400 mt-0.5">Gestión Odontológica</p>
          </div>

          {/* Menú de Navegación Principal */}
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium text-sm transition-colors"
            >
              📊 Dashboard
            </Link>
            <Link
              href="/pacientes"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium text-sm transition-colors"
            >
              👥 Pacientes
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium text-sm transition-colors"
            >
              📅 Citas y Agenda
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium text-sm transition-colors"
            >
              🦷 Tratamientos
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium text-sm transition-colors"
            >
              💳 Pagos y Cajas
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium text-sm transition-colors"
            >
              ⚙️ Gestión de Personal
            </Link>
          </nav>
        </div>

        <div className="p-6 border-t border-slate-800/60">
          <p className="text-xs text-slate-500">Clinident Indacochea v1.0</p>
        </div>
      </aside>

      {/* Contenido Principal de las Páginas */}
      <main className="flex-1 overflow-y-auto h-screen p-6 md:p-10">
        {children}
      </main>

    </div>
  );
}