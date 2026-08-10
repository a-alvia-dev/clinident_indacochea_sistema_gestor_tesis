'use server';

import { createClient } from '../../lib/supabase/server';
import { revalidatePath } from 'next/cache';

// 1. Obtener todos los pacientes
export async function obtenerPacientes(busqueda?: string) {
  const supabase = await createClient();

  let query = supabase.from('pacientes').select('*').order('created_at', { ascending: false });

  if (busqueda) {
    query = query.or(`nombres.ilike.%${busqueda}%,apellidos.ilike.%${busqueda}%,cedula.ilike.%${busqueda}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data;
}

// 2. Obtener paciente por ID
export async function obtenerPacientePorId(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

// 3. Crear nuevo paciente
export async function crearPacienteAction(formData: FormData) {
  const supabase = await createClient();

  const pacienteData = {
    nombres: formData.get('nombres') as string,
    apellidos: formData.get('apellidos') as string,
    cedula: formData.get('cedula') as string,
    telefono: formData.get('telefono') as string,
    email: formData.get('email') as string,
  };

  const { data, error } = await supabase.from('pacientes').insert([pacienteData]).select().single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/pacientes');
  return { success: true, paciente: data };
}

// 4. Aperturar Historia Clínica y Calcular Semáforo
export async function aperturarHistoriaAction(formData: FormData) {
  const supabase = await createClient();

  const pacienteId = formData.get('pacienteId') as string;
  const enfermedades_sistemicas = formData.getAll('enfermedades_sistemicas') as string[];
  const alergias_tipo = formData.get('alergias_tipo') as string;
  const alergias_detalle = formData.get('alergias_detalle') as string;
  const motivo_consulta = formData.get('motivo_consulta') as string;
  const nivel_dolor = formData.get('nivel_dolor') as string;
  const estado_encias = formData.get('estado_encias') as string;
  const hallazgos_bucales = formData.getAll('hallazgos_bucales') as string[];

  // --- ALGORITMO DE TRIAJE Y SEMAFORIZACIÓN ---
  let color: 'rojo' | 'naranja' | 'verde' = 'verde';
  let razon = 'Atención estándar. Paciente estable sin signos críticos observados.';

  // Regla Roja: Dolor Severo o Hallazgos Críticos
  const hallazgosCriticos = ['infeccion_absceso', 'trauma_fractura', 'movilidad_severa'];
  const tieneHallazgoCritico = hallazgos_bucales.some(h => hallazgosCriticos.includes(h));

  if (nivel_dolor === 'severo' || tieneHallazgoCritico) {
    color = 'rojo';
    razon = tieneHallazgoCritico 
      ? 'Urgencia detectada: Presenta signos de infección activa, traumatismo o movilidad severa.'
      : 'Urgencia detectada: Paciente reporta dolor severo / agudo.';
  } 
  // Regla Naranja: Dolor Leve o Periodontitis
  else if (
    nivel_dolor === 'leve' || 
    estado_encias === 'periodontitis' || 
    hallazgos_bucales.includes('caries_profunda')
  ) {
    color = 'naranja';
    razon = 'Prioridad media: Presenta sintomatología leve, caries profundas o inflamación periodontal activa.';
  }

  // Guardar en la base de datos
  const { error } = await supabase
    .from('pacientes')
    .update({
      tiene_historia: true,
      motivo_consulta,
      nivel_dolor,
      alergias_tipo,
      alergias_detalle,
      estado_encias,
      semaforo_color: color,
      semaforo_razon: razon,
      enfermedades_sistemicas,
      hallazgos_bucales,
    })
    .eq('id', pacienteId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/pacientes');
  revalidatePath(`/pacientes/${pacienteId}`);

  return { success: true, color, razon };
}