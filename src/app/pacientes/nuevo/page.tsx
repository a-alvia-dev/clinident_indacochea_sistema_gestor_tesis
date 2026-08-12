'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { crearPacienteAction } from '../actions';

export default function NuevoPacientePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const primerInputRef = useRef<HTMLInputElement>(null);

  // Autofocus en el campo Nombres al cargar la página
  useEffect(() => {
    primerInputRef.current?.focus();
  }, []);

  // Manejo de la tecla Enter para saltar al siguiente campo
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.tagName === 'TEXTAREA') return;

      e.preventDefault();

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

  // Validaciones en tiempo real
  const handleInputValidation = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    input.setCustomValidity('');

    const name = input.name;
    const value = input.value;

    if (name === 'cedula') {
      const soloNumeros = value.replace(/\D/g, '');
      if (value !== soloNumeros) {
        input.value = soloNumeros;
      }
      if (input.value.length < 10) {
        input.setCustomValidity('La cédula o DNI debe contener exactamente 10 dígitos.');
      }
    }

    if (['nombres', 'apellidos', 'contacto_emergencia_nombre'].includes(name)) {
      const soloLetras = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
      if (value !== soloLetras) {
        input.value = soloLetras;
        input.setCustomValidity('Este campo solo permite letras y espacios.');
      }
    }

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
        setMostrarModalExito(true);
        setTimeout(() => {
          router.push('/pacientes');
        }, 2000);
      } else {
        const cedulaInput = e.currentTarget.querySelector<HTMLInputElement>('input[name="cedula"]');
        if (cedulaInput) {
          cedulaInput.setCustomValidity(res.error || 'Error al guardar el paciente en el sistema.');
          cedulaInput.reportValidity();
        }
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      
      {/* Volver & Encabezado estilizado */}
      <div>
        <Link 
          href="/pacientes" 
          className="text-slate-500 hover:text-[#2B5566] font-semibold text-sm transition-colors inline-flex items-center gap-1.5 mb-3 group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver a Pacientes
        </Link>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#2B5566]/10 text-[#2B5566] rounded-2xl">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#0d1527] tracking-tight">
              Registrar Nuevo Paciente
            </h1>
            <p className="text-slate-600 text-sm font-medium mt-0.5">
              Ingresa la información personal y de contacto para aperturar la ficha clínica.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario en Tarjeta Blanca Limpia */}
      <form 
        onSubmit={handleSubmit} 
        onKeyDown={handleKeyDown}
        className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-md space-y-8"
      >
        
        {/* 1. DATOS PERSONALES */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
            <div className="p-1.5 bg-[#0284c7]/10 text-[#0284c7] rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
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
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
            <div className="p-1.5 bg-[#0284c7]/10 text-[#0284c7] rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
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
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
            <div className="p-1.5 bg-[#0284c7]/10 text-[#0284c7] rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
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

        {/* BOTONES DE ACCIÓN CON ÍCONOS */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200/80">
          <Link
            href="/pacientes"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-slate-700 transition-colors text-sm flex items-center gap-1.5"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 bg-[#2B5566] hover:bg-[#1f3e4b] font-bold rounded-xl text-white transition-all disabled:opacity-50 text-sm shadow-sm hover:shadow-md inline-flex items-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Guardar Paciente
              </>
            )}
          </button>
        </div>

      </form>

      {/* MODAL DE ÉXITO */}
      {mostrarModalExito && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center space-y-6 transform animate-scaleUp">
            
            {/* Ícono de Check Verde Identico */}
            <div className="w-20 h-20 mx-auto rounded-full border-[3px] border-emerald-500 flex items-center justify-center text-emerald-500">
              <svg 
                className="w-10 h-10 stroke-current" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="2.5"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            {/* Texto y Mensaje */}
            <div className="space-y-2 pb-2">
              <h3 className="text-2xl font-black text-[#0d1527] tracking-tight">
                ¡Paciente Registrado!
              </h3>
              <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto">
                Los datos personales y de contacto se guardaron correctamente en el sistema.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}