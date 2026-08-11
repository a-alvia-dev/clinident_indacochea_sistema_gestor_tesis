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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300/60 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0d1527] tracking-tight">
            Gestión de Pacientes
          </h1>
          <p className="text-slate-600 text-sm font-medium mt-1">
            Administra los datos personales, historias clínicas y el semáforo de triaje.
          </p>
        </div>
        
        {/* BOTÓN "NUEVO PACIENTE" CON AZUL PETRÓLEO CORPORATIVO (#2B5566) */}
        <Link
          href="/pacientes/nuevo"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2B5566] hover:bg-[#1f3e4b] font-bold text-white text-sm rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Paciente
        </Link>
      </div>

      {/* Buscador Blanco Limpio */}
      <form method="GET" className="max-w-md">
        <div className="relative">
          <input
            type="text"
            name="busqueda"
            defaultValue={busqueda || ''}
            placeholder="Buscar por nombre, apellido o cédula..."
            className="w-full px-4 py-2.5 bg-white border border-slate-300/80 rounded-xl text-[#0d1527] placeholder-slate-400 focus:outline-none focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all font-medium"
          />
        </div>
      </form>

      {/* Tabla de Pacientes en Blanco con Cabecera Oscura */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0d1527] text-white text-xs font-bold uppercase tracking-wider">
              <th className="p-4">Paciente</th>
              <th className="p-4">Cédula</th>
              <th className="p-4">Estado / Semáforo</th>
              <th className="p-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-800">
            {pacientes && pacientes.length > 0 ? (
              pacientes.map((paciente: any) => (
                <FilaPaciente key={paciente.id} paciente={paciente} />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-10 text-center text-slate-500 text-sm font-medium italic">
                  No hay pacientes registrados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}