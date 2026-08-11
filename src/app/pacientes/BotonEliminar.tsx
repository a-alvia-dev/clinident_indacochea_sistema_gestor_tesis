'use client';

import { useTransition } from 'react';
import { eliminarPacienteAction } from './actions';

export function BotonEliminar({ id, nombre }: { id: string; nombre: string }) {
  const [isPending, startTransition] = useTransition();

  const handleEliminar = () => {
    if (confirm(`¿Estás seguro de eliminar a ${nombre}? Esta acción borrará también sus datos asociados.`)) {
      startTransition(async () => {
        const res = await eliminarPacienteAction(id);
        if (!res.success) {
          alert('Error al eliminar: ' + res.error);
        }
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleEliminar}
      disabled={isPending}
      title="Eliminar paciente"
      className="p-2 text-xs font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
    >
      {isPending ? (
        <span className="animate-pulse">...</span>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      )}
    </button>
  );
}