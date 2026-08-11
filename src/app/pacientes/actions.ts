'use server';

import { createClient } from '../../lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ===================================================
// 1. OBTENER TODOS LOS PACIENTES
// ===================================================
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

export async function obtenerPacientePorId(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pacientes')
    .select('id, nombres, apellidos, cedula, telefono, tiene_historia, semaforo_color')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

// ===================================================
// 3. CREAR NUEVO PACIENTE
// ===================================================
export async function crearPacienteAction(formData: FormData) {
  const supabase = await createClient();

  const fechaNacimientoRaw = formData.get('fecha_nacimiento') as string;
  const fecha_nacimiento = fechaNacimientoRaw && fechaNacimientoRaw.trim() !== '' 
    ? fechaNacimientoRaw 
    : '2000-01-01';

  const pacienteData = {
    nombres: formData.get('nombres') as string,
    apellidos: formData.get('apellidos') as string,
    cedula: formData.get('cedula') as string,
    fecha_nacimiento,
    sexo: formData.get('sexo') as string,
    ocupacion: formData.get('ocupacion') as string,
    telefono: formData.get('telefono') as string,
    email: formData.get('email') as string,
    direccion: formData.get('direccion') as string,
    contacto_emergencia_nombre: formData.get('contacto_emergencia_nombre') as string,
    contacto_emergencia_telefono: formData.get('contacto_emergencia_telefono') as string,
    semaforo_color: 'verde',
    clasificacion_dental: 'VERDE',
  };

  const { data, error } = await supabase.from('pacientes').insert([pacienteData]).select().single();

  if (error) {
    if (error.code === '23505' || error.message.includes('pacientes_cedula_key')) {
      return { 
        success: false, 
        error: 'Ya existe un paciente registrado con este número de cédula/DNI.' 
      };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/pacientes');
  revalidatePath('/tratamientos');
  return { success: true, paciente: data };
}

// ===================================================
// 4. ACTUALIZAR PACIENTE EXISTENTE (EDITAR PACIENTE)
// ===================================================
export async function actualizarPacienteAction(id: string, formData: FormData) {
  const supabase = await createClient();

  const fechaNacimientoRaw = formData.get('fecha_nacimiento') as string;
  const fecha_nacimiento = fechaNacimientoRaw && fechaNacimientoRaw.trim() !== '' 
    ? fechaNacimientoRaw 
    : '2000-01-01';

  const pacienteData = {
    nombres: formData.get('nombres') as string,
    apellidos: formData.get('apellidos') as string,
    cedula: formData.get('cedula') as string,
    fecha_nacimiento,
    sexo: formData.get('sexo') as string,
    ocupacion: formData.get('ocupacion') as string,
    telefono: formData.get('telefono') as string,
    email: formData.get('email') as string,
    direccion: formData.get('direccion') as string,
    contacto_emergencia_nombre: formData.get('contacto_emergencia_nombre') as string,
    contacto_emergencia_telefono: formData.get('contacto_emergencia_telefono') as string,
  };

  const { error } = await supabase
    .from('pacientes')
    .update(pacienteData)
    .eq('id', id);

  if (error) {
    if (error.code === '23505' || error.message.includes('pacientes_cedula_key')) {
      return { 
        success: false, 
        error: 'Ya existe otro paciente registrado con esta cédula/DNI.' 
      };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/pacientes');
  revalidatePath(`/pacientes/${id}`);
  revalidatePath('/tratamientos');
  return { success: true };
}

// ===================================================
// 5. ELIMINAR PACIENTE
// ===================================================
export async function eliminarPacienteAction(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('pacientes')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/pacientes');
  revalidatePath('/tratamientos');
  return { success: true };
}

// ===================================================
// 6. HISTORIA CLÍNICA: CREAR / APERTURAR
// ===================================================
export async function aperturarHistoriaAction(formData: FormData) {
  const supabase = await createClient();

  const pacienteId = formData.get('pacienteId') as string;
  const motivo = formData.get('motivo') as string;
  const tipoDolor = formData.get('tipoDolor') as string;
  const nivelDolor = Number(formData.get('nivel_dolor') || 0);
  const semaforoColor = formData.get('semaforo_color') as string;
  const semaforoRazon = formData.get('semaforo_razon') as string;

  const antecedentes = JSON.parse((formData.get('antecedentes') as string) || '[]');
  const alergias = JSON.parse((formData.get('alergias') as string) || '[]');
  const habitos = JSON.parse((formData.get('habitos') as string) || '[]');
  const piezas = JSON.parse((formData.get('piezas') as string) || '[]');

  // Insertar en historias_clinicas
  const { data: historia, error: errorHistoria } = await supabase
    .from('historias_clinicas')
    .insert([
      {
        paciente_id: pacienteId,
        motivo_consulta: motivo,
        tipo_dolor: tipoDolor,
        nivel_dolor: nivelDolor,
        antecedentes: antecedentes,
        alergias: alergias,
        habitos: habitos,
        piezas_dentales: piezas,
        semaforo_color: semaforoColor,
        semaforo_razon: semaforoRazon,
      }
    ])
    .select()
    .single();

  if (errorHistoria) {
    console.error('❌ Error Supabase al crear historia:', errorHistoria);
    return { success: false, error: errorHistoria.message };
  }

  // Actualizar estado general en tabla pacientes
  await supabase
    .from('pacientes')
    .update({
      tiene_historia: true,
      semaforo_color: semaforoColor,
      semaforo_razon: semaforoRazon,
    })
    .eq('id', pacienteId);

  revalidatePath('/pacientes');
  revalidatePath(`/pacientes/${pacienteId}`);
  revalidatePath('/tratamientos'); // ⚡ Fuerza actualización inmediata del módulo Tratamientos

  return { success: true, data: historia };
}

// ===================================================
// 7. HISTORIA CLÍNICA: LEER / CONSULTAR
// ===================================================
export async function obtenerHistoriaClinicaPorPaciente(pacienteId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('historias_clinicas')
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('❌ Error al obtener historia:', error);
    return null;
  }

  return data;
}

// ===================================================
// 8. HISTORIA CLÍNICA: ACTUALIZAR / EDITAR
// ===================================================
export async function actualizarHistoriaAction(historiaId: string, formData: FormData) {
  const supabase = await createClient();

  const pacienteId = formData.get('pacienteId') as string;
  const motivo = formData.get('motivo') as string;
  const tipoDolor = formData.get('tipoDolor') as string;
  const nivelDolor = Number(formData.get('nivel_dolor') || 0);
  const semaforoColor = formData.get('semaforo_color') as string;
  const semaforoRazon = formData.get('semaforo_razon') as string;

  const antecedentes = JSON.parse((formData.get('antecedentes') as string) || '[]');
  const alergias = JSON.parse((formData.get('alergias') as string) || '[]');
  const habitos = JSON.parse((formData.get('habitos') as string) || '[]');
  const piezas = JSON.parse((formData.get('piezas') as string) || '[]');

  const { error } = await supabase
    .from('historias_clinicas')
    .update({
      motivo_consulta: motivo,
      tipo_dolor: tipoDolor,
      nivel_dolor: nivelDolor,
      antecedentes: antecedentes,
      alergias: alergias,
      habitos: habitos,
      piezas_dentales: piezas,
      semaforo_color: semaforoColor,
      semaforo_razon: semaforoRazon,
      updated_at: new Date().toISOString(),
    })
    .eq('id', historiaId);

  if (error) {
    console.error('❌ Error al actualizar historia:', error);
    return { success: false, error: error.message };
  }

  // Actualizar resumen en la tabla pacientes
  await supabase
    .from('pacientes')
    .update({
      semaforo_color: semaforoColor,
      semaforo_razon: semaforoRazon,
    })
    .eq('id', pacienteId);

  revalidatePath('/pacientes');
  revalidatePath(`/pacientes/${pacienteId}`);
  revalidatePath('/tratamientos'); // ⚡ Fuerza actualización inmediata del módulo Tratamientos
  return { success: true };
}

// ===================================================
// 9. HISTORIA CLÍNICA: ELIMINAR
// ===================================================
export async function eliminarHistoriaAction(historiaId: string, pacienteId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('historias_clinicas')
    .delete()
    .eq('id', historiaId);

  if (error) {
    console.error('❌ Error al eliminar historia:', error);
    return { success: false, error: error.message };
  }

  // Restaurar paciente a sin historia
  await supabase
    .from('pacientes')
    .update({
      tiene_historia: false,
      semaforo_color: 'verde',
      semaforo_razon: null,
    })
    .eq('id', pacienteId);

  revalidatePath('/pacientes');
  revalidatePath(`/pacientes/${pacienteId}`);
  revalidatePath('/tratamientos'); // ⚡ Fuerza actualización inmediata del módulo Tratamientos

  return { success: true };
}

// ===================================================
// 10. ACTUALIZACIÓN RÁPIDA (FILA DESPLEGABLE)
// ===================================================
export async function actualizarPacienteRapido(formData: FormData) {
  const id = formData.get('id') as string;
  return await actualizarPacienteAction(id, formData);
}