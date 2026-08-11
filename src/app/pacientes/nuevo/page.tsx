'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { crearPacienteAction } from '../actions';

export default function NuevoPacientePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await crearPacienteAction(formData);
      if (res.success) {
        router.push('/pacientes');
      } else {
        setErrorMsg(res.error || 'Error al guardar el paciente.');
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div>
        <Link 
          href="/pacientes" 
          className="text-slate-400 hover:text-slate-200 font-medium text-sm transition-colors inline-flex items-center gap-1 mb-2"
        >
          ← Volver a Pacientes
        </Link>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Registrar Nuevo Paciente
        </h1>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#1e293b] p-6 md:p-8 rounded-2xl border border-slate-700/60 shadow-2xl space-y-6">
        
        {/* 1. DATOS PERSONALES */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400">
            1. DATOS PERSONALES
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombres *</label>
              <input
                type="text"
                name="nombres"
                required
                className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Apellidos *</label>
              <input
                type="text"
                name="apellidos"
                required
                className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Cédula / DNI *</label>
              <input
                type="text"
                name="cedula"
                required
                className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Fecha de Nacimiento *</label>
              <input
                type="date"
                name="fecha_nacimiento"
                required
                className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Sexo Biológico *</label>
              <select
                name="sexo"
                defaultValue="Masculino"
                required
                className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm"
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Ocupación</label>
              <input
                type="text"
                name="ocupacion"
                placeholder="Ej. Estudiante, Ingeniero"
                className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-700/50" />

        {/* 2. UBICACIÓN Y CONTACTO */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400">
            2. UBICACIÓN Y CONTACTO
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Teléfono Móvil *</label>
              <input
                type="text"
                name="telefono"
                required
                className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Dirección de Domicilio</label>
              <input
                type="text"
                name="direccion"
                placeholder="Ciudad, Sector, Calle principal y secundaria"
                className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-700/50" />

        {/* 3. CONTACTO DE EMERGENCIA */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400">
            3. CONTACTO DE EMERGENCIA
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre del Contacto</label>
              <input
                type="text"
                name="contacto_emergencia_nombre"
                placeholder="Nombre y Apellido"
                className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Teléfono de Emergencia</label>
              <input
                type="text"
                name="contacto_emergencia_telefono"
                placeholder="Número telefónico"
                className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 text-sm placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
          <Link
            href="/pacientes"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 font-medium rounded-xl text-slate-300 transition-colors text-sm"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 font-semibold rounded-xl text-white transition-colors disabled:opacity-50 text-sm shadow-lg shadow-sky-600/20"
          >
            {isPending ? 'Guardando...' : 'Guardar Paciente'}
          </button>
        </div>

      </form>
    </div>
  );
}