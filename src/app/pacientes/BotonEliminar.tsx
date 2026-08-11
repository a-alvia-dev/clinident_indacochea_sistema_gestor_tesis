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
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 p-1.5 rounded-xl shadow-sm">
        {/* TEXTO AJUSTADO A RED-700 FONT-BOLD PARA ALTO CONTRASTE */}
        <span className="text-xs text-red-700 font-bold pl-1">
          ¿Eliminar a {nombre.split(' ')[0]}?
        </span>
        
        <button
          type="button"
          onClick={handleEliminar}
          disabled={isPending}
          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
        >
          {isPending ? 'Borrando...' : 'Sí, eliminar'}
        </button>
        
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          disabled={isPending}
          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
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
        className="p-2 text-xs font-medium text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl transition-all flex items-center justify-center shadow-sm"
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
        <span className="text-[11px] text-red-600 font-bold animate-pulse">
          ⚠️ {errorMsg}
        </span>
      )}
    </div>
  );
}