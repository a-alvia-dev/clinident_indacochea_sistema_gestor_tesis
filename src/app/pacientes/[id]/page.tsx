'use client';

import { useState, useEffect, useTransition, use } from 'react';
import Link from 'next/link';
import { 
  obtenerPacientePorId, 
  aperturarHistoriaAction, 
  obtenerHistoriaClinicaPorPaciente, 
  actualizarHistoriaAction, 
  eliminarHistoriaAction 
} from '../actions';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface PiezaRegistrada {
  pieza: number;
  hallazgo: string;
  tratamiento: string;
  nota: string;
}

export default function DetallePacientePage({ params }: PageProps) {
  const { id } = use(params);

  // Carga de Paciente
  const [paciente, setPaciente] = useState<any>(null);
  const [historiaId, setHistoriaId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();

  // 1. ANTECEDENTES SISTÉMICOS (ARRAY)
  const [antecedentes, setAntecedentes] = useState<string[]>([]);
  // 2. ALERGIAS (ARRAY)
  const [alergias, setAlergias] = useState<string[]>([]);
  // 3. HÁBITOS DE RIESGO (ARRAY)
  const [habitos, setHabitos] = useState<string[]>([]);

  // 4. OTROS DATOS MÉDICOS
  const [presionArterial, setPresionArterial] = useState('');
  const [fiebre, setFiebre] = useState('No');
  const [otrosMeds, setOtrosMeds] = useState('');

  // 5. MOTIVO Y SÍNTOMAS
  const [motivoConsulta, setMotivoConsulta] = useState('Consulta Preventiva / Limpieza');
  const [tipoDolor, setTipoDolor] = useState('Ninguno / Asintomático');
  const [nivelDolor, setNivelDolor] = useState<number>(0);

  // 6. ODONTOGRAMA DE PIEZAS
  const [piezaSeleccionada, setPiezaSeleccionada] = useState<number | null>(null);
  const [piezasClinicas, setPiezasClinicas] = useState<PiezaRegistrada[]>([]);
  const [hallazgoTemp, setHallazgoTemp] = useState('Caries Profunda');
  const [tratamientoTemp, setTratamientoTemp] = useState('Restauración / Resina');
  const [notaTemp, setNotaTemp] = useState('');

  // 7. RESULTADO FINAL TRIAJE
  const [consultaFinalizada, setConsultaFinalizada] = useState(false);
  const [resultadoSemaforo, setResultadoSemaforo] = useState<{
    color: 'rojo' | 'naranja' | 'verde';
    razon: string;
  } | null>(null);

  // Cuadrantes FDI (Adultos)
  const cuadrante1 = [18, 17, 16, 15, 14, 13, 12, 11];
  const cuadrante2 = [21, 22, 23, 24, 25, 26, 27, 28];
  const cuadrante4 = [48, 47, 46, 45, 44, 43, 42, 41];
  const cuadrante3 = [31, 32, 33, 34, 35, 36, 37, 38];

  // CARGAR PACIENTE E HISTORIA CLINICA DESDE SUPABASE
// CARGAR PACIENTE E HISTORIA CLINICA DESDE SUPABASE
  useEffect(() => {
    async function cargar() {
      setCargando(true);
      const data = await obtenerPacientePorId(id);
      setPaciente(data);

      if (data) {
        // Cargar historia detallada si existe
        const historia = await obtenerHistoriaClinicaPorPaciente(id);
        if (historia) {
          setHistoriaId(historia.id);
          setMotivoConsulta(historia.motivo_consulta || 'Consulta Preventiva / Limpieza');
          setTipoDolor(historia.tipo_dolor || 'Ninguno / Asintomático');
          setNivelDolor(historia.nivel_dolor || 0);
          setPresionArterial(historia.presion_arterial || '');
          setFiebre(historia.fiebre || 'No');
          setOtrosMeds(historia.otros_meds || '');

          // GARANTIZAR QUE SIEMPRE SEAN ARREGLOS
          const parseArray = (val: any) => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') {
              try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed : [];
              } catch {
                return [];
              }
            }
            return [];
          };

          setAntecedentes(parseArray(historia.antecedentes));
          setAlergias(parseArray(historia.alergias));
          setHabitos(parseArray(historia.habitos));
          setPiezasClinicas(parseArray(historia.piezas_dentales));

          setResultadoSemaforo({
            color: historia.semaforo_color || 'verde',
            razon: historia.semaforo_razon || 'Historia previa registrada.'
          });
          setConsultaFinalizada(true);
        }
      }
      setCargando(false);
    }
    cargar();
  }, [id]);

  // Manejadores de Estado (Checkbox Garantizado)
