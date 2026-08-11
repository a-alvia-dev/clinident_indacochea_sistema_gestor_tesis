'use client';

import { useState, useTransition } from 'react';
import { eliminarPacienteAction } from './actions';

export function BotonEliminar({ id, nombre }: { id: string; nombre: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirmando, setConfirmando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEliminar = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await eliminarPacienteAction(id);
      if (!res.success) {
        setErrorMsg(res.error || 'Error al eliminar');
        setConfirmando(false);
      }
    });
  };

  // Si el usuario hace clic en el tacho, mostramos la confirmación integradita
  if (confirmando) {
    return (
      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 p-1.5 rounded-xl">
        <span className="text-[11px] text-red-300 font-medium pl-1">
          ¿Eliminar a {nombre.split(' ')[0]}?
        </span>
        <button
          type="button"
          onClick={handleEliminar}
          disabled={isPending}
          className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[11px] font-bold transition-colors disabled:opacity-50"
        >
          {isPending ? 'Borrando...' : 'Sí, eliminar'}
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          disabled={isPending}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] transition-colors"
        >
          Cancelar
        </button>
      </div>
    );
  }

  // Estado normal (Botón icono de tacho)
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        title="Eliminar paciente"
        className="p-2 text-xs font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 rounded-xl transition-colors flex items-center justify-center"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>

      {errorMsg && (
        <span className="text-[11px] text-red-400 font-medium animate-pulse">
          ⚠️ {errorMsg}
        </span>
      )}
    </div>
  );
}