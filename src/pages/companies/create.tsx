import { Create } from "@refinedev/mui";
import { HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { Box, TextField } from "@mui/material";

type Cliente = {
  id?: number;
  nombre: string;
  direccion?: string;
  industria?: string;
};

export const CompanyCreate: React.FC = () => {
  const {
    saveButtonProps,
    register,
    formState: { errors },
  } = useForm<Cliente, HttpError, Cliente>();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Box component="form" sx={{ display: "flex", flexDirection: "column" }} autoComplete="off">
        <TextField
          {...register("nombre", { required: "Este campo es obligatorio" })}
          error={!!errors.nombre}
          helperText={errors.nombre?.message}
          margin="normal"
          fullWidth
          label="Nombre de la empresa"
        />
        <TextField {...register("direccion")} label="Dirección" margin="normal" fullWidth />
        <TextField {...register("industria")} label="Industria" margin="normal" fullWidth />
      </Box>
    </Create>
  );
};