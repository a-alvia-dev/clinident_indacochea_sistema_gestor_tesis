'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { eliminarPacienteAction } from './actions';

interface BotonEliminarProps {
  id: string;
  nombre: string;
}

export function BotonEliminar({ id, nombre }: BotonEliminarProps) {
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [modalExito, setModalExito] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function handleConfirmarEliminar() {
    setCargando(true);
    setError(null);

    const res = await eliminarPacienteAction(id);

    setCargando(false);

    if (res.success) {
      setModalConfirmacion(false);
      setModalExito(true);

      // Cierra automáticamente tras 2 segundos y refresca la vista
      setTimeout(() => {
        setModalExito(false);
        router.refresh();
      }, 2000);
    } else {
      setError(res.error || 'Ocurrió un error al intentar eliminar el paciente.');
    }
  }

  return (
    <>
      {/* BOTÓN DISPARADOR */}
      <button
        type="button"
        onClick={() => setModalConfirmacion(true)}
        className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs rounded-lg border border-rose-300 transition-colors flex items-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Eliminar Paciente
      </button>

      {/* MODAL 1: CONFIRMACIÓN PREVIA */}
      {modalConfirmacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-[28px] p-8 max-w-sm w-full shadow-2xl text-center space-y-4">
            {/* Ícono Rojo Advertencia / Papelera */}
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 text-rose-500 flex items-center justify-center border-2 border-rose-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>

            <div>
              <h3 className="text-2xl font-black text-[#0d1527] tracking-tight">
                ¿Eliminar Paciente?
              </h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                ¿Estás seguro de eliminar a <span className="font-bold text-slate-700">{nombre}</span>? Esta acción borrará sus datos del sistema.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalConfirmacion(false)}
                disabled={cargando}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminar}
                disabled={cargando}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md disabled:opacity-50"
              >
                {cargando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ÉXITO EXACTO AL DE LA IMAGEN */}
      {modalExito && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-[28px] p-8 max-w-sm w-full shadow-2xl text-center space-y-4">
            
            {/* Ícono Círculo Blanco con Borde Verde y Check Verde */}
            <div className="w-16 h-16 mx-auto rounded-full bg-white text-emerald-500 flex items-center justify-center border-2 border-emerald-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Título y Mensaje */}
            <div>
              <h3 className="text-2xl font-black text-[#0d1527] tracking-tight">
                ¡Paciente Eliminado!
              </h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Los datos del paciente se eliminaron correctamente del sistema.
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}