import React, { useState } from "react";
import { useList, useUpdate, useCreate } from "@refinedev/core";
import type { Tarea, Etapa } from "../../entidades/tarea";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Stack,
  Badge,
  IconButton,
  useTheme,
  styled,
  useMediaQuery,
  Chip,
} from "@mui/material";
import { DraggableKanbanItem } from "./DraggableKanbanItem";
import { TaskDetailsModal } from "./TaskDetailModel";
import { CreateTaskDialog } from "./CreateTaskDialog";
import AddIcon from "@mui/icons-material/Add";

const columnas: Etapa[] = ["INBOX", "NEGOCIACION", "APARTADO", "PAGADO", "FINALIZADO"];

const etapaColors: Record<Etapa, string> = {
  INBOX: "#f0f0f0",
  NEGOCIACION: "#e3f2fd",
  APARTADO: "#fff3e0",
  PAGADO: "#e8f5e9",
  FINALIZADO: "#e0f7fa",
};

const etapaTitles: Record<Etapa, string> = {
  INBOX: "INBOX",
  NEGOCIACION: "NEGOCIACION",
  APARTADO: "APARTADO",
  PAGADO: "PAGADO O CON OC (CREDITO)",
  FINALIZADO: "FINALIZADO",
};

const etapaEtiquetas: Record<Etapa, string[]> = {
  INBOX: ["C/Pendientes", "Sin fecha"],
  NEGOCIACION: ["Contactado", "Cotizado", "Aceptado", "Sin fecha"],
  APARTADO: ["Aceptado", "C/Fecha", "Reagendado", "Cancelado"],
  PAGADO: ["Confirmado", "Sin confirmar", "Reagendado"],
  FINALIZADO: ["C/Pendientes", "S/Pendientes"],
};

const ScrollableContent = styled(CardContent)(({ theme }) => ({
  maxHeight: 500,
  overflowY: "auto",
  padding: theme.spacing(1),
  minHeight: 100,
}));

export const SalesPipelineKanban: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { data, refetch } = useList<Tarea>({
    resource: "sales-pipeline",
    pagination: { mode: "off" },
  });
  const { mutate: updateTask } = useUpdate();
  const { mutate: createTask } = useCreate();
  const tareas = data?.data || [];

  // Estado para el diálogo de creación
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [etapaToCreate, setEtapaToCreate] = useState<Etapa>("INBOX");

  const [selectedTask, setSelectedTask] = useState<Tarea | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const taskId = parseInt(event.active.id as string, 10);
    const destino = event.over?.id as Etapa;
    if (!destino || !columnas.includes(destino)) return;

    const tarea = tareas.find((t) => t.id === taskId);
    if (!tarea || tarea.etapa === destino) return;

    updateTask({
      resource: "sales-pipeline",
      id: tarea.id,
      values: { ...tarea, etapa: destino },
      successNotification: {
        type: "success",
        message: "Tarea actualizada",
        description: `Movida a ${destino}`,
      },
    });
  };

  const handleOpenDetails = (tarea: Tarea) => {
    setSelectedTask(tarea);
    setModalOpen(true);
  };

  const handleCloseDetails = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  const handleUpdateTask = (updatedTask: Tarea) => {
    updateTask({
      resource: "sales-pipeline",
      id: updatedTask.id,
      values: updatedTask,
      successNotification: {
        type: "success",
        message: "Tarea actualizada",
      },
    }, {
      onSuccess: () => {
        refetch(); // Refresca la lista tras guardar
      }
    });
  };

  const handleDeleteTask = (id: number) => {
    updateTask({
      resource: "sales-pipeline",
      id,
      values: { ...tareas.find(t => t.id === id), deleted: true },
      successNotification: {
        type: "success",
        message: "Tarea eliminada",
      },
      mutationMode: "pessimistic"
    });
    handleCloseDetails();
  };

  // -------- MODAL BONITO --------
  const handleAddTask = (etapa: Etapa) => {
    setEtapaToCreate(etapa);
    setCreateDialogOpen(true);
  };

  const handleCreateTask = ({
    titulo,
    descripcion,
    etapa,
    etiquetas,
  }: {
    titulo: string;
    descripcion: string;
    etapa: Etapa;
    etiquetas: string[];
  }) => {
    createTask({
      resource: "sales-pipeline",
      values: {
        titulo,
        descripcion,
        etapa,
        etiquetas,
        checklist: [],
        prioridad: "media",
        fecha_creacion: new Date().toISOString(),
      },
      successNotification: {
        type: "success",
        message: "Tarea creada",
      },
    });
  };

  // ---------------------------------

  const getTagColor = (tag: string) => {
    const tagColors: Record<string, string> = {
      "C/Pendientes": "#ff5252",
      "Sin fecha": "#9e9e9e",
      "Contactado": "#4caf50",
      "Cotizado": "#2196f3",
      "Aceptado": "#8bc34a",
      "C/Fecha": "#ff9800",
      "Reagendado": "#ff5722",
      "Cancelado": "#f44336",
      "Confirmado": "#4caf50",
      "Sin confirmar": "#ff9800",
      "S/Pendientes": "#cddc39"
    };
    return tagColors[tag] || "#9e9e9e";
  };

  return (
    <>
      <Box sx={{ p: 1 }}>
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={2}
          alignItems="flex-start"
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {columnas.map((etapa) => {
              const columnTasks = tareas.filter((t) => t.etapa === etapa);
              return (
                <KanbanColumn
                  key={etapa}
                  etapa={etapa}
                  tareas={columnTasks}
                  onCardClick={handleOpenDetails}
                  onAddTask={handleAddTask}
                  mobile={isMobile}
                />
              );
            })}
          </DndContext>
        </Stack>
      </Box>

      {/* MODAL DE CREACIÓN */}
      <CreateTaskDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreateTask}
        defaultEtapa={etapaToCreate}
        availableEtapas={columnas}
        availableTags={Object.values(etapaEtiquetas).flat()}
      />

      {selectedTask && (
        <TaskDetailsModal
          open={modalOpen}
          onClose={handleCloseDetails}
          tarea={{
            ...selectedTask,
            etiquetas: selectedTask.etiquetas ?? [],
          }}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          availableEtapas={columnas}
          availableTags={etapaEtiquetas[selectedTask.etapa] || []}
        />
      )}
    </>
  );
};

