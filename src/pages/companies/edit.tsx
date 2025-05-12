// src/pages/companies/edit.tsx
import { Edit } from "@refinedev/mui";
import { HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { Box, TextField } from "@mui/material";

type Empresa = {
  id?: number;
  nombre: string;
  direccion?: string;
  industria?: string;
};

export const CompanyEdit: React.FC = () => {
  const {
    saveButtonProps,
    register,
    formState: { errors },
  } = useForm<Empresa, HttpError, Empresa>();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Box component="form" sx={{ display: "flex", flexDirection: "column" }} autoComplete="off">
        <TextField
          {...register("nombre", { required: "Este campo es obligatorio" })}
          error={!!errors.nombre}
          helperText={errors.nombre?.message}
          margin="normal"
          fullWidth
          label="Nombre de la empresa"
        />

        <TextField
          {...register("direccion")}
          error={!!errors.direccion}
          helperText={errors.direccion?.message}
          margin="normal"
          fullWidth
          label="Dirección"
        />

        <TextField
          {...register("industria")}
          error={!!errors.industria}
          helperText={errors.industria?.message}
          margin="normal"
          fullWidth
          label="Industria"
        />
      </Box>
    </Edit>
  );
};