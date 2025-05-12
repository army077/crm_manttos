import { Edit, useAutocomplete } from "@refinedev/mui";
import { HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import {
  Box,
  TextField,
  Autocomplete,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { useEffect } from "react";

export type Contact = {
  id?: number;
  nombre_completo: string;
  correo: string;
  telefono?: string;
  foto_url?: string;
  company_id?: number;
};

export const ContactEdit: React.FC = () => {
  const {
    saveButtonProps,
    register,
    control,
    formState: { errors },
    reset,
    refineCore: { queryResult },
  } = useForm<Contact, HttpError, Contact>();

  const contacto = queryResult?.data?.data;

  const { autocompleteProps } = useAutocomplete({
    resource: "companies",
    defaultValue: contacto?.company_id,
  });

  useEffect(() => {
    if (contacto) {
      reset(contacto);
    }
  }, [contacto, reset]);

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Box component="form" sx={{ display: "flex", flexDirection: "column" }} autoComplete="off">
        <TextField
          {...register("nombre_completo", { required: "Este campo es obligatorio" })}
          error={!!errors.nombre_completo}
          helperText={errors.nombre_completo?.message}
          margin="normal"
          fullWidth
          label="Nombre completo"
        />

        <TextField
          {...register("correo", { required: "Este campo es obligatorio" })}
          error={!!errors.correo}
          helperText={errors.correo?.message}
          margin="normal"
          fullWidth
          label="Correo"
          type="email"
        />

        <TextField
          {...register("telefono")}
          margin="normal"
          fullWidth
          label="Teléfono"
        />

        <TextField
          {...register("foto_url")}
          margin="normal"
          fullWidth
          label="Foto URL"
        />

        <Controller
          control={control}
          name="company_id"
          rules={{ required: "Este campo es obligatorio" }}
          render={({ field }) => (
            <Autocomplete
              {...autocompleteProps}
              {...field}
              options={autocompleteProps.options}
              getOptionLabel={(item) => item.nombre || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, value) => field.onChange(value?.id)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Empresa"
                  margin="normal"
                  error={!!errors.company_id}
                  helperText={errors.company_id?.message}
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