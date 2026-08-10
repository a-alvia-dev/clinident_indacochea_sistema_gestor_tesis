'use client';

import { useState, useEffect, useTransition, use } from 'react';
import Link from 'next/link';
import { obtenerPacientePorId, aperturarHistoriaAction } from '../actions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DetallePacientePage({ params }: PageProps) {
  const { id } = use(params);

  const [paciente, setPaciente] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [resultadoSemaforo, setResultadoSemaforo] = useState<{
    color: 'rojo' | 'naranja' | 'verde';
    razon: string;
  } | null>(null);

  useEffect(() => {
    async function cargar() {
      const data = await obtenerPacientePorId(id);
      setPaciente(data);
      if (data?.tiene_historia) {
        setResultadoSemaforo({
          color: data.semaforo_color,
          razon: data.semaforo_razon
        });
      }
      setCargando(false);
    }
    cargar();
  }, [id]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('pacienteId', id);

    startTransition(async () => {
      const res = await aperturarHistoriaAction(formData);
      if (res.success && res.color && res.razon) {
        setResultadoSemaforo({
          color: res.color,
          razon: res.razon
        });
        setPaciente((prev: any) => ({ ...prev, tiene_historia: true }));
      }
    });
  };

  if (cargando) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">
        Cargando expediente del paciente...
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-red-400">
        Paciente no encontrado. <br />
        <Link href="/pacientes" className="text-blue-400 underline mt-2 inline-block">
          Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <Link href="/pacientes" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
            ← Volver a Pacientes
          </Link>
          <h1 className="text-2xl font-bold text-slate-100 mt-1">
            {paciente.nombres} {paciente.apellidos}
          </h1>
          <p className="text-slate-400 text-sm">
            Cédula: <span className="text-slate-200 font-medium">{paciente.cedula || 'Sin Cédula'}</span> | 
            Teléfono: <span className="text-slate-200 font-medium">{paciente.telefono || 'Sin Teléfono'}</span>
          </p>
        </div>

        {paciente.tiene_historia && resultadoSemaforo && (
          <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-center border ${
            resultadoSemaforo.color === 'rojo' 
              ? 'bg-red-500/20 text-red-400 border-red-500/30'
              : resultadoSemaforo.color === 'naranja'
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          }`}>
            Semaforización: {resultadoSemaforo.color}
          </div>
        )}
      </div>

      {/* PANEL DE RESULTADO DEL SEMÁFORO AUTOMATIZADO */}
      {resultadoSemaforo && (
        <div className={`p-6 rounded-2xl border shadow-xl transition-all ${
          resultadoSemaforo.color === 'rojo'
            ? 'bg-red-950/40 border-red-500/50 text-red-200'
            : resultadoSemaforo.color === 'naranja'
            ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
            : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">
              {resultadoSemaforo.color === 'rojo' ? '🔴' : resultadoSemaforo.color === 'naranja' ? '🟠' : '🟢'}
            </span>
            <div>
              <h2 className="text-lg font-bold">
                Prioridad de Atención: {resultadoSemaforo.color.toUpperCase()}
              </h2>
              <p className="text-xs opacity-80">Calculado automáticamente por el Sistema de Triaje Clínico</p>
            </div>
          </div>
          <p className="text-sm mt-3 bg-black/20 p-3 rounded-xl border border-white/5">
            <strong>Evaluación del Algoritmo:</strong> {resultadoSemaforo.razon}
          </p>
        </div>
      )}

      {/* FORMULARIO DE APERTURA DE HISTORIA CLÍNICA */}
      {!paciente.tiene_historia ? (
        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 shadow-xl space-y-6">
          <div className="border-b border-slate-700 pb-3">
            <h2 className="text-lg font-semibold text-slate-100">Apertura de Historia Clínica y Triaje Inicial</h2>
            <p className="text-slate-400 text-xs mt-1">
              Seleccione los parámetros observados. El algoritmo calculará la semaforización de forma automática al guardar.
            </p>
          </div>

          {/* 1. ANAMNESIS Y ANTECEDENTES MÉDICOS */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">1. Antecedentes Médicos y Alergias</h3>
            
            {/* Enfermedades Preexistentes */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Enfermedades Preexistentes / Sistémicas</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-slate-300">
                {['Hipertensión Arterial', 'Diabetes Mellitus', 'Cardiopatía', 'Trastornos de Coagulación', 'Asma / Resp.', 'Ninguna'].map((enf) => (
                  <label key={enf} className="flex items-center gap-2 p-2.5 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-700/50">
                    <input type="checkbox" name="enfermedades_sistemicas" value={enf} className="rounded" />
                    <span>{enf}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Combobox de Alergias */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Alergias Conocidas</label>
                <select
                  name="alergias_tipo"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="ninguna">Ninguna alergia reportada</option>
                  <option value="Penicilina / Antibióticos">Penicilina / Antibióticos</option>
                  <option value="Anestésicos Locales">Anestésicos Locales</option>
                  <option value="AINEs (Ibuprofeno/Aspirina)">AINEs (Ibuprofeno/Aspirina)</option>
                  <option value="Látex">Látex</option>
                  <option value="Otra Alergia">Otra Alergia Especifica</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Detalle de Alergia / Medicamentos Activos</label>
                <input
                  type="text"
                  name="alergias_detalle"
                  placeholder="Ej. Reacción alérgica severa, consume anticoagulantes..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-700/80" />

          {/* 2. EXAMEN CLÍNICO Y SÍNTOMAS */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">2. Examen Clínico Inicial y Sintomatología</h3>
            
            {/* Combobox Motivo de Consulta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Motivo Principal de Consulta *</label>
                <select
                  name="motivo_consulta"
                  required
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="Limpieza / Control Preventivo">Limpieza / Control Preventivo</option>
                  <option value="Dolor Dental Agudo">Dolor Dental Agudo</option>
                  <option value="Inflamación o Sangrado de Encías">Inflamación o Sangrado de Encías</option>
                  <option value="Diente Fracturado / Traumatismo">Diente Fracturado / Traumatismo</option>
                  <option value="Sensibilidad Dental">Sensibilidad Dental</option>
                  <option value="Cambio de Restauración / Calza">Cambio de Restauración / Calza</option>
                  <option value="Estética / Ortodoncia">Estética / Ortodoncia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Detalle Adicional del Motivo</label>
                <input
                  type="text"
                  name="motivo_detalle"
                  placeholder="Ej. Paciente refiere dolor al masticar desde hace 2 días"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Radio Buttons Nivel de Dolor */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nivel de Dolor / Sintomatología *</label>
              <div className="grid grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer text-sm text-slate-200">
                  <input type="radio" name="nivel_dolor" value="ninguno" defaultChecked />
                  <span>🟢 Sin Dolor</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer text-sm text-amber-400">
                  <input type="radio" name="nivel_dolor" value="leve" />
                  <span>🟠 Dolor Leve / Molestia</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer text-sm text-red-400 font-medium">
                  <input type="radio" name="nivel_dolor" value="severo" />
                  <span>🔴 Dolor Severo / Agudo</span>
                </label>
              </div>
            </div>
          </div>

          <hr className="border-slate-700/80" />

          {/* 3. HALLAZGOS BUCALES Y DENTALES */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">3. Hallazgos Bucales y Diagnóstico Físico</h3>

            {/* Combobox Estado Encías */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Estado de Tejidos Blandos / Encías</label>
              <select
                name="estado_encias"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="sanas">Encías Sanas</option>
                <option value="gingivitis">Gingivitis (Inflamación / Sangrado Leve)</option>
                <option value="periodontitis">Periodontitis (Sangrado Severo / Movilidad)</option>
              </select>
            </div>

            {/* Checkboxes Hallazgos Bucales */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Hallazgos Dentales Observados</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-slate-300">
                <label className="flex items-center gap-2 p-2.5 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-700/50">
                  <input type="checkbox" name="hallazgos_bucales" value="infeccion_absceso" className="rounded text-red-500" />
                  <span className="text-red-400 font-medium">Infección Activa / Absceso / Pus (🔴 Critico)</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-700/50">
                  <input type="checkbox" name="hallazgos_bucales" value="trauma_fractura" className="rounded text-red-500" />
                  <span className="text-red-400 font-medium">Trauma / Fractura Expuesta (🔴 Critico)</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-700/50">
                  <input type="checkbox" name="hallazgos_bucales" value="movilidad_severa" className="rounded text-red-500" />
                  <span className="text-red-400 font-medium">Movilidad Dental Severa (🔴 Critico)</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-700/50">
                  <input type="checkbox" name="hallazgos_bucales" value="caries_profunda" className="rounded" />
                  <span>Caries Profunda</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-700/50">
                  <input type="checkbox" name="hallazgos_bucales" value="protesis_desajustada" className="rounded" />
                  <span>Prótesis / Restauración Desajustada</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-700/50">
                  <input type="checkbox" name="hallazgos_bucales" value="dientes_sanos" className="rounded" />
                  <span>Dientes Sanos / Sin Caries Visibles</span>
                </label>
              </div>
            </div>
          </div>

          {/* Botón de Enviar */}
          <div className="pt-4 border-t border-slate-700 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-900/30 text-sm disabled:opacity-50"
            >
              {isPending ? 'Evaluando Triaje...' : 'Guardar y Calcular Semáforo'}
            </button>
          </div>
        </form>
      ) : (
        /* VISTA DE RESUMEN DE HISTORIA CLÍNICA */
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
          <h2 className="text-lg font-semibold text-slate-100 border-b border-slate-700 pb-2">
            Resumen de Historia Clínica Aperturada
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">Motivo de Consulta:</p>
              <p className="text-slate-200 font-medium">{paciente.motivo_consulta}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Nivel de Dolor:</p>
              <p className="text-slate-200 font-medium capitalize">{paciente.nivel_dolor}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Alergias:</p>
              <p className="text-slate-200 font-medium">{paciente.alergias_tipo || 'Ninguna'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Estado Encías:</p>
              <p className="text-slate-200 font-medium capitalize">{paciente.estado_encias || 'No evaluado'}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}