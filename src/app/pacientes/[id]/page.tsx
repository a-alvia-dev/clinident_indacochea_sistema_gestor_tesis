import Link from 'next/link';
import { obtenerPacientePorId, obtenerHistoriaClinicaPorPaciente } from '../actions';
import DetallePacienteClient from './DetallePacienteClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetallePacientePage({ params }: PageProps) {
  const { id } = await params;

  // Carga directa en el Servidor (sin useEffect ni spinners de "cargando")
  const [paciente, historia] = await Promise.all([
    obtenerPacientePorId(id),
    obtenerHistoriaClinicaPorPaciente(id),
  ]);

  if (!paciente) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-red-500 font-medium">
        Paciente no encontrado. <br />
        <Link href="/pacientes" className="text-[#0284c7] underline mt-2 inline-block">
          Volver a la lista
        </Link>
      </div>
    );
  }

  return <DetallePacienteClient paciente={paciente} historiaInicial={historia} id={id} />;
}