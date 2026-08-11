'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BotonEliminar } from './BotonEliminar';

export function FilaPaciente({ paciente }: { paciente: any }) {
  const [desplegado, setDesplegado] = useState(false);

  return (
    <>
      {/* FILA PRINCIPAL DE LA TABLA */}
      <tr className="hover:bg-slate-700/30 transition-colors border-b border-slate-700/60">
        <td className="p-4 font-medium text-slate-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDesplegado(!desplegado)}
              className="p-1 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors"
              title={desplegado ? "Ocultar detalles" : "Ver detalles"}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  desplegado ? 'rotate-180 text-sky-400' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div>
              <p className="font-semibold text-slate-100">{paciente.nombres} {paciente.apellidos}</p>
              <p className="text-xs text-slate-400 sm:hidden">C.I.: {paciente.cedula || 'Sin C.I.'}</p>
            </div>
          </div>
        </td>

        <td className="p-4 text-slate-400">
          {paciente.cedula || 'Sin registro'}
        </td>

        <td className="p-4">
          {paciente.tiene_historia ? (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                paciente.semaforo_color === 'rojo'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : paciente.semaforo_color === 'naranja'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              {paciente.semaforo_color ? paciente.semaforo_color.toUpperCase() : 'VERDE'}
            </span>
          ) : (
            <span className="text-xs text-slate-500 italic">Pendiente de historia</span>
          )}
        </td>

        <td className="p-4 text-right">
          <div className="flex items-center justify-end gap-2">
            {/* HISTORIA CLÍNICA */}
            {paciente.tiene_historia ? (
              <Link
                href={`/pacientes/${paciente.id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-colors"
              >
                Ver Historia →
              </Link>
            ) : (
              <Link
                href={`/pacientes/${paciente.id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-colors"
              >
                + Aperturar Historia
              </Link>
            )}

            {/* EDITAR */}
            <Link
              href={`/pacientes/${paciente.id}/editar`}
              className="px-3 py-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl transition-colors"
            >
              Editar
            </Link>

            {/* ELIMINAR */}
            <BotonEliminar
              id={paciente.id}
              nombre={`${paciente.nombres} ${paciente.apellidos}`}
            />
          </div>
        </td>
      </tr>

      {/* FILA DESPLEGABLE CON DETALLES DE SOLO LECTURA (READ) */}
      {desplegado && (
        <tr className="bg-slate-900/60 border-b border-slate-700/60">
          <td colSpan={4} className="p-5">
            <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                  <span>📄</span> Ficha del Paciente (Solo Lectura)
                </h4>
                <span className="text-xs text-slate-500">ID: {paciente.id}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Bloque 1: Personales */}
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40 space-y-1.5">
                  <p className="text-slate-400 font-medium border-b border-slate-700/50 pb-1">Datos Personales</p>
                  <p className="text-slate-200"><strong className="text-slate-400">Fecha Nac.:</strong> {paciente.fecha_nacimiento || 'No registrada'}</p>
                  <p className="text-slate-200"><strong className="text-slate-400">Sexo:</strong> {paciente.sexo || 'No especificado'}</p>
                  <p className="text-slate-200"><strong className="text-slate-400">Ocupación:</strong> {paciente.ocupacion || 'No registrada'}</p>
                </div>

                {/* Bloque 2: Ubicación & Contacto */}
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40 space-y-1.5">
                  <p className="text-slate-400 font-medium border-b border-slate-700/50 pb-1">Contacto & Ubicación</p>
                  <p className="text-slate-200"><strong className="text-slate-400">Teléfono:</strong> {paciente.telefono || 'Sin número'}</p>
                  <p className="text-slate-200"><strong className="text-slate-400">Email:</strong> {paciente.email || 'Sin correo'}</p>
                  <p className="text-slate-200"><strong className="text-slate-400">Dirección:</strong> {paciente.direccion || 'Sin dirección registrada'}</p>
                </div>

                {/* Bloque 3: Emergencia */}
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40 space-y-1.5">
                  <p className="text-slate-400 font-medium border-b border-slate-700/50 pb-1">Contacto de Emergencia</p>
                  <p className="text-slate-200"><strong className="text-slate-400">Nombre:</strong> {paciente.contacto_emergencia_nombre || 'No asignado'}</p>
                  <p className="text-slate-200"><strong className="text-slate-400">Teléfono:</strong> {paciente.contacto_emergencia_telefono || 'No asignado'}</p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}