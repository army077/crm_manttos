// src/types.ts
export type Etapa =
  | "INBOX"
  | "NEGOCIACION"
  | "APARTADO"
  | "PAGADO"
  | "FINALIZADO"
  | "STANDBY"
  | "DESCARTADO";

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