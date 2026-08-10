import Link from 'next/link';
import { obtenerPacientes } from './actions';

interface PageProps {
  searchParams: Promise<{ busqueda?: string }>;
}

export default async function PacientesPage({ searchParams }: PageProps) {
  const { busqueda } = await searchParams;
  const pacientes = await obtenerPacientes(busqueda);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Gestión de Pacientes</h1>
          <p className="text-slate-400 text-sm mt-1">
            Administra y consulta las historias clínicas de Clinident.
          </p>
        </div>

        <Link
          href="/pacientes/nuevo"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-colors w-fit"
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
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
        />
      </form>

      {/* Tabla de Pacientes */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/50 text-slate-400 font-medium border-b border-slate-700">
              <tr>
                <th className="p-4">Paciente</th>
                <th className="p-4">Cédula</th>
                <th className="p-4">Teléfono</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {pacientes && pacientes.length > 0 ? (
                pacientes.map((paciente) => (
                  <tr key={paciente.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-semibold text-slate-100">
                      {paciente.nombres} {paciente.apellidos}
                    </td>
                    <td className="p-4 text-slate-400">{paciente.cedula || 'N/A'}</td>
                    <td className="p-4 text-slate-400">{paciente.telefono || 'N/A'}</td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/pacientes/${paciente.id}`}
                        className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-medium rounded-lg transition-colors inline-block"
                      >
                        Ver Historia Clínica →
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    No se encontraron pacientes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}