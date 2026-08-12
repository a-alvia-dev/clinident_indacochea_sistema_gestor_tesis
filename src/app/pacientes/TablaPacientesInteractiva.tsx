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
    setPacienteAbiertoId((prevId) => (prevId === id ? null : id));
  };

  // Filtra en memoria instantáneamente
  const pacientesFiltrados = pacientesIniciales.filter((paciente) => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;

    const nombreCompleto = `${paciente.nombres || ''} ${paciente.apellidos || ''}`.toLowerCase();
    const cedula = paciente.cedula || '';

    return nombreCompleto.includes(termino) || cedula.includes(termino);
  });

  return (
    <div className="space-y-6">
      {/* Buscador Ultra Fluido con Ícono de Lupa */}
      <div className="max-w-md relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputBusquedaRef}
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, apellido o cédula..."
          autoFocus
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300/80 rounded-xl text-[#0d1527] placeholder-slate-400 focus:outline-none focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all font-medium"
        />
      </div>

      {/* Tabla de Pacientes */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0d1527] text-white text-xs font-bold uppercase tracking-wider">
              <th className="p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Paciente</span>
                </div>
              </th>
              <th className="p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 014 0" />
                  </svg>
                  <span>Cédula</span>
                </div>
              </th>
              <th className="p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Estado / Semáforo</span>
                </div>
              </th>
              <th className="p-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Acción</span>
                </div>
              </th>
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