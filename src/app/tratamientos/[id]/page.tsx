import Link from 'next/link';
import { createClient } from '../../../lib/supabase/server';
import { ArrowLeft, Stethoscope, AlertTriangle } from 'lucide-react';
import EvolucionesSeccion from './EvolucionesSeccion';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TratamientoDetallePage({ params }: PageProps) {
  try {
    const { id: pacienteId } = await params;
    const supabase = await createClient();

    // 1. Datos del paciente
    const { data: paciente } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', pacienteId)
      .single();

    // 2. Historia clínica
    const { data: historia } = await supabase
      .from('historias_clinicas')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 3. Evoluciones
    const { data: evoluciones } = await supabase
      .from('evoluciones_tratamiento')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('created_at', { ascending: false });

    if (!paciente) {
      return (
        <div className="p-10 text-center space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Paciente no encontrado</h2>
          <Link href="/tratamientos" className="text-teal-600 underline text-sm">
            Volver a Tratamientos
          </Link>
        </div>
      );
    }

    const nombreCompleto =
      paciente.nombre ||
      `${paciente.nombres || ''} ${paciente.apellidos || ''}`.trim() ||
      'Paciente sin nombre';

    // Parseo seguro de piezas
    let piezasArray: any[] = [];
    if (historia?.piezas_dentales) {
      if (Array.isArray(historia.piezas_dentales)) {
        piezasArray = historia.piezas_dentales;
      } else if (typeof historia.piezas_dentales === 'string') {
        try {
          piezasArray = JSON.parse(historia.piezas_dentales);
        } catch {
          piezasArray = [];
        }
      }
    }

    // Normalizar la estructura de las piezas
    const piezasFormateadas = piezasArray.map((p) => {
      if (typeof p === 'object' && p !== null) {
        return {
          numero_pieza: String(p.numero_pieza || p.numero || p.pieza || p.id || ''),
          estado: p.estado || 'pendiente',
        };
      }
      return { numero_pieza: String(p), estado: 'pendiente' };
    });

    // Parseo seguro de alergias
    let alergiasArray: string[] = [];
    if (historia?.alergias) {
      if (Array.isArray(historia.alergias)) {
        alergiasArray = historia.alergias;
      } else if (typeof historia.alergias === 'string') {
        try {
          alergiasArray = JSON.parse(historia.alergias);
        } catch {
          alergiasArray = [historia.alergias];
        }
      }
    }

    const alergiasLimpias = Array.isArray(alergiasArray)
      ? alergiasArray.filter(
          (a: any) =>
            typeof a === 'string' && a !== 'Ninguna Conocida' && a.trim() !== ''
        )
      : [];

    return (
      <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="space-y-4 border-b border-slate-200/80 pb-6">
          <Link
            href="/tratamientos"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Tratamientos
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span
                  className={`w-3.5 h-3.5 rounded-full ${
                    paciente.semaforo_color === 'rojo'
                      ? 'bg-rose-500 animate-pulse'
                      : paciente.semaforo_color === 'naranja'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <h1 className="text-2xl font-bold text-slate-900">{nombreCompleto}</h1>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                  C.I. {paciente.cedula || 'N/A'}
                </span>
              </div>

              {alergiasLimpias.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg w-fit">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Alergias: {alergiasLimpias.join(' / ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMNA IZQUIERDA: RESUMEN DIAGNÓSTICO */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                Resumen Diagnóstico
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Motivo de Consulta</span>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {historia?.motivo_consulta || 'Sin motivo registrado'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Nivel de Dolor (EVA)</span>
                  <p className="font-bold text-teal-600 mt-0.5">
                    {historia?.nivel_dolor ?? 0} / 10 ({historia?.tipo_dolor || 'Sin dolor'})
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Piezas en Tratamiento</span>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {piezasFormateadas.length} pieza(s) diagnosticada(s)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: REGISTRO E HISTORIAL */}
          <div className="lg:col-span-2">
            <EvolucionesSeccion
              pacienteId={pacienteId}
              historiaId={historia?.id || ''}
              evolucionesIniciales={evoluciones || []}
              piezasIniciales={piezasFormateadas}
              estadoHistoriaInicial={historia?.estado || 'en_tratamiento'}
            />
          </div>
        </div>
      </div>
    );
  } catch (err: any) {
    return (
      <div className="p-10 text-rose-600 text-xs">
        Error al cargar detalle: {err?.message}
      </div>
    );
  }
}