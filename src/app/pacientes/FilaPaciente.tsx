'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BotonEliminar } from './BotonEliminar';
import { actualizarPacienteRapido } from './actions';

export function FilaPaciente({ paciente }: { paciente: any }) {
  const [desplegado, setDesplegado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  async function handleGuardarCambios(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);

    const formData = new FormData(e.currentTarget);
    const res = await actualizarPacienteRapido(formData);

    setCargando(false);

    if (res.success) {
      setMensaje({ tipo: 'exito', texto: '¡Datos actualizados correctamente!' });
      setTimeout(() => setMensaje(null), 3000);
    } else {
      setMensaje({ tipo: 'error', texto: res.error || 'Error al actualizar los datos.' });
    }
  }

  return (
    <>
      {/* FILA PRINCIPAL DE LA TABLA */}
      <tr className="hover:bg-slate-700/30 transition-colors border-b border-slate-700/60">
        <td className="p-4 font-medium text-slate-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDesplegado(!desplegado)}
              className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs"
              title={desplegado ? 'Ocultar edición' : 'Editar / Ver detalles'}
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

        {/* ÚNICA ACCIÓN EN LA TABLA PRINCIPAL */}
        <td className="p-4 text-right">
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
        </td>
      </tr>

      {/* PANEL DESPLEGABLE EDITABLE */}
      {desplegado && (
        <tr className="bg-slate-900/80 border-b border-slate-700/60">
          <td colSpan={4} className="p-4">
            <form onSubmit={handleGuardarCambios} className="bg-[#0f172a] p-5 rounded-2xl border border-slate-700/80 space-y-4">
              <input type="hidden" name="id" value={paciente.id} />

              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                  <span>✏️</span> Editar Ficha del Paciente
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">ID: {paciente.id}</span>
              </div>

              {mensaje && (
                <div className={`p-3 rounded-xl text-xs font-medium ${
                  mensaje.tipo === 'exito' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {mensaje.texto}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                {/* Columna 1: Personales */}
                <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/40 space-y-2.5">
                  <p className="text-slate-400 font-semibold border-b border-slate-700/50 pb-1">Datos Personales</p>
                  
                  <div>
                    <label className="text-slate-400 block mb-1">Nombres</label>
                    <input
                      type="text"
                      name="nombres"
                      defaultValue={paciente.nombres}
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Apellidos</label>
                    <input
                      type="text"
                      name="apellidos"
                      defaultValue={paciente.apellidos}
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Cédula</label>
                    <input
                      type="text"
                      name="cedula"
                      defaultValue={paciente.cedula || ''}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Fecha Nac.</label>
                      <input
                        type="date"
                        name="fecha_nacimiento"
                        defaultValue={paciente.fecha_nacimiento || ''}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 focus:border-sky-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Sexo</label>
                      <select
                        name="sexo"
                        defaultValue={paciente.sexo || 'Masculino'}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 focus:border-sky-500 focus:outline-none"
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Columna 2: Ubicación & Contacto */}
                <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/40 space-y-2.5">
                  <p className="text-slate-400 font-semibold border-b border-slate-700/50 pb-1">Contacto & Ubicación</p>
                  
                  <div>
                    <label className="text-slate-400 block mb-1">Teléfono</label>
                    <input
                      type="text"
                      name="telefono"
                      defaultValue={paciente.telefono || ''}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={paciente.email || ''}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Ocupación</label>
                    <input
                      type="text"
                      name="ocupacion"
                      defaultValue={paciente.ocupacion || ''}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      defaultValue={paciente.direccion || ''}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Columna 3: Emergencia */}
                <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/40 space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <p className="text-slate-400 font-semibold border-b border-slate-700/50 pb-1">Contacto de Emergencia</p>

                    <div>
                      <label className="text-slate-400 block mb-1">Nombre</label>
                      <input
                        type="text"
                        name="contacto_emergencia_nombre"
                        defaultValue={paciente.contacto_emergencia_nombre || ''}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Teléfono</label>
                      <input
                        type="text"
                        name="contacto_emergencia_telefono"
                        defaultValue={paciente.contacto_emergencia_telefono || ''}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* PIE DEL DESPLEGABLE: TACHO DE BASURA Y BOTÓN GUARDAR */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-2">
                
                {/* BOTÓN ELIMINAR CON TACHO REDISEÑADO */}
                <div className="flex items-center gap-2">
                  <BotonEliminar
                    id={paciente.id}
                    nombre={`${paciente.nombres} ${paciente.apellidos}`}
                  />
                  <span className="text-[11px] text-slate-500 hidden sm:inline">Eliminar este paciente</span>
                </div>

                {/* BOTÓN GUARDAR CAMBIOS */}
                <button
                  type="submit"
                  disabled={cargando}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-xl text-xs transition-colors shadow-lg shadow-sky-900/30 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {cargando ? 'Guardando...' : '💾 Guardar Cambios'}
                </button>

              </div>

            </form>
          </td>
        </tr>
      )}
    </>
  );
}