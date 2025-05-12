import React from "react";
import { useList, useUpdate } from "@refinedev/core";
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
import { Box, Paper, Typography, Stack } from "@mui/material";
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

export const SalesPipelineKanban: React.FC = () => {
    const { data } = useList<Tarea>({
        resource: "sales-pipeline",
        pagination: { mode: "off" },
    });

    const { mutate } = useUpdate();
    const tareas = data?.data || [];

    const grouped = columnas.map((etapa) => ({
        etapa,
        tareas: tareas.filter((t) => t.etapa === etapa),
    }));

    const handleDragEnd = (event: DragEndEvent) => {
        const taskId = parseInt(event.active.id as string, 10);
        const destino = event.over?.id as string;

        console.log("Dragged from:", taskId);
        console.log("Dropped on:", destino);

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
                description: `Se movió a ${destino}`,
            },
        });
    };

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Stack direction="row" spacing={2} alignItems="flex-start" p={2}>
                {grouped.map((col) => (
                    <KanbanColumn key={col.etapa} etapa={col.etapa} tareas={col.tareas} />
                ))}
            </Stack>
        </DndContext>
    );
};

const KanbanCard = ({ tarea }: { tarea: Tarea }) => (
    <Paper
        elevation={2}
        sx={{ p: 2, backgroundColor: "#fff" }}
        id={tarea.id.toString()}
    >
        <Typography variant="subtitle1" fontWeight="bold">
            {tarea.titulo}
        </Typography>
        <Typography variant="body2" color="text.secondary">
            {tarea.descripcion}
        </Typography>
        {tarea.fecha_vencimiento && (
            <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                {new Date(tarea.fecha_vencimiento).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                })}
            </Typography>
        )}
    </Paper>
);

const KanbanColumn = ({
    etapa,
    tareas,
}: {
    etapa: Tarea["etapa"];
    tareas: Tarea[];
}) => {
    const { setNodeRef, isOver } = useDroppable({ id: etapa });

    return (
        <Box
            ref={setNodeRef}
            sx={{
                width: 280,
                background: isOver ? "#dceefb" : "#f3f3f3",
                p: 1,
                borderRadius: 2,
                minHeight: 400,
                border: isOver ? "2px dashed #007bff" : "2px dashed transparent",
                transition: "all 0.2s ease-in-out",
            }}
        >
            <Typography variant="h6" gutterBottom>
                {etapa}
            </Typography>

            <SortableContext
                id={etapa}
                items={tareas.map((t) => t.id.toString())}
                strategy={verticalListSortingStrategy}
            >
                <Stack spacing={1}>
                    {tareas.map((t) => (
                        <DraggableKanbanItem key={t.id} id={t.id.toString()}>
                            <KanbanCard tarea={t} />
                        </DraggableKanbanItem>
                    ))}
                </Stack>
            </SortableContext>
        </Box>
    );
};