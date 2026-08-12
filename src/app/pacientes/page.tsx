import Link from 'next/link';
import { obtenerPacientes } from './actions';
import { TablaPacientesInteractiva } from './TablaPacientesInteractiva';

export default async function PacientesPage() {
  // Trae los pacientes una sola vez del servidor
  const pacientes = await obtenerPacientes();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300/60 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            {/* Ícono de gestión / usuarios al lado del título */}
            <div className="p-2 bg-[#2B5566]/10 text-[#2B5566] rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-[#0d1527] tracking-tight">
              Gestión de Pacientes
            </h1>
          </div>
          <p className="text-slate-600 text-sm font-medium mt-1">
            Administra los datos personales, historias clínicas y el semáforo de triaje.
          </p>
        </div>
        
        {/* BOTÓN "NUEVO PACIENTE" CON ÍCONO USER-PLUS */}
        <Link
          href="/pacientes/nuevo"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2B5566] hover:bg-[#1f3e4b] font-bold text-white text-sm rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Nuevo Paciente
        </Link>
      </div>

      {/* Buscador + Tabla en tiempo real instantáneo */}
      <TablaPacientesInteractiva pacientesIniciales={pacientes || []} />

    </div>
  );
}