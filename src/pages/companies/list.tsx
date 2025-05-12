import { List, useDataGrid, EditButton } from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React from "react";

interface Company {
  id: number;
  nombre: string;
  direccion?: string;
  industria?: string;
}

export const CompanyList: React.FC = () => {
  const { dataGridProps } = useDataGrid<Company>();

  const columns = React.useMemo<GridColDef<Company>[]>(
    () => [
      { field: "id", headerName: "ID", width: 70 },
      { field: "nombre", headerName: "Nombre", flex: 1, minWidth: 150 },
      { field: "direccion", headerName: "Dirección", flex: 1, minWidth: 200 },
      { field: "industria", headerName: "Industria", flex: 1, minWidth: 150 },
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