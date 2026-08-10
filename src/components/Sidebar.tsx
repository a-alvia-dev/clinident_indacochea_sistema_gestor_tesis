'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '../app/login/logout-action';

interface SidebarProps {
  usuarioNombre: string;
  usuarioRol: string;
}

export default function Sidebar({ usuarioNombre, usuarioRol }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: '📊 Dashboard', href: '/dashboard' },
    { label: '👥 Pacientes', href: '/pacientes' },
    { label: '📅 Citas y Agenda', href: '/citas' },
    { label: '🦷 Tratamientos', href: '/tratamientos' },
    { label: '💳 Pagos y Cajas', href: '/pagos' },
  ];

  // Si el usuario es ADMINISTRADOR u ODONTOLOGO principal, mostramos el menú de usuarios
  const esAdmin = usuarioRol === 'ADMINISTRADOR' || usuarioRol === 'ODONTOLOGO';
  if (esAdmin) {
    menuItems.push({ label: '⚙️ Gestión de Personal', href: '/usuarios' });
  }

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 min-h-screen flex flex-col justify-between p-4 text-slate-200 shrink-0">
      <div className="space-y-6">
        {/* Logo / Nombre de la clínica */}
        <div className="px-2 pt-2">
          <h1 className="text-2xl font-bold text-blue-400">Clinident</h1>
          <p className="text-xs text-slate-400">Gestión Odontológica</p>
        </div>

        {/* Menú de Navegación */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Usuario actual y Logout */}
      <div className="border-t border-slate-700 pt-4 space-y-3">
        <div className="px-2">
          <p className="text-sm font-semibold text-slate-100 truncate">{usuarioNombre}</p>
          <p className="text-xs text-blue-400 font-mono uppercase">{usuarioRol}</p>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full text-left px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors border border-red-500/20"
          >
            🚪 Cerrar Sesión
          </button>
        </form>
      </div>
    </aside>
  );
}