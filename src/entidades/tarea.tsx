// entidades/tarea.ts
export type Etapa = "INBOX" | "NEGOCIACION" | "APARTADO" | "PAGADO" | "FINALIZADO";
export type Prioridad = "alta" | "media" | "baja";

export interface ChecklistItem {
  id: number;
  texto: string;
  completado: boolean;
}

export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  etapa: Etapa;
  fecha_vencimiento?: string;
  fecha_creacion?: string;
  etiquetas: string[];
  prioridad: Prioridad;
  checklist: ChecklistItem[];
  deleted?: boolean;
}