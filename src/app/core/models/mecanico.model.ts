export type EstadoMecanico = 'disponible' | 'ocupado' | 'no_disponible';

export const TEXTO_ESTADO: Record<EstadoMecanico, string> = {
  disponible: 'Disponible',
  ocupado: 'En servicio / Ocupado',
  no_disponible: 'Fuera de servicio',
};

export const AYUDA_ESTADO: Record<EstadoMecanico, string> = {
  disponible: 'Apareces en el mapa y puedes recibir solicitudes de auxilio.',
  ocupado: 'Estás atendiendo un servicio actualmente.',
  no_disponible: 'No recibirás alertas ni aparecerás en las búsquedas.',
};

export interface DatosPerfilMecanico {
  nombreTaller: string;
  descripcion?: string;
  zonaTrabajo?: string;
  telefono: string;
  direccion: string;
  latitud: number;
  longitud: number;
  estado?: EstadoMecanico;
}

export interface PerfilMecanico extends DatosPerfilMecanico {
  id: string;
  userId: string;
  calificacionPromedio: number;
  calificacion?: number;
  totalResenas: number;
  activo: boolean;
}