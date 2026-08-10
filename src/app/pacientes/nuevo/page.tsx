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
        router.push(`/pacientes`);
      } else {
        setErrorMsg(res.error || 'Error al guardar el paciente.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div>
          <Link href="/pacientes" className="text-slate-400 hover:text-slate-200 text-sm">
            ← Volver a Pacientes
          </Link>
          <h1 className="text-2xl font-bold text-slate-100 mt-1">Registrar Nuevo Paciente</h1>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 shadow-xl space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombres *</label>
              <input
                type="text"
                name="nombres"
                required
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Apellidos *</label>
              <input
                type="text"
                name="apellidos"
                required
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Cédula / DNI</label>
              <input
                type="text"
                name="cedula"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Teléfono</label>
              <input
                type="text"
                name="telefono"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Alergias Conocidas</label>
            <input
              type="text"
              name="alergias"
              placeholder="Ej: Penicilina, Anestesia..."
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 font-medium rounded-xl text-white transition-colors disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : 'Guardar Paciente'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}