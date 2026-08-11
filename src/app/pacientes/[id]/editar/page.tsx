'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { obtenerPacientePorId, actualizarPacienteAction } from '../../actions';

export default function EditarPacientePage() {
  const router = useRouter();
  const params = useParams();
  const pacienteId = params.id as string;

  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paciente, setPaciente] = useState<any>(null);

  useEffect(() => {
    async function cargarPaciente() {
      const data = await obtenerPacientePorId(pacienteId);
      if (!data) {
        setErrorMsg('Paciente no encontrado');
      } else {
        setPaciente(data);
      }
      setLoading(false);
    }
    cargarPaciente();
  }, [pacienteId]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await actualizarPacienteAction(pacienteId, formData);
      if (res.success) {
        router.push('/pacientes');
      } else {
        setErrorMsg(res.error || 'Error al actualizar el paciente.');
      }
    });
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto py-12 text-center text-slate-400">Cargando datos...</div>;
  }

  if (!paciente) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-red-400 space-y-4">
        <p>No se encontró el paciente.</p>
        <Link href="/pacientes" className="text-sky-400 hover:underline text-sm">← Volver a la lista</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/pacientes" className="text-slate-400 hover:text-slate-200 text-sm mb-2 inline-block">
          ← Volver a Pacientes
        </Link>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Editar Paciente: {paciente.nombres} {paciente.apellidos}
        </h1>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#1e293b] p-6 md:p-8 rounded-2xl border border-slate-700/60 shadow-2xl space-y-6">
        
        {/* 1. DATOS PERSONALES */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400">1. DATOS PERSONALES</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombres *</label>
              <input type="text" name="nombres" defaultValue={paciente.nombres || ''} required className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Apellidos *</label>
              <input type="text" name="apellidos" defaultValue={paciente.apellidos || ''} required className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Cédula / DNI *</label>
              <input type="text" name="cedula" defaultValue={paciente.cedula || ''} required className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Fecha de Nacimiento *</label>
              <input type="date" name="fecha_nacimiento" defaultValue={paciente.fecha_nacimiento || ''} required className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Sexo Biológico *</label>
              <select name="sexo" defaultValue={paciente.sexo || 'Masculino'} required className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm">
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Ocupación</label>
              <input type="text" name="ocupacion" defaultValue={paciente.ocupacion || ''} className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm" />
            </div>
          </div>
        </div>

        <hr className="border-slate-700/50" />

        {/* 2. UBICACIÓN Y CONTACTO */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400">2. UBICACIÓN Y CONTACTO</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Teléfono Móvil *</label>
              <input type="text" name="telefono" defaultValue={paciente.telefono || ''} required className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Correo Electrónico</label>
              <input type="email" name="email" defaultValue={paciente.email || ''} className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Dirección de Domicilio</label>
              <input type="text" name="direccion" defaultValue={paciente.direccion || ''} className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm" />
            </div>
          </div>
        </div>

        <hr className="border-slate-700/50" />

        {/* 3. CONTACTO DE EMERGENCIA */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400">3. CONTACTO DE EMERGENCIA</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre del Contacto</label>
              <input type="text" name="contacto_emergencia_nombre" defaultValue={paciente.contacto_emergencia_nombre || ''} className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Teléfono de Emergencia</label>
              <input type="text" name="contacto_emergencia_telefono" defaultValue={paciente.contacto_emergencia_telefono || ''} className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
          <Link href="/pacientes" className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 font-medium rounded-xl text-slate-300 text-sm">
            Cancelar
          </Link>
          <button type="submit" disabled={isPending} className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 font-semibold rounded-xl text-white text-sm">
            {isPending ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

      </form>
    </div>
  );
}