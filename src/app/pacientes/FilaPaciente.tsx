'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BotonEliminar } from './BotonEliminar';
import { actualizarPacienteRapido } from './actions';

interface FilaPacienteProps {
  paciente: any;
  estaDesplegado?: boolean;
  onToggle?: () => void;
}

export function FilaPaciente({ paciente, estaDesplegado, onToggle }: FilaPacienteProps) {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  // Funciones sanitizadoras en tiempo real
  const handleSoloLetrasInput = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
  };

  const handleSoloNumerosInput = (e: React.FormEvent<HTMLInputElement>, maxLen: number = 10) => {
    let val = e.currentTarget.value.replace(/\D/g, '');
    if (val.length > maxLen) val = val.slice(0, maxLen);
    e.currentTarget.value = val;
  };

  function handleToggleClick() {
    if (modoEdicion) setModoEdicion(false);
    if (onToggle) onToggle();
  }

  async function handleGuardarCambios(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);

    const formData = new FormData(e.currentTarget);
    const res = await actualizarPacienteRapido(formData);

    setCargando(false);

    if (res.success) {
      setMensaje({ tipo: 'exito', texto: '¡Datos actualizados correctamente!' });
      setModoEdicion(false);
      setTimeout(() => setMensaje(null), 3000);
    } else {
      setMensaje({ tipo: 'error', texto: res.error || 'Error al actualizar los datos.' });
    }
  }

  // Estilos dinámicos para los inputs según si están bloqueados o editables
  const inputClass = (modoEdicion: boolean) =>
    `w-full border rounded-lg px-2.5 py-1.5 text-xs transition-all focus:outline-none ${
      modoEdicion
        ? 'bg-white border-blue-500 text-[#0d1527] font-medium shadow-sm focus:ring-1 focus:ring-blue-500'
        : 'bg-slate-100/80 border-slate-200 text-slate-700 font-semibold cursor-not-allowed'
    }`;

  return (
    <>
      {/* FILA PRINCIPAL DE LA TABLA */}
      <tr className="hover:bg-slate-50 transition-colors border-b border-slate-200/80">
        <td className="p-4 font-medium">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleClick}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1 text-xs border border-slate-200"
              title={estaDesplegado ? 'Ocultar detalles' : 'Ver detalles'}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  estaDesplegado ? 'rotate-180 text-blue-600' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div>
              {/* NOMBRE VISIBLE EN AZUL MARINO OSCURO */}
              <p className="font-bold text-[#0d1527] text-base tracking-tight">
                {paciente.nombres} {paciente.apellidos}
              </p>
            </div>
          </div>
        </td>

        <td className="p-4 font-semibold text-slate-600">
          {paciente.cedula || 'Sin registro'}
        </td>

        <td className="p-4">
          {paciente.tiene_historia ? (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
                paciente.semaforo_color === 'rojo'
                  ? 'bg-red-50 text-red-700 border-red-300'
                  : paciente.semaforo_color === 'naranja'
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
              {paciente.semaforo_color ? paciente.semaforo_color.toUpperCase() : 'VERDE'}
            </span>
          ) : (
            <span className="text-xs text-slate-500 italic font-medium">Pendiente de historia</span>
          )}
        </td>

        <td className="p-4 text-right">
          {paciente.tiene_historia ? (
            <Link
              href={`/pacientes/${paciente.id}`}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-300 hover:border-blue-600 rounded-xl transition-all shadow-sm"
            >
              Ver Historia →
            </Link>
          ) : (
            <Link
              href={`/pacientes/${paciente.id}`}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-400 hover:border-emerald-600 rounded-xl transition-all shadow-sm"
            >
              + Aperturar Historia
            </Link>
          )}
        </td>
      </tr>

      {/* PANEL DESPLEGABLE */}
      {estaDesplegado && (
        <tr className="bg-slate-100/70 border-b border-slate-200">
          <td colSpan={4} className="p-4">
            <form onSubmit={handleGuardarCambios} className="bg-white p-5 rounded-2xl border border-slate-300/80 shadow-md space-y-4">
              <input type="hidden" name="id" value={paciente.id} />

              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0066cc]">
                    📋 Detalle del Paciente
                  </h4>
                  {modoEdicion && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                      Modo Edición
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">ID: {paciente.id}</span>
              </div>

              {mensaje && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {mensaje.texto}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                {/* Columna 1: Personales */}
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                  <p className="text-[#0d1527] font-bold border-b border-slate-200 pb-1">Datos Personales</p>
                  
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Nombres</label>
                    <input
                      type="text"
                      name="nombres"
                      defaultValue={paciente.nombres}
                      onInput={handleSoloLetrasInput}
                      readOnly={!modoEdicion}
                      required
                      className={inputClass(modoEdicion)}
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Apellidos</label>
                    <input
                      type="text"
                      name="apellidos"
                      defaultValue={paciente.apellidos}
                      onInput={handleSoloLetrasInput}
                      readOnly={!modoEdicion}
                      required
                      className={inputClass(modoEdicion)}
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Cédula</label>
                    <input
                      type="text"
                      name="cedula"
                      defaultValue={paciente.cedula || ''}
                      onInput={(e) => handleSoloNumerosInput(e, 10)}
                      maxLength={10}
                      readOnly={!modoEdicion}
                      className={inputClass(modoEdicion)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Fecha Nac.</label>
                      <input
                        type="date"
                        name="fecha_nacimiento"
                        defaultValue={paciente.fecha_nacimiento || ''}
                        readOnly={!modoEdicion}
                        className={inputClass(modoEdicion)}
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Sexo</label>
                      <select
                        name="sexo"
                        defaultValue={paciente.sexo || 'Masculino'}
                        disabled={!modoEdicion}
                        className={inputClass(modoEdicion)}
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Columna 2: Ubicación & Contacto */}
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                  <p className="text-[#0d1527] font-bold border-b border-slate-200 pb-1">Contacto & Ubicación</p>
                  
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Teléfono</label>
                    <input
                      type="text"
                      name="telefono"
                      defaultValue={paciente.telefono || ''}
                      onInput={(e) => handleSoloNumerosInput(e, 10)}
                      maxLength={10}
                      readOnly={!modoEdicion}
                      className={inputClass(modoEdicion)}
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={paciente.email || ''}
                      readOnly={!modoEdicion}
                      className={inputClass(modoEdicion)}
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Ocupación</label>
                    <input
                      type="text"
                      name="ocupacion"
                      defaultValue={paciente.ocupacion || ''}
                      readOnly={!modoEdicion}
                      className={inputClass(modoEdicion)}
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      defaultValue={paciente.direccion || ''}
                      readOnly={!modoEdicion}
                      className={inputClass(modoEdicion)}
                    />
                  </div>
                </div>

                {/* Columna 3: Emergencia */}
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <p className="text-[#0d1527] font-bold border-b border-slate-200 pb-1">Contacto de Emergencia</p>

                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Nombre</label>
                      <input
                        type="text"
                        name="contacto_emergencia_nombre"
                        defaultValue={paciente.contacto_emergencia_nombre || ''}
                        onInput={handleSoloLetrasInput}
                        readOnly={!modoEdicion}
                        className={inputClass(modoEdicion)}
                      />
                    </div>

                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Teléfono</label>
                      <input
                        type="text"
                        name="contacto_emergencia_telefono"
                        defaultValue={paciente.contacto_emergencia_telefono || ''}
                        onInput={(e) => handleSoloNumerosInput(e, 10)}
                        maxLength={10}
                        readOnly={!modoEdicion}
                        className={inputClass(modoEdicion)}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* PIE DEL DESPLEGABLE CON ACCIONES MEJORADAS */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 mt-2">
                
                {/* LADO IZQUIERDO: ELIMINAR PACIENTE */}
                <div className="p-1 rounded-xl bg-rose-50/60 border border-rose-100 hover:border-rose-300 transition-all">
                  <BotonEliminar
                    id={paciente.id}
                    nombre={`${paciente.nombres} ${paciente.apellidos}`}
                  />
                </div>

                {/* LADO DERECHO: EDITAR / GUARDAR / CANCELAR */}
                <div className="flex items-center gap-2">
                  {!modoEdicion ? (
                    <button
                      type="button"
                      onClick={() => setModoEdicion(true)}
                      className="px-4 py-2 bg-[#2B5566] hover:bg-[#1f3e4b] text-white border border-transparent rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow flex items-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Editar Ficha
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setModoEdicion(false)}
                        className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={cargando}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {cargando ? 'Guardando...' : '💾 Guardar Cambios'}
                      </button>
                    </>
                  )}
                </div>

              </div>

            </form>
          </td>
        </tr>
      )}
    </>
  );
}