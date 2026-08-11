import Link from 'next/link';
import { createClient } from '../../lib/supabase/server';
import { Stethoscope, Calendar, AlertTriangle, ChevronRight, FileX, Search } from 'lucide-react';

export const revalidate = 0;

export default async function TratamientosPage() {
  const supabase = await createClient();

  // 1. Obtenemos todas las historias clínicas
  const { data: historias, error: errorHistorias } = await supabase
    .from('historias_clinicas')
    .select('*')
    .order('created_at', { ascending: false });

  // 2. Obtenemos todos los pacientes
  const { data: pacientes, error: errorPacientes } = await supabase
    .from('pacientes')
    .select('*');

  // 🔴 VERIFICACIÓN EN CONSOLA DEL SERVIDOR
  console.log('--- DIAGNÓSTICO TRATAMIENTOS ---');
  console.log('Historias encontradas:', historias?.length || 0, errorHistorias || '');
  console.log('Pacientes encontrados:', pacientes?.length || 0, errorPacientes || '');

  // 3. Unimos los pacientes con sus historias
  const mapaPacientes = new Map((pacientes || []).map((p: any) => [p.id, p]));

  const historiasValidas = (historias || [])
    .map((historia: any) => ({
      ...historia,
      pacientes: mapaPacientes.get(historia.paciente_id) || null,
    }))
    .filter((h: any) => h.pacientes !== null);

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-teal-600" />
            Módulo de Tratamientos y Evolución
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión de planes de trabajo y seguimiento de atenciones de pacientes con historia clínica.
          </p>
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>
      </div>

      {/* LISTADO DE HISTORIAS */}
      {historiasValidas.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <FileX className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No hay pacientes con historias clínicas guardadas</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Apertura una historia clínica y presiona "Finalizar Consulta" o "Guardar" para que aparezca aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {historiasValidas.map((historia: any) => {
            const p = historia.pacientes;
            const nombreCompleto = p.nombre || `${p.nombres || ''} ${p.apellidos || ''}`.trim() || 'Paciente sin Nombre';
            
            // PARSEO RESISTENTE DE ALERGIAS
            let alergiasArray: string[] = [];
            if (historia.alergias) {
              try {
                if (Array.isArray(historia.alergias)) {
                  alergiasArray = historia.alergias;
                } else if (typeof historia.alergias === 'string') {
                  const parsed = JSON.parse(historia.alergias);
                  alergiasArray = Array.isArray(parsed) ? parsed : [historia.alergias];
                }
              } catch {
                alergiasArray = typeof historia.alergias === 'string' ? [historia.alergias] : [];
              }
            }

            const alergiasLimpias = Array.isArray(alergiasArray)
              ? alergiasArray.filter((a: any) => typeof a === 'string' && a !== 'Ninguna Conocida' && a.trim() !== '')
              : [];

            // PARSEO RESISTENTE DE PIEZAS DENTALES
            let piezasArray: any[] = [];
            if (historia.piezas_dentales) {
              try {
                if (Array.isArray(historia.piezas_dentales)) {
                  piezasArray = historia.piezas_dentales;
                } else if (typeof historia.piezas_dentales === 'string') {
                  const parsed = JSON.parse(historia.piezas_dentales);
                  piezasArray = Array.isArray(parsed) ? parsed : [];
                }
              } catch {
                piezasArray = [];
              }
            }

            return (
              <div
                key={historia.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-md">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        p.semaforo_color === 'rojo'
                          ? 'bg-rose-500 animate-pulse'
                          : p.semaforo_color === 'naranja'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <h3 className="font-bold text-slate-900 text-base">{nombreCompleto}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                      C.I. {p.cedula || 'N/A'}
                    </span>
                  </div>

                  {alergiasLimpias.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg w-fit">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Alergias: {alergiasLimpias.join(', ')}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Motivo:</span> {historia.motivo_consulta || 'Consulta General'}
                  </p>
                </div>

                <div className="w-full md:w-64 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600">Piezas Diagnosticadas</span>
                    <span className="font-bold text-teal-700">{piezasArray.length} pieza(s)</span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${piezasArray.length > 0 ? 100 : 20}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Apertura: {new Date(historia.created_at).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-teal-600">EVA {historia.nivel_dolor ?? 0}/10</span>
                  </div>
                </div>

                <div>
                  <Link
                    href={`/tratamientos/${p.id}`}
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
      )}
    </div>
  );
}