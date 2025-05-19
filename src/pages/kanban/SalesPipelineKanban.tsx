import React from "react";
import { useList, useUpdate, useDelete } from "@refinedev/core";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Stack,
  Badge,
  useTheme,
  styled,
  IconButton,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { DraggableKanbanItem } from "./DraggableKanbanItem";

type Etapa = "TODO" | "IN PROGRESS" | "IN REVIEW" | "DONE";

type Tarea = {
  id: number;
  titulo: string;
  descripcion: string;
  etapa: Etapa;
  fecha_vencimiento?: string;
  fecha_creacion?: string;
};

const columnas: Etapa[] = ["TODO", "IN PROGRESS", "IN REVIEW", "DONE"];

// Colores por etapa
const etapaColors: Record<Etapa, string> = {
  TODO: "#f0f0f0",
  "IN PROGRESS": "#e3f2fd",
  "IN REVIEW": "#fff3e0",
  DONE: "#e8f5e9",
};

const ScrollableContent = styled(CardContent)({
  maxHeight: 500,
  overflowY: "auto",
  padding: "8px",
});

export const SalesPipelineKanban: React.FC = () => {
  const { data } = useList<Tarea>({
    resource: "sales-pipeline",
    pagination: { mode: "off" },
  });
  const { mutate } = useUpdate();
  const { mutate: deleteMutate } = useDelete();
  const tareas = data?.data || [];

  const grouped = columnas.map((etapa) => ({
    etapa,
    tareas: tareas.filter((t) => t.etapa === etapa),
  }));

  const handleDragEnd = (event: DragEndEvent) => {
    const taskId = parseInt(event.active.id as string, 10);
    const destino = event.over?.id as string;
    if (!destino || !columnas.includes(destino as Etapa)) return;

    const tarea = tareas.find((t) => t.id === taskId);
    if (!tarea || tarea.etapa === destino) return;

    mutate({
      resource: "sales-pipeline",
      id: tarea.id,
      values: { ...tarea, etapa: destino as Etapa },
      successNotification: {
        type: "success",
        message: "Tarea actualizada",
        description: `Movida a ${destino}`,
      },
    });
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <Stack direction="row" spacing={2} alignItems="flex-start" p={1}>
        {grouped.map((col) => (
          <KanbanColumn
            key={col.etapa}
            etapa={col.etapa}
            tareas={col.tareas}
            onDelete={(id) =>
              deleteMutate({
                resource: "sales-pipeline",
                id,
                mutationMode: "undoable",
                successNotification: {
                  type: "success",
                  message: "Tarea eliminada",
                },
              })
            }
          />
        ))}
      </Stack>
    </DndContext>
  );
};

const KanbanColumn = ({
  etapa,
  tareas,
  onDelete,
}: {
  etapa: Tarea["etapa"];
  tareas: Tarea[];
  onDelete: (id: number) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: etapa });
  const theme = useTheme();

  return (
    <Card
      ref={setNodeRef}
      sx={{
        width: 300,
        backgroundColor: etapaColors[etapa],
        border: isOver
          ? `2px dashed ${theme.palette.primary.main}`
          : "2px dashed transparent",
        transition: "all 0.2s",
      }}
      elevation={isOver ? 6 : 2}
    >
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6">{etapa}</Typography>
            <Badge
            style={{ marginLeft: '30%' }}
              badgeContent={tareas.length}
              color={tareas.length > 0 ? "primary" : "default"}
            />
          </Stack>
        }
        sx={{ pb: 0 }}
      />
      <ScrollableContent>
        <SortableContext
          id={etapa}
          items={tareas.map((t) => t.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <Stack spacing={1}>
            {tareas.map((t) => (
              <DraggableKanbanItem key={t.id} id={t.id.toString()}>
                <KanbanCard tarea={t} onDelete={onDelete} />
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
  onDelete,
}: {
  tarea: Tarea;
  onDelete: (id: number) => void;
}) => {
  const dueDate = tarea.fecha_vencimiento
    ? new Date(tarea.fecha_vencimiento)
    : null;
  const isOverdue =
    dueDate && dueDate.getTime() < Date.now() && tarea.etapa !== "DONE";

  return (
    <Box
      sx={{
        position: 'relative',
        p: 2,
        backgroundColor: "#fff",
        borderRadius: 2,
        boxShadow: 1,
        cursor: "grab",
        "&:hover": { boxShadow: 4 },
        opacity: isOverdue ? 0.7 : 1,
        borderLeft: isOverdue ? "4px solid red" : "4px solid transparent",
      }}
      id={tarea.id.toString()}
    >
      <IconButton
        size="small"
        onClick={() => onDelete(tarea.id)}
        sx={{ position: 'absolute', top: 4, right: 4 }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>

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
    </Box>
  );
};
