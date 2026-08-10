import Link from 'next/link';
import { obtenerPacientes } from './actions';

interface PageProps {
  searchParams: Promise<{ busqueda?: string }>;
}

export default async function PacientesPage({ searchParams }: PageProps) {
  const { busqueda } = await searchParams;
  const pacientes = await obtenerPacientes(busqueda);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Gestión de Pacientes</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Administra los datos personales, historias clínicas y el semáforo de triaje.
          </p>
        </div>
        <Link
          href="/pacientes/nuevo"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 font-medium text-white text-sm rounded-xl transition-colors shadow-lg shadow-blue-900/20"
        >
          + Nuevo Paciente
        </Link>
      </div>

      {/* Buscador */}
      <form method="GET" className="max-w-md">
        <input
          type="text"
          name="busqueda"
          defaultValue={busqueda || ''}
          placeholder="Buscar por nombre, apellido o cédula..."
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
        />
      </form>

      {/* Tabla de Pacientes */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="p-4">Paciente</th>
              <th className="p-4">Cédula</th>
              <th className="p-4">Estado / Semáforo</th>
              <th className="p-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60 text-sm">
            {pacientes && pacientes.length > 0 ? (
              pacientes.map((paciente: any) => (
                <tr key={paciente.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-4 font-medium text-slate-200">
                    {paciente.nombres} {paciente.apellidos}
                  </td>
                  <td className="p-4 text-slate-400">
                    {paciente.cedula || 'Sin registro'}
                  </td>
                  <td className="p-4">
                    {paciente.tiene_historia ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        paciente.semaforo_color === 'rojo'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : paciente.semaforo_color === 'naranja'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        {paciente.semaforo_color ? paciente.semaforo_color.toUpperCase() : 'VERDE'}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Pendiente de historia</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {paciente.tiene_historia ? (
                      <Link
                        href={`/pacientes/${paciente.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-colors"
                      >
                        Ver Historia Clínica →
                      </Link>
                    ) : (
                      <Link
                        href={`/pacientes/${paciente.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-colors"
                      >
                        + Aperturar Historia
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400 text-sm italic">
                  No se encontraron pacientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}