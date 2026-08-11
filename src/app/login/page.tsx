'use client';

import { useState, useTransition } from 'react';
import { loginAction } from './actions';

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result && !result.success) {
        setErrorMessage(result.error || 'Ocurrió un error al iniciar sesión');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-clinident-niebla p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-clinident-denim/20">
        
        {/* LOGO Y TÍTULO */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-clinident-real tracking-tight">Clinident</h1>
          <p className="text-xs font-bold text-clinident-denim uppercase tracking-wider mt-1">
            Gestión Odontológica Indacochea
          </p>
        </div>

        {/* MENSAJE DE ERROR */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 text-xs font-semibold text-center animate-fade-in">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-clinident-real mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="doctor@clinident.com"
              className="w-full px-4 py-3 bg-clinident-relajado/30 border border-clinident-denim/30 rounded-2xl text-slate-800 placeholder-clinident-denim/60 focus:outline-none focus:border-clinident-real focus:bg-white transition-all text-sm shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-clinident-real mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-clinident-relajado/30 border border-clinident-denim/30 rounded-2xl text-slate-800 placeholder-clinident-denim/60 focus:outline-none focus:border-clinident-real focus:bg-white transition-all text-sm shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 bg-clinident-real hover:bg-[#1e3b47] font-semibold rounded-2xl text-white transition-all shadow-xl shadow-clinident-real/20 disabled:opacity-50 text-sm tracking-wide mt-2 active:scale-[0.99]"
          >
            {isPending ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
          </button>
        </form>

      </div>
    </div>
  );
}