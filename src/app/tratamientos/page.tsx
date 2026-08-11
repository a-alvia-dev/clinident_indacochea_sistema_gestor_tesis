import Link from 'next/link';
import { Stethoscope, Calendar, AlertTriangle, CheckCircle2, Clock, ChevronRight, Search } from 'lucide-react';

// Simulación/Estructura de datos que consumiremos de la base de datos
export default async function TratamientosPage() {
  // Nota: Aquí luego haremos la consulta real a Supabase/PostgreSQL
  const pacientesTratamiento = [
    {
      id: '1',
      nombre: 'Carlos Mendoza',
      cedula: '0987654321',
      semaforo_color: 'rojo',
      alergias: ['Penicilina'],
      diagnostico_resumen: 'Caries profundas en 16, 26 | Resto radicular en 36',
      total_sesiones: 4,
      sesiones_completadas: 1,
      estado: 'En Proceso', // 'Pendiente', 'En Proceso', 'Completado'
      ultima_atencion: '10/08/2026'
    },
    {
      id: '2',
      nombre: 'María Lucía Torres',
      cedula: '1726354890',
      semaforo_color: 'verde',
      alergias: [],
      diagnostico_resumen: 'Limpieza profunda y profilaxis',
      total_sesiones: 1,
      sesiones_completadas: 1,
      estado: 'Completado',
      ultima_atencion: '05/08/2026'
    }
  ];

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-teal-600" />
            Módulo de Tratamientos y Evolución
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión de planes de trabajo, seguimiento por sesiones y registro de procedimientos clínicos.
          </p>
        </div>

        {/* Buscador Rápido */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>
      </div>

      {/* TARJETAS / LISTA DE PACIENTES */}
      <div className="grid grid-cols-1 gap-4">
        {pacientesTratamiento.map((item) => {
          const porcentaje = Math.round((item.sesiones_completadas / item.total_sesiones) * 100);

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              {/* Informacion Principal del Paciente */}
              <div className="space-y-2 max-w-md">
                <div className="flex items-center gap-2">
                  {/* Badge Semáforo */}
                  <span
                    className={`w-3 h-3 rounded-full ${
                      item.semaforo_color === 'rojo'
                        ? 'bg-rose-500 animate-pulse'
                        : item.semaforo_color === 'naranja'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <h3 className="font-bold text-slate-900 text-base">{item.nombre}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                    C.I. {item.cedula}
                  </span>
                </div>

                {/* Alertas Médicas Directas */}
                {item.alergias.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg w-fit">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Alergias: {item.alergias.join(', ')}</span>
                  </div>
                )}

                <p className="text-xs text-slate-600 line-clamp-1">
                  <span className="font-semibold text-slate-700">Diagnóstico base:</span> {item.diagnostico_resumen}
                </p>
              </div>

              {/* Progreso del Tratamiento */}
              <div className="w-full md:w-64 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Avance de Sesiones</span>
                  <span className="font-bold text-teal-700">{item.sesiones_completadas}/{item.total_sesiones} ({porcentaje}%)</span>
                </div>
                {/* Barra de Progreso */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Última: {item.ultima_atencion}
                  </span>
                  <span className={`font-semibold ${
                    item.estado === 'Completado' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {item.estado}
                  </span>
                </div>
              </div>

              {/* Botón de Acción */}
              <div>
                <Link
                  href={`/tratamientos/${item.id}`}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Ver Plan & Evolución
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}