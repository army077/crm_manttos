import { Edit } from "@refinedev/mui";
import { HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import {
  Box,
  TextField,
  Autocomplete,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { useEffect } from "react";

type Tarea = {
  id?: number;
  titulo: string;
  descripcion: string;
  fecha_vencimiento: string;
  etapa: "TODO" | "IN PROGRESS" | "IN REVIEW" | "DONE";
};

export const PostEdit: React.FC = () => {
  const {
    saveButtonProps,
    register,
    control,
    formState: { errors },
    reset,
    refineCore: { queryResult }, // ✅ forma correcta y actual
  } = useForm<Tarea, HttpError, Tarea>();

  const tarea = queryResult?.data?.data;

  useEffect(() => {
    if (tarea) {
      reset({
        ...tarea,
        fecha_vencimiento: new Date(tarea.fecha_vencimiento).toISOString().slice(0, 16),
      });
    }
  }, [tarea, reset]);

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        <TextField
          {...register("titulo", {
            required: "Este campo es obligatorio",
          })}
          error={!!errors.titulo}
          helperText={errors.titulo?.message}
          margin="normal"
          fullWidth
          label="Título"
        />

        <TextField
          {...register("descripcion", {
            required: "Este campo es obligatorio",
          })}
          error={!!errors.descripcion}
          helperText={errors.descripcion?.message}
          margin="normal"
          label="Descripción"
          multiline
          rows={3}
        />

        <Controller
          control={control}
          name="fecha_vencimiento"
          rules={{ required: "Este campo es obligatorio" }}
          render={({ field }) => (
            <TextField
              {...field}
              type="datetime-local"
              label="Fecha de Vencimiento"
              margin="normal"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.fecha_vencimiento}
              helperText={errors.fecha_vencimiento?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="etapa"
          rules={{ required: "Este campo es obligatorio" }}
          render={({ field }) => (
            <Autocomplete
              options={["TODO", "IN PROGRESS", "IN REVIEW", "DONE"]}
              getOptionLabel={(option) => option}
              value={field.value || ""}
              onChange={(_, value) => field.onChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Etapa"
                  margin="normal"
                  error={!!errors.etapa}
                  helperText={errors.etapa?.message}
                  required
                />
              )}
            />
          )}
        />
      </Box>
    </Edit>
  );
};