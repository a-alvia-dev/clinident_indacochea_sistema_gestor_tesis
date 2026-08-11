'use client';

import { useState } from 'react';
import { Plus, Check, FileText, Calendar, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';

interface Props {
  pacienteId: string;
  historiaId: string;
  evolucionesIniciales: any[];
  piezasIniciales?: any[];
  estadoHistoriaInicial?: string;
}

export default function EvolucionesSeccion({
  pacienteId,
  historiaId,
  evolucionesIniciales,
  piezasIniciales = [],
  estadoHistoriaInicial = 'en_tratamiento',
}: Props) {
  const [evoluciones, setEvoluciones] = useState<any[]>(evolucionesIniciales);
  const [piezas, setPiezas] = useState<any[]>(piezasIniciales);
  const [estadoHistoria, setEstadoHistoria] = useState<string>(estadoHistoriaInicial);

  const [procedimiento, setProcedimiento] = useState('');
  const [piezaSeleccionada, setPiezaSeleccionada] = useState('');
  const [proximaCita, setProximaCita] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [cargando, setCargando] = useState(false);
  const [cargandoAlta, setCargandoAlta] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  // Piezas pendientes y tratadas
  const piezasPendientes = piezas.filter((p) => p.estado !== 'tratada');
  const piezasTratadas = piezas.filter((p) => p.estado === 'tratada');

  const guardarEvolucion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procedimiento.trim()) return;

    setCargando(true);
    try {
      const supabase = createClient();

      const nuevaEvolucion = {
        paciente_id: pacienteId,
        historia_id: historiaId || null,
        procedimiento: procedimiento.trim(),
        pieza_numero: piezaSeleccionada || null,
        descripcion: descripcion.trim() || null,
        proxima_cita: proximaCita || null,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('evoluciones_tratamiento')
        .insert([nuevaEvolucion])
        .select()
        .single();

      if (error) throw error;

      // Si seleccionó una pieza, actualizamos la columna piezas_dentales en historias_clinicas
      if (piezaSeleccionada) {
        const nuevasPiezas = piezas.map((p) =>
          p.numero_pieza === piezaSeleccionada ? { ...p, estado: 'tratada' } : p
        );

        if (historiaId) {
          const { error: errorPiezas } = await supabase
            .from('historias_clinicas')
            .update({ piezas_dentales: JSON.stringify(nuevasPiezas) })
            .eq('id', historiaId);

          if (errorPiezas) {
            console.error('Error al actualizar piezas dentales:', errorPiezas);
          }
        }

        // Actualizar el estado local
        setPiezas(nuevasPiezas);
      }

      setEvoluciones([data, ...evoluciones]);
      setProcedimiento('');
      setPiezaSeleccionada('');
      setProximaCita('');
      setDescripcion('');
    } catch (err: any) {
      alert('Error al guardar evolución: ' + (err.message || String(err)));
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstadoHistoria = async (nuevoEstado: string) => {
    const mensaje =
      nuevoEstado === 'finalizado'
        ? '¿Deseas dar de alta al paciente y finalizar esta historia clínica?'
        : '¿Deseas reabrir esta historia clínica?';

    if (!confirm(mensaje)) return;

    setCargandoAlta(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('historias_clinicas')
        .update({ estado: nuevoEstado })
        .eq('id', historiaId);

      if (error) throw error;

      setEstadoHistoria(nuevoEstado);
    } catch (err: any) {
      alert('Error al cambiar el estado de la historia: ' + (err.message || String(err)));
    } finally {
      setCargandoAlta(false);
    }
  };

  const eliminarEvolucion = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta atención?')) return;

    setEliminandoId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('evoluciones_tratamiento')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEvoluciones(evoluciones.filter((evo) => evo.id !== id));
    } catch (err: any) {
      alert('Error al eliminar: ' + (err.message || String(err)));
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* BANNER DE ESTADO DE ALTA / FINALIZADO */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          {estadoHistoria === 'finalizado' ? (
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Estado del Tratamiento:{' '}
              <span className={estadoHistoria === 'finalizado' ? 'text-emerald-600' : 'text-teal-600'}>
                {estadoHistoria === 'finalizado' ? 'Tratamiento Finalizado / Alta' : 'En Tratamiento'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {piezasTratadas.length} de {piezas.length} pieza(s) recuperada(s) / tratada(s)
            </p>
          </div>
        </div>

        <div>
          {estadoHistoria === 'finalizado' ? (
            <button
              onClick={() => cambiarEstadoHistoria('en_tratamiento')}
              disabled={cargandoAlta}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Reabrir Tratamiento
            </button>
          ) : (
            <button
              onClick={() => cambiarEstadoHistoria('finalizado')}
              disabled={cargandoAlta}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Dar de Alta / Finalizar
            </button>
          )}
        </div>
      </div>

      {/* CARD FORMULARIO: REGISTRAR NUEVA EVOLUCIÓN */}
      {estadoHistoria !== 'finalizado' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Plus className="w-4 h-4 text-teal-600" />
            Registrar Nueva Evolución / Atención
          </h2>

          <form onSubmit={guardarEvolucion} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Procedimiento / Trabajo Realizado <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Resina, Endodoncia..."
                  value={procedimiento}
                  onChange={(e) => setProcedimiento(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Pieza Tratada (Opcional)
                </label>
                <select
                  value={piezaSeleccionada}
                  onChange={(e) => setPiezaSeleccionada(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
                >
                  <option value="">Ninguna / Consulta General</option>
                  {/* MOSTRAR ÚNICAMENTE LAS PIEZAS PENDIENTES */}
                  {piezasPendientes.map((p) => (
                    <option key={p.numero_pieza} value={p.numero_pieza}>
                      Pieza {p.numero_pieza} (Pendiente)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Próxima Cita Sugerida
                </label>
                <input
                  type="date"
                  value={proximaCita}
                  onChange={(e) => setProximaCita(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Observaciones y Detalles
              </label>
              <textarea
                rows={3}
                placeholder="Detalles del procedimiento, anestesia aplicada, recomendaciones..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 resize-none"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={cargando}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                Guardar Evolución
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CARD HISTORIAL DE ATENCIONES */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          Historial de Atenciones ({evoluciones.length})
        </h2>

        {evoluciones.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
              <Check className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-slate-600">Aún no hay evoluciones registradas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {evoluciones.map((evo) => (
              <div key={evo.id} className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2">
                <div className="flex justify-between items-start text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 block text-sm">
                      {evo.procedimiento}
                      {evo.pieza_numero && (
                        <span className="ml-2 text-xs font-semibold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded-md">
                          Pieza {evo.pieza_numero}
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Atendido el: {new Date(evo.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {evo.proxima_cita && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                        <Calendar className="w-3 h-3" />
                        Próx: {new Date(evo.proxima_cita).toLocaleDateString()}
                      </span>
                    )}
                    <button
                      onClick={() => eliminarEvolucion(evo.id)}
                      disabled={eliminandoId === evo.id}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50 cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {evo.descripcion && (
                  <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-200/50 pt-2">
                    {evo.descripcion}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}