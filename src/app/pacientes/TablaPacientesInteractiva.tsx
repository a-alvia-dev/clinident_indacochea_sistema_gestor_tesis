'use client';

import { useState, useRef, useEffect } from 'react';
import { FilaPaciente } from './FilaPaciente';

interface TablaPacientesProps {
  pacientesIniciales: any[];
}

export function TablaPacientesInteractiva({ pacientesIniciales }: TablaPacientesProps) {
  const [busqueda, setBusqueda] = useState('');
  
  // Referencia para dar foco automático al buscador
  const inputBusquedaRef = useRef<HTMLInputElement>(null);

  // Focus automático al montar el componente
  useEffect(() => {
    inputBusquedaRef.current?.focus();
  }, []);

  // Guardamos el ID del paciente que está abierto actualmente (null si todos están cerrados)
  const [pacienteAbiertoId, setPacienteAbiertoId] = useState<string | null>(null);

  const handleTogglePaciente = (id: string) => {
    // Si se hace clic en el que ya está abierto, se cierra. Si no, se abre el nuevo y se cierra el anterior.
    setPacienteAbiertoId((prevId) => (prevId === id ? null : id));
  };

  // Filtra en memoria instantáneamente sin recargar la página ni perder el foco
  const pacientesFiltrados = pacientesIniciales.filter((paciente) => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;

    const nombreCompleto = `${paciente.nombres || ''} ${paciente.apellidos || ''}`.toLowerCase();
    const cedula = paciente.cedula || '';

    return nombreCompleto.includes(termino) || cedula.includes(termino);
  });

  return (
    <div className="space-y-6">
      {/* Buscador Ultra Fluido */}
      <div className="max-w-md">
        <input
          ref={inputBusquedaRef}
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, apellido o cédula..."
          autoFocus
          className="w-full px-4 py-2.5 bg-white border border-slate-300/80 rounded-xl text-[#0d1527] placeholder-slate-400 focus:outline-none focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all font-medium"
        />
      </div>

      {/* Tabla de Pacientes */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0d1527] text-white text-xs font-bold uppercase tracking-wider">
              <th className="p-4">Paciente</th>
              <th className="p-4">Cédula</th>
              <th className="p-4">Estado / Semáforo</th>
              <th className="p-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-800">
            {pacientesFiltrados.length > 0 ? (
              pacientesFiltrados.map((paciente: any) => (
                <FilaPaciente
                  key={paciente.id}
                  paciente={paciente}
                  estaDesplegado={pacienteAbiertoId === paciente.id}
                  onToggle={() => handleTogglePaciente(paciente.id)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-10 text-center text-slate-500 text-sm font-medium italic">
                  {busqueda ? `No se encontraron resultados para "${busqueda}".` : 'No hay pacientes registrados aún.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}