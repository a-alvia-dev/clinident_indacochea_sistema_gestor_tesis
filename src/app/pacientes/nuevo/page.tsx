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
      
      {/* Volver & Encabezado */}
      <div>
        <Link 
          href="/pacientes" 
          className="text-slate-500 hover:text-[#2B5566] font-semibold text-sm transition-colors inline-flex items-center gap-1 mb-2"
        >
          ← Volver a Pacientes
        </Link>
        <h1 className="text-3xl font-extrabold text-[#0d1527] tracking-tight">
          Registrar Nuevo Paciente
        </h1>
        <p className="text-slate-600 text-sm font-medium mt-1">
          Ingresa la información personal y de contacto para aperturar la ficha clínica.
        </p>
      </div>

      {/* Alerta de Error */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Formulario en Tarjeta Blanca Limpia */}
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-md space-y-8">
        
        {/* 1. DATOS PERSONALES */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-2 h-2 rounded-full bg-[#0284c7]"></span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0284c7]">
              1. Datos Personales
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombres *
              </label>
              <input
                type="text"
                name="nombres"
                required
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Apellidos *
              </label>
              <input
                type="text"
                name="apellidos"
                required
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cédula / DNI *
              </label>
              <input
                type="text"
                name="cedula"
                required
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                name="fecha_nacimiento"
                required
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Sexo Biológico *
              </label>
              <select
                name="sexo"
                defaultValue="Masculino"
                required
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ocupación
              </label>
              <input
                type="text"
                name="ocupacion"
                placeholder="Ej. Estudiante, Ingeniero"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* 2. UBICACIÓN Y CONTACTO */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-2 h-2 rounded-full bg-[#0284c7]"></span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0284c7]">
              2. Ubicación y Contacto
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Teléfono Móvil *
              </label>
              <input
                type="text"
                name="telefono"
                required
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Dirección de Domicilio
              </label>
              <input
                type="text"
                name="direccion"
                placeholder="Ciudad, Sector, Calle principal y secundaria"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* 3. CONTACTO DE EMERGENCIA */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-2 h-2 rounded-full bg-[#0284c7]"></span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0284c7]">
              3. Contacto de Emergencia
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombre del Contacto
              </label>
              <input
                type="text"
                name="contacto_emergencia_nombre"
                placeholder="Nombre y Apellido"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Teléfono de Emergencia
              </label>
              <input
                type="text"
                name="contacto_emergencia_telefono"
                placeholder="Número telefónico"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200/80">
          <Link
            href="/pacientes"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-slate-700 transition-colors text-sm"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 bg-[#2B5566] hover:bg-[#1f3e4b] font-bold rounded-xl text-white transition-all disabled:opacity-50 text-sm shadow-sm hover:shadow-md inline-flex items-center gap-2"
          >
            {isPending ? 'Guardando...' : 'Guardar Paciente'}
          </button>
        </div>

      </form>
    </div>
  );
}