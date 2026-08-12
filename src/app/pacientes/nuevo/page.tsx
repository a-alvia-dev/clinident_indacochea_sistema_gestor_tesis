'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { crearPacienteAction } from '../actions';

export default function NuevoPacientePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const primerInputRef = useRef<HTMLInputElement>(null);

  // Autofocus en el campo Nombres al cargar la página
  useEffect(() => {
    primerInputRef.current?.focus();
  }, []);

  // Manejo de la tecla Enter para saltar al siguiente campo
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      // Si el foco está en un botón o link de cancelar, permitimos el comportamiento normal
      if (target.tagName === 'BUTTON' || target.tagName === 'A') return;

      e.preventDefault(); // Evita el submit prematuro

      const form = e.currentTarget;
      const focusableElements = Array.from(
        form.querySelectorAll<HTMLElement>('input:not([disabled]), select:not([disabled]), button:not([disabled])')
      );
      
      const currentIndex = focusableElements.indexOf(target);
      if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
        focusableElements[currentIndex + 1].focus();
      }
    }
  };

  // Validaciones en tiempo real y bocadillos en español
  const handleInputValidation = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    input.setCustomValidity(''); // Resetea el error anterior

    const name = input.name;
    const value = input.value;

    // Validación Cédula/DNI
    if (name === 'cedula') {
      const soloNumeros = value.replace(/\D/g, '');
      if (value !== soloNumeros) {
        input.value = soloNumeros;
      }
      if (input.value.length < 10) {
        input.setCustomValidity('La cédula o DNI debe contener exactamente 10 dígitos.');
      }
    }

    // Validación Nombres, Apellidos y Contacto Emergencia
    if (['nombres', 'apellidos', 'contacto_emergencia_nombre'].includes(name)) {
      const soloLetras = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
      if (value !== soloLetras) {
        input.value = soloLetras;
        input.setCustomValidity('Este campo solo permite letras y espacios.');
      }
    }

    // Validación Teléfonos
    if (['telefono', 'contacto_emergencia_telefono'].includes(name)) {
      const soloNumeros = value.replace(/\D/g, '');
      if (value !== soloNumeros) {
        input.value = soloNumeros;
      }
      if (name === 'telefono' && input.value.length < 9) {
        input.setCustomValidity('Ingresa un número de teléfono válido (mínimo 9 dígitos).');
      }
    }
  };

  const handleInvalid = (e: React.FormEvent<HTMLInputElement | HTMLSelectElement>) => {
    const input = e.currentTarget;
    if (input.validity.valueMissing) {
      input.setCustomValidity('Completa este campo para continuar.');
    } else if (input.validity.typeMismatch && input.type === 'email') {
      input.setCustomValidity('Ingresa un correo electrónico válido (ej. usuario@dominio.com).');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await crearPacienteAction(formData);
      if (res.success) {
        router.push('/pacientes');
      } else {
        // En caso de error de servidor, se lo asignamos al input de Cédula como alerta en diálogo nativo
        const cedulaInput = e.currentTarget.querySelector<HTMLInputElement>('input[name="cedula"]');
        if (cedulaInput) {
          cedulaInput.setCustomValidity(res.error || 'Error al guardar el paciente en el sistema.');
          cedulaInput.reportValidity();
        }
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Volver & Encabezado */}
      <div>
        <Link 
          href="/pacientes" 
          className="text-slate-500 hover:text-[#2B5566] font-semibold text-sm transition-colors inline-flex items-center gap-1 mb-2"
        >
          ← Volver a Pacientes
        </Link>
        <h1 className="text-3xl font-extrabold text-[#0d1527] tracking-tight">
          Registrar Nuevo Paciente
        </h1>
        <p className="text-slate-600 text-sm font-medium mt-1">
          Ingresa la información personal y de contacto para aperturar la ficha clínica.
        </p>
      </div>

      {/* Formulario en Tarjeta Blanca Limpia */}
      <form 
        onSubmit={handleSubmit} 
        onKeyDown={handleKeyDown}
        className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-md space-y-8"
      >
        
        {/* 1. DATOS PERSONALES */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-2 h-2 rounded-full bg-[#0284c7]"></span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0284c7]">
              1. Datos Personales
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombres *
              </label>
              <input
                ref={primerInputRef}
                type="text"
                name="nombres"
                placeholder="Ej. Juan Carlos"
                required
                onInput={handleInputValidation}
                onInvalid={handleInvalid}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Apellidos *
              </label>
              <input
                type="text"
                name="apellidos"
                placeholder="Ej. Pérez Gómez"
                required
                onInput={handleInputValidation}
                onInvalid={handleInvalid}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cédula / DNI *
              </label>
              <input
                type="text"
                name="cedula"
                maxLength={10}
                placeholder="Ej. 0912345678"
                required
                onInput={handleInputValidation}
                onInvalid={handleInvalid}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                name="fecha_nacimiento"
                required
                onInvalid={handleInvalid}
                onChange={(e) => e.currentTarget.setCustomValidity('')}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Sexo Biológico *
              </label>
              <select
                name="sexo"
                defaultValue="Masculino"
                required
                onInvalid={handleInvalid}
                onChange={(e) => e.currentTarget.setCustomValidity('')}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ocupación
              </label>
              <input
                type="text"
                name="ocupacion"
                placeholder="Ej. Estudiante, Chofer, Ingeniero"
                onInput={handleInputValidation}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* 2. UBICACIÓN Y CONTACTO */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-2 h-2 rounded-full bg-[#0284c7]"></span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0284c7]">
              2. Ubicación y Contacto
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Teléfono Móvil *
              </label>
              <input
                type="text"
                name="telefono"
                maxLength={10}
                placeholder="Ej. 0991234567"
                required
                onInput={handleInputValidation}
                onInvalid={handleInvalid}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                placeholder="ejemplo@correo.com"
                onInput={(e) => e.currentTarget.setCustomValidity('')}
                onInvalid={handleInvalid}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Dirección de Domicilio
              </label>
              <input
                type="text"
                name="direccion"
                placeholder="Ej. Av. Principal y Calle Secundaria"
                onInput={(e) => e.currentTarget.setCustomValidity('')}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* 3. CONTACTO DE EMERGENCIA */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-2 h-2 rounded-full bg-[#0284c7]"></span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0284c7]">
              3. Contacto de Emergencia
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombre del Contacto
              </label>
              <input
                type="text"
                name="contacto_emergencia_nombre"
                placeholder="Ej. María Gómez (Familiar)"
                onInput={handleInputValidation}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Teléfono de Emergencia
              </label>
              <input
                type="text"
                name="contacto_emergencia_telefono"
                maxLength={10}
                placeholder="Ej. 0987654321"
                onInput={handleInputValidation}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-300/80 rounded-xl text-[#0d1527] font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2B5566] focus:ring-1 focus:ring-[#2B5566] text-sm shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200/80">
          <Link
            href="/pacientes"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-slate-700 transition-colors text-sm"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 bg-[#2B5566] hover:bg-[#1f3e4b] font-bold rounded-xl text-white transition-all disabled:opacity-50 text-sm shadow-sm hover:shadow-md inline-flex items-center gap-2"
          >
            {isPending ? 'Guardando...' : 'Guardar Paciente'}
          </button>
        </div>

      </form>
    </div>
  );
}