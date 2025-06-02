// src/types.ts
export type Etapa = "INBOX" | "NEGOCIACION" | "APARTADO" | "PAGADO" | "FINALIZADO";

export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  etapa: Etapa;
  etiquetas?: string[]; // Permite undefined
  fecha_vencimiento?: string;
  fecha_creacion?: string;
  prioridad?: "alta" | "media" | "baja";
  checklist?: { id: number; texto: string; completado: boolean }[];
}
