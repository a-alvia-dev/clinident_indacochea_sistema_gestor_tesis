import { createClient } from '../../lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Verificar sesión
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Obtener perfil
  const { data: perfil } = await supabase
    .from('usuarios_perfiles')
    .select('nombre_completo, rol')
    .eq('id', user.id)
    .single();

  // 3. Conteo de métricas
  const { count: totalPacientes } = await supabase
    .from('pacientes')
    .select('*', { count: 'exact', head: true });

  const { count: citasHoy } = await supabase
    .from('citas')
    .select('*', { count: 'exact', head: true })
    .gte('fecha_hora_inicio', new Date().toISOString().split('T')[0]);

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Navegación Lateral */}
      <Sidebar
        usuarioNombre={perfil?.nombre_completo || 'Doctor'}
        usuarioRol={perfil?.rol || 'ODONTOLOGO'}
      />

      {/* Contenido Principal */}
      <main className="flex-1 p-8 text-slate-100 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="border-b border-slate-800 pb-5">
            <h1 className="text-3xl font-bold">
              Bienvenido, {perfil?.nombre_completo || 'Doctor'} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Resumen operativo del día en Clinident Indacochea
            </p>
          </div>

          {/* Tarjetas Informativas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md">
              <p className="text-sm font-medium text-slate-400">Pacientes Registrados</p>
              <p className="text-4xl font-extrabold text-blue-400 mt-2">{totalPacientes || 0}</p>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md">
              <p className="text-sm font-medium text-slate-400">Citas de Hoy</p>
              <p className="text-4xl font-extrabold text-emerald-400 mt-2">{citasHoy || 0}</p>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md">
              <p className="text-sm font-medium text-slate-400">Estado del Sistema</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-slate-200 font-semibold text-sm">Base de datos lista</p>
              </div>
            </div>
          </div>

          {/* Módulos de Acceso Rápido */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Accesos Rápidos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/pacientes"
                className="p-5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-blue-500 rounded-xl transition-all"
              >
                <h3 className="font-semibold text-lg text-blue-400">👥 Pacientes</h3>
                <p className="text-sm text-slate-400 mt-1">Registrar y consultar historias clínicas.</p>
              </Link>

              <Link
                href="/citas"
                className="p-5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500 rounded-xl transition-all"
              >
                <h3 className="font-semibold text-lg text-emerald-400">📅 Citas</h3>
                <p className="text-sm text-slate-400 mt-1">Agenda de atención y controles.</p>
              </Link>

              {(perfil?.rol === 'ADMINISTRADOR' || perfil?.rol === 'ODONTOLOGO') && (
                <Link
                  href="/usuarios"
                  className="p-5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-purple-500 rounded-xl transition-all"
                >
                  <h3 className="font-semibold text-lg text-purple-400">⚙️ Personal y Roles</h3>
                  <p className="text-sm text-slate-400 mt-1">Crear cuentas de recepcionistas o médicos.</p>
                </Link>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}