import { List, useDataGrid, EditButton } from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React from "react";

interface Contact {
  id: number;
  nombre_completo: string;
  correo: string;
  telefono?: string;
  foto_url?: string;
  company_id?: number;
  company_nombre?: string; // Asegúrate de incluir este campo desde la API si quieres mostrar el nombre
}

export const ContactList: React.FC = () => {
  const { dataGridProps } = useDataGrid<Contact>();

  const columns = React.useMemo<GridColDef<Contact>[]>(
    () => [
      { field: "id", headerName: "ID", width: 70 },
      { field: "nombre_completo", headerName: "Nombre completo", flex: 1, minWidth: 200 },
      { field: "correo", headerName: "Correo", flex: 1, minWidth: 200 },
      { field: "telefono", headerName: "Teléfono", flex: 1, minWidth: 150 },
      { field: "empresa_nombre", headerName: "Empresa", flex: 1, minWidth: 150 },
      {
        field: "actions",
        headerName: "Acciones",
        renderCell: ({ row }) => <EditButton hideText recordItemId={row.id} />,
        align: "center",
        headerAlign: "center",
        minWidth: 100,
      },
    ],
    []
  );

  return (
    <List>
      <div style={{ height: 600, width: "100%" }}>
        <DataGrid {...dataGridProps} columns={columns} autoHeight />
      </div>
    </List>
  );
};