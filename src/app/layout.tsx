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
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-slate-900 text-slate-100 flex h-screen overflow-hidden antialiased`}>
        
        {/* Sidebar Fijo Completo */}
        <Sidebar />

        {/* Área Principal del Sistema */}
        <main className="flex-1 bg-slate-900 overflow-y-auto h-screen p-6 md:p-10">
          {children}
        </main>

      </body>
    </html>
  );
}