const KanbanColumn = ({
  etapa,
  tareas,
  onCardClick,
  onAddTask,
  mobile,
}: {
  etapa: Etapa;
  tareas: Tarea[];
  onCardClick: (t: Tarea) => void;
  onAddTask: (etapa: Etapa) => void;
  mobile: boolean;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: etapa });
  const theme = useTheme();

  return (
    <Card
      ref={setNodeRef}
      sx={{
        width: mobile ? "90vw" : 300,
        backgroundColor: etapaColors[etapa],
        border: isOver
          ? `2px dashed ${theme.palette.primary.main}`
          : "2px dashed transparent",
      }}
      elevation={isOver ? 6 : 2}
    >
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6">{etapaTitles[etapa]}</Typography>
            <Badge badgeContent={tareas.length} color="primary" />
          </Stack>
        }
        action={
          <IconButton size="small" onClick={() => onAddTask(etapa)}>
            <AddIcon />
          </IconButton>
        }
        sx={{ pb: 0 }}
      />
      <ScrollableContent>
        <SortableContext
          items={tareas.map((t) => t.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <Stack spacing={1}>
            {tareas.map((t) => (
              <DraggableKanbanItem key={t.id} id={t.id.toString()}>
                <KanbanCard tarea={t} onClick={() => onCardClick(t)} />
              </DraggableKanbanItem>
            ))}
          </Stack>
        </SortableContext>
      </ScrollableContent>
    </Card>
  );
};

const KanbanCard = ({
  tarea,
  onClick,
}: {
  tarea: Tarea;
  onClick: () => void;
}) => {
  const dueDate = tarea.fecha_vencimiento
    ? new Date(tarea.fecha_vencimiento)
    : null;
  const isOverdue =
    dueDate && dueDate.getTime() < Date.now() && tarea.etapa !== "FINALIZADO";

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: "#fff",
        borderRadius: 2,
        boxShadow: 1,
        cursor: "pointer",
        "&:hover": { boxShadow: 4 },
        opacity: isOverdue ? 0.7 : 1,
        borderLeft: isOverdue ? "4px solid red" : "4px solid transparent",
      }}
      onClick={onClick}
    >
      <Typography variant="subtitle1" fontWeight="bold">
        {tarea.titulo}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        {tarea.descripcion}
      </Typography>
      {dueDate && (
        <Typography
          variant="caption"
          sx={{ mt: 1, display: "block", color: isOverdue ? "red" : "inherit" }}
        >
          {dueDate.toLocaleDateString("es-MX", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
          {isOverdue && " • Atrasada"}
        </Typography>
      )}
      {(tarea.etiquetas ?? []).length > 0 && (
        <Box sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {(tarea.etiquetas ?? []).map((etiqueta) => (
            <Chip
              key={etiqueta}
              label={etiqueta}
              size="small"
              sx={{
                fontSize: '0.65rem',
                height: 20,
                backgroundColor: getTagColor(etiqueta),
                color: 'white'
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

function getTagColor(tag: string): string {
  const tagColors: Record<string, string> = {
    "C/Pendientes": "#ff5252",
    "Sin fecha": "#9e9e9e",
    "Contactado": "#4caf50",
    "Cotizado": "#2196f3",
    "Aceptado": "#8bc34a",
    "C/Fecha": "#ff9800",
    "Reagendado": "#ff5722",
    "Cancelado": "#f44336",
    "Confirmado": "#4caf50",
    "Sin confirmar": "#ff9800",
    "S/Pendientes": "#cddc39"
  };
  return tagColors[tag] || "#9e9e9e";
}
