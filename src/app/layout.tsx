import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from '../components/Sidebar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Clinident - Gestión Odontológica',
  description: 'Sistema de Gestión Clínico y Clasificación Odontológica',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-clinident-niebla text-slate-800 flex h-screen overflow-hidden antialiased select-none`}>
        
        {/* Sidebar Fijo Completo */}
        <Sidebar />

        {/* Área Principal del Sistema 
            - flex-1: Ocupa todo el espacio sobrante horizontal.
            - min-w-0: OBLIGATORIO para evitar que el contenido pise al Sidebar.
            - h-full + overflow-y-auto: Genera scroll suave solo en la zona blanca/gris.
        */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-6 md:p-10">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>

      </body>
    </html>
  );
}