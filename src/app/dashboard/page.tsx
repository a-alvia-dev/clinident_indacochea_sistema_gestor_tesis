import { createClient } from '../../lib/supabase/server';
import { redirect } from 'next/navigation';
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
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Saludo Principal */}
      <div className="border-b border-[#2B5566]/20 pb-5">
        <h1 className="text-3xl font-extrabold text-[#0d1527] tracking-tight">
          Bienvenido, {perfil?.nombre_completo || 'Doctor'} 👋
        </h1>
        <p className="text-slate-600 text-sm font-medium mt-1">
          Resumen operativo del día en Clinident Indacochea
        </p>
      </div>

      {/* Tarjetas Informativas con Borde Contraste */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pacientes */}
        <div className="bg-white p-6 rounded-2xl border border-[#2B5566]/25 shadow-md hover:shadow-lg transition-all">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Pacientes Registrados
          </p>
          <p className="text-4xl font-black text-[#0d1527] mt-3">
            {totalPacientes || 0}
          </p>
        </div>

        {/* Citas */}
        <div className="bg-white p-6 rounded-2xl border border-[#2B5566]/25 shadow-md hover:shadow-lg transition-all">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Citas de Hoy
          </p>
          <p className="text-4xl font-black text-emerald-600 mt-3">
            {citasHoy || 0}
          </p>
        </div>

        {/* Estado del Sistema */}
        <div className="bg-white p-6 rounded-2xl border border-[#2B5566]/25 shadow-md hover:shadow-lg transition-all">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Estado del Sistema
          </p>
          <div className="flex items-center gap-2.5 mt-4">
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
            <p className="text-[#0d1527] font-bold text-sm">Base de datos lista</p>
          </div>
        </div>

      </div>

      {/* Módulos de Acceso Rápido */}
      <div className="space-y-4 pt-2">
        <h2 className="text-xl font-extrabold text-[#0d1527]">Accesos Rápidos</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <Link
            href="/pacientes"
            className="p-6 bg-white hover:bg-slate-50 border border-[#2B5566]/25 hover:border-[#0d1527] rounded-2xl transition-all shadow-md hover:shadow-xl group"
          >
            <h3 className="font-bold text-lg text-[#0d1527] group-hover:text-blue-700 transition-colors">
              👥 Pacientes
            </h3>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              Registrar y consultar historias clínicas.
            </p>
          </Link>

          <Link
            href="/citas"
            className="p-6 bg-white hover:bg-slate-50 border border-[#2B5566]/25 hover:border-emerald-600 rounded-2xl transition-all shadow-md hover:shadow-xl group"
          >
            <h3 className="font-bold text-lg text-emerald-700 group-hover:translate-x-0.5 transition-transform">
              📅 Citas
            </h3>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              Agenda de atención y controles.
            </p>
          </Link>

          {(perfil?.rol === 'ADMINISTRADOR' || perfil?.rol === 'ODONTOLOGO') && (
            <Link
              href="/usuarios"
              className="p-6 bg-white hover:bg-slate-50 border border-[#2B5566]/25 hover:border-indigo-600 rounded-2xl transition-all shadow-md hover:shadow-xl group"
            >
              <h3 className="font-bold text-lg text-indigo-700 group-hover:translate-x-0.5 transition-transform">
                ⚙️ Personal y Roles
              </h3>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                Crear cuentas de recepcionistas o médicos.
              </p>
            </Link>
          )}

        </div>
      </div>

    </div>
  );
}