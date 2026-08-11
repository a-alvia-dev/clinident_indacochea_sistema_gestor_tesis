'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';

// 1. Reordenamos NAV_LINKS siguiendo el flujo clínico lógico
const NAV_LINKS = [
  { name: '📊 Dashboard', href: '/dashboard' },
  { name: '👥 Pacientes', href: '/pacientes' },
  { name: '🦷 Tratamientos', href: '/tratamientos' }, // 👈 Posición optimizada (Capa Clínica)
  { name: '📅 Citas y Agenda', href: '/citas' },       // 👈 Posición optimizada (Capa Operativa)
  { name: '💳 Pagos y Cajas', href: '#' },
  { name: '⚙️ Gestión de Personal', href: '/usuarios' },
] as const;

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // 🛑 Si la ruta actual es /login, no mostramos el Sidebar
  if (pathname === '/login') {
    return null;
  }

  const handleCerrarSesion = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 bg-[#0d1527] border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen shadow-xl">
      <div className="p-6 space-y-8">
        {/* Logo e Identidad */}
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Clinident</h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">Gestión Odontológica</p>
        </div>

        {/* Menú de Navegación */}
        <nav className="space-y-2">
          {NAV_LINKS.map((link) => {
            // Verificamos si la ruta activa coincide exactamente o es una subruta (ej: /tratamientos/1)
            const isActive = link.href !== '#' && (pathname === link.href || pathname.startsWith(`${link.href}/`));
            const isPlaceholder = link.href === '#';

            return (
              <Link
                key={link.name}
                href={link.href}
                prefetch={!isPlaceholder}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#1b2a47] text-white shadow-sm border border-slate-700/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Pie del Sidebar: Botón de Logout */}
      <div className="p-6 border-t border-slate-800/80 space-y-4 bg-black/20">
        <button
          onClick={handleCerrarSesion}
          type="button"
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium transition-colors"
        >
          🚪 Cerrar Sesión
        </button>
        <p className="text-[11px] font-medium text-slate-500 text-center">Clinident Indacochea v1.0</p>
      </div>
    </aside>
  );
}

// ⚡ React.memo evita re-renderizar el Sidebar si las props/rutas no le afectan
export default memo(Sidebar);