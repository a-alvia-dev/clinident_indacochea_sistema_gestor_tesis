'use server';

import { createClient } from '../../lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function obtenerPacientes(busqueda?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('pacientes')
    .select('*')
    .order('created_at', { ascending: false });

  if (busqueda && busqueda.trim() !== '') {
    query = query.or(
      `nombres.ilike.%${busqueda}%,apellidos.ilike.%${busqueda}%,cedula.ilike.%${busqueda}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error al obtener pacientes:', error);
    return [];
  }

  return data;
}

export async function crearPacienteAction(formData: FormData) {
  const supabase = await createClient();

  // Solo enviamos los campos que existen directamente en la tabla 'pacientes'
  const pacienteData = {
    nombres: formData.get('nombres') as string,
    apellidos: formData.get('apellidos') as string,
    cedula: (formData.get('cedula') as string) || null,
    telefono: (formData.get('telefono') as string) || null,
    email: (formData.get('email') as string) || null,
    fecha_nacimiento: (formData.get('fecha_nacimiento') as string) || '2000-01-01',
  };

  const { data, error } = await supabase
    .from('pacientes')
    .insert([pacienteData])
    .select()
    .single();

  if (error) {
    console.error('Error al insertar paciente:', error);
    return { success: false, error: `Error Supabase: ${error.message}` };
  }

  revalidatePath('/pacientes');
  return { success: true, pacienteId: data.id };
}