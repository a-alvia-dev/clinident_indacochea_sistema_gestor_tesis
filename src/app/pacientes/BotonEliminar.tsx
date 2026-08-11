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
      onClick={handleEliminar}
      disabled={isPending}
      className="px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 rounded-lg transition-colors disabled:opacity-50"
    >
      {isPending ? '...' : 'Eliminar'}
    </button>
  );
}