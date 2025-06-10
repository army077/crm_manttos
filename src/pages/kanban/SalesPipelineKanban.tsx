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
  Tooltip,
  Divider,
} from "@mui/material";
import { DraggableKanbanItem } from "./DraggableKanbanItem";
import { TaskDetailsModal } from "./TaskDetailModel";
import { CreateTaskDialog } from "./CreateTaskDialog";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const columnas: Etapa[] = ["INBOX", "NEGOCIACION", "APARTADO", "PAGADO", "FINALIZADO", "STANDBY", "DESCARTADO"];

const etapaColors: Record<Etapa, string> = {
  INBOX: "#f5f5f5",
  NEGOCIACION: "#e3f2fd",
  APARTADO: "#fff8e1",
  PAGADO: "#e8f5e9",
  FINALIZADO: "#e0f7fa",
  STANDBY: "#f3e5f5",
  DESCARTADO: "#ffebee",
};

const etapaTitles: Record<Etapa, string> = {
  INBOX: "INBOX",
  NEGOCIACION: "NEGOCIACIÓN",
  APARTADO: "APARTADO",
  PAGADO: "PAGADO",
  FINALIZADO: "FINALIZADO",
  STANDBY: "STANDBY",
  DESCARTADO: "DESCARTADO",
};

const etapaEtiquetas: Record<Etapa, string[]> = {
  INBOX: ["C/Pendientes", "Sin fecha"],
  NEGOCIACION: ["Contactado", "Cotizado", "Aceptado", "Sin fecha"],
  APARTADO: ["Aceptado", "C/Fecha", "Reagendado", "Cancelado"],
  PAGADO: ["Confirmado", "Sin confirmar", "Reagendado"],
  FINALIZADO: ["C/Pendientes", "S/Pendientes"],
  STANDBY: ["Pagado", "No pagado"],
  DESCARTADO: ["Precio alto", "Máquina revendida", "No contestó", "No usa la máquina", "Inconforme"],
};

const ScrollableContent = styled(CardContent)(({ theme }) => ({
  maxHeight: "calc(100vh - 200px)",
  overflowY: "auto",
  padding: theme.spacing(1),
  minHeight: 100,
  "&::-webkit-scrollbar": {
    width: 6,
  },
  "&::-webkit-scrollbar-track": {
    background: theme.palette.grey[200],
    borderRadius: 3,
  },
  "&::-webkit-scrollbar-thumb": {
    background: theme.palette.grey[400],
    borderRadius: 3,
  },
}));

const ColumnHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1, 2),
}));

export const SalesPipelineKanban: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { data, refetch } = useList<Tarea>({
    resource: "sales-pipeline",
    pagination: { mode: "off" },
  });
  const { mutate: updateTask } = useUpdate();
  const { mutate: createTask } = useCreate();
  const tareas = data?.data || [];

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
        refetch();
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

  return (
    <Box sx={{ p: 2, height: "100%" }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Sales Pipeline
      </Typography>
      
      <Box sx={{ overflowX: "auto", pb: 2 }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={2}
            alignItems="flex-start"
            sx={{ minWidth: isMobile ? "100%" : "max-content" }}
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
          </Stack>
        </DndContext>
      </Box>

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
    </Box>
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
        width: mobile ? "100%" : 320,
        backgroundColor: theme.palette.background.default,
        border: isOver
          ? `2px dashed ${theme.palette.primary.main}`
          : `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      elevation={isOver ? 6 : 0}
    >
      <ColumnHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              {etapaTitles[etapa]}
            </Typography>
            <Badge 
              badgeContent={tareas.length} 
              color="default"
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: etapaColors[etapa],
                  color: theme.palette.getContrastText(etapaColors[etapa]),
                }
              }}
            />
          </Stack>
        }
        action={
          <Tooltip title="Añadir tarea">
            <IconButton 
              size="small" 
              onClick={() => onAddTask(etapa)}
              sx={{
                backgroundColor: etapaColors[etapa],
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                }
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
        sx={{
          backgroundColor: etapaColors[etapa],
          transition: "background-color 0.2s ease",
        }}
      />
      <Divider />
      <ScrollableContent>
        <SortableContext
          items={tareas.map((t) => t.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <Stack spacing={1.5}>
            {tareas.map((t) => (
              <DraggableKanbanItem key={t.id} id={t.id.toString()}>
                <KanbanCard tarea={t} onClick={() => onCardClick(t)} />
              </DraggableKanbanItem>
            ))}
            {tareas.length === 0 && (
              <Box
                sx={{
                  p: 2,
                  textAlign: "center",
                  color: theme.palette.text.secondary,
                  border: `1px dashed ${theme.palette.divider}`,
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2">No hay tareas</Typography>
              </Box>
            )}
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
  const theme = useTheme();
  const dueDate = tarea.fecha_vencimiento
    ? new Date(tarea.fecha_vencimiento)
    : null;
  const isOverdue =
    dueDate && dueDate.getTime() < Date.now() && tarea.etapa !== "FINALIZADO";

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        boxShadow: theme.shadows[1],
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": { 
          boxShadow: theme.shadows[4],
          transform: "translateY(-2px)",
        },
        borderLeft: isOverdue 
          ? `4px solid ${theme.palette.error.main}`
          : `4px solid ${theme.palette.success.main}`,
      }}
      onClick={onClick}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Typography 
          variant="subtitle2" 
          fontWeight={600}
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {tarea.titulo}
        </Typography>
        <MoreHorizIcon fontSize="small" color="action" />
      </Stack>
      
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          mt: 0.5,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {tarea.descripcion}
      </Typography>
      
      {(tarea.etiquetas ?? []).length > 0 && (
        <Box sx={{ mt: 1.5, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {(tarea.etiquetas ?? []).map((etiqueta) => (
            <Chip
              key={etiqueta}
              label={etiqueta}
              size="small"
              sx={{
                fontSize: '0.6rem',
                height: 20,
                backgroundColor: getTagColor(etiqueta),
                color: 'white',
                borderRadius: 1,
              }}
            />
          ))}
        </Box>
      )}
      
      {dueDate && (
        <Box sx={{ mt: 1.5, display: "flex", alignItems: "center" }}>
          <Typography
            variant="caption"
            sx={{ 
              color: isOverdue ? theme.palette.error.main : theme.palette.text.secondary,
              fontWeight: isOverdue ? 600 : 400,
            }}
          >
            {dueDate.toLocaleDateString("es-MX", {
              day: "numeric",
              month: "short",
            })}
            {isOverdue && " • Atrasada"}
          </Typography>
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
    "S/Pendientes": "#cddc39",
    "Pagado": "#7cb342",
    "No pagado": "#e53935",
    "Precio alto": "#ef5350",
    "Maquina revendida": "#6d4c41",
    "No contestó": "#9e9e9e",
    "No usa la maquina": "#bdbdbd",
    "Inconforme": "#c62828",
  };
  return tagColors[tag] || "#9e9e9e";
}