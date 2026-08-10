import Link from 'next/link';
import { obtenerPacientes } from './actions';

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const busqueda = params?.q || '';
  const pacientes = await obtenerPacientes(busqueda);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10 space-y-6">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Gestión de Pacientes</h1>
          <p className="text-slate-400 text-sm">Administra y consulta las historias clínicas de Clinident.</p>
        </div>
        <Link
          href="/pacientes/nuevo"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-900/20"
        >
          + Nuevo Paciente
        </Link>
      </div>

      {/* Buscador */}
      <form method="GET" className="max-w-md">
        <input
          type="text"
          name="q"
          defaultValue={busqueda}
          placeholder="Buscar por nombre, apellido o cédula..."
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </form>

      {/* Tabla de Pacientes */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl">
        {pacientes.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <p className="text-lg font-medium">No se encontraron pacientes registrados.</p>
            <p className="text-sm mt-1">Haz clic en "+ Nuevo Paciente" para añadir el primero.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/50 text-slate-400 font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-4">Paciente</th>
                  <th className="p-4">Cédula</th>
                  <th className="p-4">Teléfono</th>
                  <th className="p-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {pacientes.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium text-slate-100">
                      {p.nombres} {p.apellidos}
                    </td>
                    <td className="p-4 text-slate-400">{p.cedula || 'N/A'}</td>
                    <td className="p-4 text-slate-400">{p.telefono || 'N/A'}</td>
                    <td className="p-4">
                      <Link
                        href={`/pacientes/${p.id}`}
                        className="text-blue-400 hover:text-blue-300 font-medium text-xs bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-colors inline-block"
                      >
                        Ver Historia Clínica →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}