import Link from 'next/link';
import { obtenerPacientes } from './actions';
import { FilaPaciente } from './FilaPaciente';

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
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 font-medium text-white text-sm rounded-xl transition-colors shadow-lg shadow-blue-900/20 text-center"
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
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60 text-sm">
            {pacientes && pacientes.length > 0 ? (
              pacientes.map((paciente: any) => (
                <FilaPaciente key={paciente.id} paciente={paciente} />
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