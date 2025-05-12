import { EditButton, List, useDataGrid } from "@refinedev/mui";
import React from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import moment from "moment";

type Tarea = {
  id: number;
  titulo: string;
  descripcion: string;
  etapa: "TODO" | "IN PROGRESS" | "IN REVIEW" | "DONE";
  fecha_vencimiento: string;
};

export const PostList: React.FC = () => {
  const { dataGridProps } = useDataGrid<Tarea>();

  const columns = React.useMemo<GridColDef<Tarea>[]>(
    () => [
      { field: "id", headerName: "ID", width: 70 },
      { field: "titulo", headerName: "Título", flex: 1, minWidth: 200 },
      { field: "descripcion", headerName: "Descripción", flex: 2, minWidth: 250 },
      {
        field: "etapa",
        headerName: "Etapa",
        width: 150,
        valueFormatter: ({ value }) => {
          switch (value) {
            case "IN REVIEW":
              return "En revisión";
            case "IN PROGRESS":
              return "En progreso";
            case "COMPLETED":
              return "Completada";
            default:
              return value;
          }
        },
      },
      {
        field: "fecha_vencimiento",
        headerName: "Vence",
        flex: 2,
        width: 220,
        renderCell: ({ value }) => {
          const fechaFormateada = new Date(value).toLocaleString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true, // o false si prefieres 24h
          });
          return fechaFormateada;
        },
      },
      {
        field: "actions",
        headerName: "Acciones",
        renderCell: function render({ row }) {
          return <EditButton hideText recordItemId={row.id} />;
        },
        align: "center",
        headerAlign: "center",
        minWidth: 100,
      },
    ],
    [],
  );

  return (
    <List>
      <div style={{ height: 600, width: "100%" }}>
        <DataGrid {...dataGridProps} columns={columns} autoHeight />
      </div>
    </List>
  );
};