// Manejadores de Estado Garantizados como Array
  const handleToggleAntecedente = (item: string) => {
    setAntecedentes(prev => {
      const list = Array.isArray(prev) ? prev : [];
      return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    });
  };

  const handleToggleAlergia = (item: string) => {
    setAlergias(prev => {
      const list = Array.isArray(prev) ? prev : [];
      return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    });
  };

  const handleToggleHabito = (item: string) => {
    setHabitos(prev => {
      const list = Array.isArray(prev) ? prev : [];
      return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    });
  };

  // Guardar Pieza Dental
  const agregarPiezaDental = () => {
    if (!piezaSeleccionada) return;
    const nuevaPieza: PiezaRegistrada = {
      pieza: piezaSeleccionada,
      hallazgo: hallazgoTemp,
      tratamiento: tratamientoTemp,
      nota: notaTemp
    };
    setPiezasClinicas(prev => [...prev.filter(p => p.pieza !== piezaSeleccionada), nuevaPieza]);
    setPiezaSeleccionada(null);
    setNotaTemp('');
  };

  const eliminarPieza = (numPieza: number) => {
    setPiezasClinicas(prev => prev.filter(p => p.pieza !== numPieza));
  };

  // FINALIZAR Y GUARDAR EN SUPABASE (CREAR / EDITAR)
  const handleFinalizarConsulta = (e: React.FormEvent) => {
    e.preventDefault();
// --- 1. PROCESAMIENTO DINÁMICO DE DATOS INGRESADOS ---

    // A. Procesar Antecedentes Sistémicos seleccionados
    const antecedentesActivos = antecedentes.filter(a => a !== 'Ninguno' && a.trim() !== '');
    const tieneAntecedentes = antecedentesActivos.length > 0;

    // B. Identificar hallazgos clínicos específicos en el Odontograma
    const tieneInfeccion = piezasClinicas.some(p => p.hallazgo?.includes('Infección') || p.hallazgo?.includes('Absceso'));
    const tieneResto = piezasClinicas.some(p => p.hallazgo?.includes('Resto Radicular'));
    const tieneFractura = piezasClinicas.some(p => p.hallazgo?.includes('Fractura'));
    const tieneCaries = piezasClinicas.some(p => p.hallazgo?.includes('Caries'));

    // C. Lista dinámica de piezas afectadas para el reporte
    const resumenPiezas = piezasClinicas.map(p => `#${p.pieza} (${p.hallazgo})`).join(', ');

    // --- 2. DETERMINACIÓN DEL SEMÁFORO Y DETALLE CLÍNICO ---
    let colorCalculado: 'rojo' | 'naranja' | 'verde' = 'verde';
    let razones: string[] = [];

    // REGLA A: EVALUACIÓN DE ROJO (Urgencias / Riesgo Alto)
    if (nivelDolor >= 8) {
      colorCalculado = 'rojo';
      razones.push(`Nivel de dolor severo (EVA ${nivelDolor}/10)`);
    }

    if (tieneInfeccion) {
      colorCalculado = 'rojo';
      razones.push('Proceso infeccioso activo / absceso detectado');
    }

    if (tieneResto) {
      colorCalculado = 'rojo';
      razones.push('Presencia de resto radicular');
    }

    if (fiebre === 'Sí') {
      colorCalculado = 'rojo';
      razones.push('Cuadro febril activo (alerta de infección sistémica)');
    }

    // REGLA B: EVALUACIÓN DE NARANJA (Prioritario / Moderado)
    if (colorCalculado !== 'rojo') {
      if (nivelDolor >= 4) {
        colorCalculado = 'naranja';
        razones.push(`Dolor moderado (EVA ${nivelDolor}/10)`);
      }

      if (tieneCaries || tieneFractura) {
        colorCalculado = 'naranja';
        razones.push('Lesiones dentales activas (Caries/Fractura)');
      }

      if (tieneAntecedentes) {
        colorCalculado = 'naranja';
      }
    }

    // REGLA C: INCLUSIÓN DINÁMICA DE ANTECEDENTES Y DETALLES EN LA DESCRIPCIÓN
    if (tieneAntecedentes) {
      razones.push(`Antecedentes médicos a considerar: ${antecedentesActivos.join(', ')}`);
    }

    if (resumenPiezas) {
      razones.push(`Hallazgos en piezas: ${resumenPiezas}`);
    }

    // REGLA D: EVALUACIÓN DE VERDE (Atención de Rutina)
    if (colorCalculado === 'verde') {
      razones.push('Paciente estable sin criterios de urgencia ni comorbilidades activas');
    }

    // Construcción final de la descripción detallada
    const razonFinal = razones.join('. ') + '.';

    // Empaquetar formulario para Server Action
    const formData = new FormData();
    formData.append('pacienteId', id);
    formData.append('motivo', motivoConsulta);
    formData.append('tipoDolor', tipoDolor);
    formData.append('nivel_dolor', nivelDolor.toString());
    formData.append('presionArterial', presionArterial);
    formData.append('fiebre', fiebre);
    formData.append('otrosMeds', otrosMeds);
    formData.append('semaforo_color', colorCalculado);
    formData.append('semaforo_razon', razonFinal);
    formData.append('antecedentes', JSON.stringify(antecedentes));
    formData.append('alergias', JSON.stringify(alergias));
    formData.append('habitos', JSON.stringify(habitos));
    formData.append('piezas', JSON.stringify(piezasClinicas));

    startTransition(async () => {
      let res;
      if (historiaId) {
        res = await actualizarHistoriaAction(historiaId, formData);
      } else {
        res = await aperturarHistoriaAction(formData);
        if (res?.data?.id) setHistoriaId(res.data.id);
      }

      if (res?.error) {
        alert(`Error al guardar en Supabase: ${res.error}`);
        return;
      }

      setResultadoSemaforo({ color: colorCalculado, razon: razonFinal });
      setConsultaFinalizada(true);
      setPaciente((prev: any) => ({ ...prev, tiene_historia: true, semaforo_color: colorCalculado }));
    });
  };

  // ELIMINAR HISTORIA CLINICA
  const handleEliminarHistoria = () => {
    if (!historiaId) return;

    if (!confirm('¿Estás seguro de eliminar esta historia clínica? Esta acción no se puede deshacer.')) return;

    startTransition(async () => {
      const res = await eliminarHistoriaAction(historiaId, id);
      if (res?.error) {
        alert(`Error al eliminar: ${res.error}`);
        return;
      }

      setHistoriaId(null);
      setConsultaFinalizada(false);
      setResultadoSemaforo(null);
      setPaciente((prev: any) => ({ ...prev, tiene_historia: false, semaforo_color: 'verde' }));
      alert('Historia clínica eliminada.');
    });
  };

  if (cargando) {
    return <div className="max-w-4xl mx-auto p-12 text-center text-slate-500 font-medium">Cargando expediente...</div>;
  }

  if (!paciente) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-red-500 font-medium">
        Paciente no encontrado. <br />
        <Link href="/pacientes" className="text-[#0284c7] underline mt-2 inline-block">
          Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* ENCABEZADO */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex justify-between items-center">
        <div>
          <Link href="/pacientes" className="text-xs font-bold text-slate-500 hover:text-[#2B5566] transition-colors mb-1 inline-block">
            ← Volver a Pacientes
          </Link>
          <h1 className="text-2xl font-extrabold text-[#0d1527]">{paciente.nombres} {paciente.apellidos}</h1>
          <p className="text-slate-600 text-xs font-medium mt-1">
            Cédula: <span className="text-slate-900 font-bold">{paciente.cedula || 'N/A'}</span> &nbsp;|&nbsp; 
            Teléfono: <span className="text-slate-900 font-bold">{paciente.telefono || 'N/A'}</span>
          </p>
        </div>

        {consultaFinalizada && resultadoSemaforo && (
          <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-center border shadow-xs ${
            resultadoSemaforo.color === 'rojo' 
              ? 'bg-red-100 text-red-800 border-red-300'
              : resultadoSemaforo.color === 'naranja'
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
          }`}>
            Prioridad: {resultadoSemaforo.color}
          </div>
        )}
      </div>

      {/* RESULTADO FINAL TRIAJE */}
      {consultaFinalizada && resultadoSemaforo && (
        <div className={`p-6 rounded-2xl border shadow-md transition-all ${
          resultadoSemaforo.color === 'rojo'
            ? 'bg-red-50 border-red-300 text-red-950'
            : resultadoSemaforo.color === 'naranja'
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-emerald-50 border-emerald-300 text-emerald-950'
        }`}>
          <div className="flex items-start gap-4">
            <span className="text-4xl">
              {resultadoSemaforo.color === 'rojo' ? '🔴' : resultadoSemaforo.color === 'naranja' ? '🟠' : '🟢'}
            </span>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold uppercase tracking-wide">
                Prioridad de Atención: {resultadoSemaforo.color}
              </h2>
              <p className="text-xs font-semibold leading-relaxed opacity-90">
                {resultadoSemaforo.razon}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SI YA ESTÁ FINALIZADO MOSTRAR RESUMEN + BOTONES DE ACCIÓN (EDITAR / ELIMINAR) */}
      {consultaFinalizada ? (
       <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-6 space-y-6">
        {/* CABECERA CON BOTONES */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Resumen Clínico Guardado
            </h2>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              Ficha registrada correctamente en el sistema
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConsultaFinalizada(false)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              ✏️ Modificar / Editar Historia
            </button>
            <button
              type="button"
              onClick={handleEliminarHistoria}
              disabled={isPending}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              🗑️ Eliminar Historia
            </button>
          </div>
        </div>

        {/* GRILLA DE DATOS PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Motivo de Consulta */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Motivo Principal</span>
            <p className="text-sm font-bold text-slate-800">{motivoConsulta || 'Consulta general'}</p>
          </div>

          {/* 2. Evaluación del Dolor */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Dolor (Escala EVA)</span>
            <p className="text-sm font-bold text-slate-800">
              EVA {nivelDolor}/10 <span className="text-xs font-normal text-slate-500">({tipoDolor})</span>
            </p>
          </div>

          {/* 3. Fiebre / Signos Vitales */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Presencia de Fiebre</span>
            <p className={`text-sm font-bold ${fiebre === 'Sí' ? 'text-rose-600' : 'text-emerald-600'}`}>
              {fiebre === 'Sí' ? '⚠️ Sí registrado' : '✓ No presenta'}
            </p>
          </div>

          {/* 4. Total de Piezas en Odontograma */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Piezas Registradas</span>
            <p className="text-sm font-bold text-sky-600">
              {piezasClinicas.length} Pieza(s) examinada(s)
            </p>
          </div>
        </div>

        {/* ANTECEDENTES MÉDICOS SISTÉMICOS */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase block">Antecedentes Médicos de Base</span>
          {antecedentes.filter(a => a !== 'Ninguno').length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {antecedentes.filter(a => a !== 'Ninguno').map((ant, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium rounded-md">
                  • {ant}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs font-medium text-slate-500">Sin antecedentes médicos sistémicos declarados.</p>
          )}
        </div>

        {/* DETALLE DEL ODONTOGRAMA */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase block">Detalle Clínico por Pieza Dental</span>
          {piezasClinicas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {piezasClinicas.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-sky-600">Pieza #{p.pieza}</span>
                    <p className="text-xs font-medium text-slate-700">{p.hallazgo}</p>
                  </div>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                    Tratamiento: {p.tratamiento}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No se registraron hallazgos específicos en las piezas dentales.</p>
          )}
        </div>
      </div>
      ) : (
        /* FORMULARIO COMPLETO DE TRIAJE Y ODONTOGRAMA (CREAR O EDITAR) */
        <form onSubmit={handleFinalizarConsulta} className="space-y-6">
          
          {/* APARTADO 1: ANAMNESIS DENTOMÉDICA EXTENSA */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[#0d1527]">1. Triaje e Historia Clínica Médica Completa</h2>
              <p className="text-slate-500 text-xs font-medium mt-1">
                Marque los antecedentes, alergias, hábitos y signos vitales reportados por el paciente.
              </p>
            </div>

            {/* A. Antecedentes Médicos Sistémicos */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                A. Antecedentes Médicos Sistémicos
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-medium">
                {[
                  'Hipertensión Arterial', 
                  'Diabetes Mellitus', 
                  'Cardiopatía / Soplo / Marcapasos',
                  'Trastorno de Coagulación / Anticoagulado', 
                  'Asma / EPOC / Resp. Crónica',
                  'Embarazo / Lactancia', 
                  'Osteoporosis / Uso de Bifosfonatos',
                  'Inmunocompromiso / Cáncer / Quimioterapia'
                ].map(item => {
                  const checked = antecedentes.includes(item);
                  return (
                    <label 
                      key={item} 
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        checked 
                          ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={checked} 
                        onChange={() => handleToggleAntecedente(item)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer" 
                      />
                      <span className="leading-tight">{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* B. Alergias Conocidas */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                B. Alergias Conocidas
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-medium">
                {[
                  'Penicilina / Amoxicilina / Antibióticos', 'Anestésicos Locales (Lidocaína, Mepivacaína)',
                  'AINEs (Ibuprofeno, Aspirina, Ketorolaco)', 'Látex / Guantes',
                  'Resinas / Acrílicos / Metales Dentales', 'Yodo / Antisépticos', 'Ninguna Conocida'
                ].map(alergia => {
                  const checked = alergias.includes(alergia);
                  return (
                    <label 
                      key={alergia} 
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        checked 
                          ? 'bg-red-900 text-white border-red-900 font-bold shadow-xs' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={checked} 
                        onChange={() => handleToggleAlergia(alergia)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-0 cursor-pointer" 
                      />
                      <span className="leading-tight">{alergia}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* C. Hábitos de Riesgo y Estilo de Vida */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                C. Hábitos y Estilo de Vida
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-medium">
                {[
                  'Bruxismo / Rechinamiento', 'Tabaquismo / Fumador',
                  'Consumo Frecuente de Alcohol', 'Mala Higiene Bucal'
                ].map(habito => {
                  const checked = habitos.includes(habito);
                  return (
                    <label 
                      key={habito} 
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        checked 
                          ? 'bg-amber-900 text-white border-amber-900 font-bold shadow-xs' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={checked} 
                        onChange={() => handleToggleHabito(habito)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-0 cursor-pointer" 
                      />
                      <span className="leading-tight">{habito}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* D. Signos Vitales y Medicamentos */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                D. Signos Vitales Básicos y Tratamiento Farmacológico
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Presión Arterial (mmHg)</label>
                  <input 
                    type="text" 
                    value={presionArterial}
                    onChange={(e) => setPresionArterial(e.target.value)}
                    placeholder="Ej. 120/80" 
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#2B5566]" 
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">¿Manifiesta Fiebre o Escalofríos?</label>
                  <select 
                    value={fiebre}
                    onChange={(e) => setFiebre(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#2B5566]"
                  >
                    <option value="No">No / Afebril</option>
                    <option value="Sí">Sí / Sensación febril o medición &gt; 37.8°C</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Medicamentos de Uso Continuo</label>
                  <input 
                    type="text" 
                    value={otrosMeds}
                    onChange={(e) => setOtrosMeds(e.target.value)}
                    placeholder="Losartán, Metformina, Warfarina..." 
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#2B5566]" 
                  />
                </div>
              </div>
            </div>

            {/* E. Motivo de Consulta y Evaluación del Dolor */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                E. Motivo de Consulta y Evaluación Sintomática
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Motivo Principal de Atención</label>
                  <select 
                    value={motivoConsulta}
                    onChange={(e) => setMotivoConsulta(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-[#0d1527] focus:bg-white focus:outline-none focus:border-[#2B5566]"
                  >
                    <option value="Consulta Preventiva / Limpieza">Consulta Preventiva / Limpieza</option>
                    <option value="Dolor Dental Agudo">Dolor Dental Agudo</option>
                    <option value="Inflamación / Absceso / Supuración">Inflamación / Absceso / Supuración (Pus)</option>
                    <option value="Traumatismo / Diente Fracturado">Traumatismo / Diente Fracturado o Suelto</option>
                    <option value="Estética / Diseño / Ortodoncia">Estética / Diseño / Ortodoncia</option>
                    <option value="Rehabilitación / Prótesis / Implante">Rehabilitación / Prótesis / Implante</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Caracterización del Dolor</label>
                  <select 
                    value={tipoDolor}
                    onChange={(e) => setTipoDolor(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-[#0d1527] focus:bg-white focus:outline-none focus:border-[#2B5566]"
                  >
                    <option value="Ninguno / Asintomático">Ninguno / Asintomático</option>
                    <option value="Pulsátil / Latido constante">Pulsátil / Latido constante (Intenso noche)</option>
                    <option value="Punzante / Agudo al masticar">Punzante / Agudo al masticar</option>
                    <option value="Provocado por Frío / Calor">Provocado por Frío / Calor</option>
                    <option value="Sordo / Molestia continua">Sordo / Molestia continua</option>
                  </select>
                </div>
              </div>

              {/* SELECCIÓN EVA CON MARCADO CLARO */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700">
                    Nivel de Dolor Escala EVA (0 al 10)
                  </label>
                  <span className="text-xs font-extrabold text-[#2B5566] bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                    Registrado: EVA {nivelDolor}
                  </span>
                </div>

                <div className="grid grid-cols-11 gap-1.5">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                    const isSelected = nivelDolor === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNivelDolor(num)}
                        className={`py-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105 ring-2 ring-slate-400'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* APARTADO 2: ODONTOGRAMA Y REGISTRO DE PIEZAS */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#0d1527]">2. Examen Dental por Piezas (Nomenclatura FDI)</h2>
              <p className="text-slate-500 text-xs font-medium mt-0.5">
                Haga clic sobre cada pieza en la boca del paciente para asignarle su estado o tratamiento.
              </p>
            </div>

            {/* DIAGRAMA DE PIEZAS */}
            <div className="space-y-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
              
              {/* Maxilar Superior */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center mb-2">
                  Maxilar Superior
                </span>
                <div className="flex justify-center gap-1 sm:gap-2">
                  <div className="flex gap-1">
                    {cuadrante1.map(pieza => {
                      const tieneReg = piezasClinicas.some(p => p.pieza === pieza);
                      return (
                        <button
                          key={pieza}
                          type="button"
                          onClick={() => setPiezaSeleccionada(pieza)}
                          className={`w-8 h-10 sm:w-10 sm:h-12 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                            piezaSeleccionada === pieza
                              ? 'bg-[#2B5566] text-white border-[#2B5566] scale-110 shadow-md ring-2 ring-blue-300'
                              : tieneReg
                              ? 'bg-amber-100 border-amber-400 text-amber-950 font-black ring-1 ring-amber-300'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                          }`}
                        >
                          {pieza}
                        </button>
                      );
                    })}
                  </div>
                  <div className="w-0.5 bg-slate-300 rounded-full h-10 sm:h-12 mx-1"></div>
                  <div className="flex gap-1">
                    {cuadrante2.map(pieza => {
                      const tieneReg = piezasClinicas.some(p => p.pieza === pieza);
                      return (
                        <button
                          key={pieza}
                          type="button"
                          onClick={() => setPiezaSeleccionada(pieza)}
                          className={`w-8 h-10 sm:w-10 sm:h-12 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                            piezaSeleccionada === pieza
                              ? 'bg-[#2B5566] text-white border-[#2B5566] scale-110 shadow-md ring-2 ring-blue-300'
                              : tieneReg
                              ? 'bg-amber-100 border-amber-400 text-amber-950 font-black ring-1 ring-amber-300'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                          }`}
                        >
                          {pieza}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Maxilar Inferior */}
              <div>
                <div className="flex justify-center gap-1 sm:gap-2">
                  <div className="flex gap-1">
                    {cuadrante4.map(pieza => {
                      const tieneReg = piezasClinicas.some(p => p.pieza === pieza);
                      return (
                        <button
                          key={pieza}
                          type="button"
                          onClick={() => setPiezaSeleccionada(pieza)}
                          className={`w-8 h-10 sm:w-10 sm:h-12 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                            piezaSeleccionada === pieza
                              ? 'bg-[#2B5566] text-white border-[#2B5566] scale-110 shadow-md ring-2 ring-blue-300'
                              : tieneReg
                              ? 'bg-amber-100 border-amber-400 text-amber-950 font-black ring-1 ring-amber-300'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                          }`}
                        >
                          {pieza}
                        </button>
                      );
                    })}
                  </div>
                  <div className="w-0.5 bg-slate-300 rounded-full h-10 sm:h-12 mx-1"></div>
                  <div className="flex gap-1">
                    {cuadrante3.map(pieza => {
                      const tieneReg = piezasClinicas.some(p => p.pieza === pieza);
                      return (
                        <button
                          key={pieza}
                          type="button"
                          onClick={() => setPiezaSeleccionada(pieza)}
                          className={`w-8 h-10 sm:w-10 sm:h-12 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                            piezaSeleccionada === pieza
                              ? 'bg-[#2B5566] text-white border-[#2B5566] scale-110 shadow-md ring-2 ring-blue-300'
                              : tieneReg
                              ? 'bg-amber-100 border-amber-400 text-amber-950 font-black ring-1 ring-amber-300'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                          }`}
                        >
                          {pieza}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center mt-2">
                  Maxilar Inferior
                </span>
              </div>

            </div>

            {/* PANEL DE REGISTRO DE PIEZA */}
            {piezaSeleccionada && (
              <div className="p-5 bg-slate-100 rounded-2xl border border-slate-300 space-y-4 animate-in fade-in duration-150">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h3 className="text-sm font-extrabold text-[#0d1527]">
                    Anotación para Pieza Dental #{piezaSeleccionada}
                  </h3>
                  <button 
                    type="button"
                    onClick={() => setPiezaSeleccionada(null)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    ✕ Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hallazgo Observado</label>
                    <select 
                      value={hallazgoTemp} 
                      onChange={(e) => setHallazgoTemp(e.target.value)}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-medium text-slate-900"
                    >
                      <option value="Caries Profunda">Caries Profunda</option>
                      <option value="Infección / Absceso / Supuración">Infección / Absceso / Supuración</option>
                      <option value="Resto Radicular Infectado">Resto Radicular Infectado</option>
                      <option value="Fractura Dental / Traumatismo">Fractura Dental / Traumatismo</option>
                      <option value="Pieza Ausente">Pieza Ausente</option>
                      <option value="Tratamiento Conducto Previo">Tratamiento Conducto Previo</option>
                      <option value="Diente Sano / Control">Diente Sano / Control</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tratamiento Sugerido</label>
                    <select 
                      value={tratamientoTemp} 
                      onChange={(e) => setTratamientoTemp(e.target.value)}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-medium text-slate-900"
                    >
                      <option value="Restauración / Resina">Restauración / Resina</option>
                      <option value="Endodoncia (Tratamiento Conducto)">Endodoncia (Tratamiento Conducto)</option>
                      <option value="Exodoncia (Extracción)">Exodoncia (Extracción)</option>
                      <option value="Corona / Prótesis">Corona / Prótesis</option>
                      <option value="Limpieza Profunda / Detartraje">Limpieza Profunda / Detartraje</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notas Clínicas</label>
                  <input 
                    type="text" 
                    value={notaTemp}
                    onChange={(e) => setNotaTemp(e.target.value)}
                    placeholder="Ej. Movilidad grado 1, cavidad vestibular..."
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>

                <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={agregarPiezaDental}
                    className="px-5 py-2.5 bg-[#2B5566] text-white text-xs font-bold rounded-xl hover:bg-[#1f3e4b] transition-colors shadow-sm cursor-pointer"
                  >
                    Guardar Pieza #{piezaSeleccionada}
                  </button>
                </div>
              </div>
            )}

            {/* TABLA RESUMEN DE PIEZAS */}
            {piezasClinicas.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Piezas Dentales Registradas ({piezasClinicas.length})
                </h3>
                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Pieza</th>
                        <th className="py-2.5 px-3">Hallazgo</th>
                        <th className="py-2.5 px-3">Tratamiento Propuesto</th>
                        <th className="py-2.5 px-3">Notas</th>
                        <th className="py-2.5 px-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {piezasClinicas.map((p) => (
                        <tr key={p.pieza} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-extrabold text-[#0284c7]">#{p.pieza}</td>
                          <td className="py-2.5 px-3">{p.hallazgo}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{p.tratamiento}</td>
                          <td className="py-2.5 px-3 text-slate-500">{p.nota || '-'}</td>
                          <td className="py-2.5 px-3 text-right">
                            <button 
                              type="button"
                              onClick={() => eliminarPieza(p.pieza)}
                              className="text-red-500 font-bold hover:underline cursor-pointer"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

          {/* BOTÓN FINAL DE CIERRE */}
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-extrabold text-base hover:bg-slate-800 transition-all shadow-md cursor-pointer"
          >
            {isPending ? 'Guardando...' : historiaId ? 'Actualizar Historia Clínica y Recalcular' : 'Finalizar Consulta y Calcular Semáforo'}
          </button>

        </form>
      )}

    </div>
  );
}