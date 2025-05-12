import { Create, useAutocomplete } from "@refinedev/mui";
import { HttpError, useOne } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { useWatch } from "react-hook-form";
import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";

type Tarea = {
  id?: number;
  titulo: string;
  descripcion: string;
  fecha_vencimiento: string;
  etapa: "TODO" | "IN PROGRESS" | "IN REVIEW" | "DONE";
  company_id?: number;
  contact_id?: number;
};

export const PostCreate: React.FC = () => {
  const {
    saveButtonProps,
    register,
    control,
    formState: { errors },
  } = useForm<Tarea, HttpError, Tarea>();

  const companyId = useWatch({ control, name: "company_id" });

  const { autocompleteProps: companyAutocompleteProps } = useAutocomplete({
    resource: "companies",
  });

  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  useEffect(() => {
    if (!companyId) {
      setFilteredContacts([]);
      return;
    }

    const fetchContacts = async () => {
      setLoadingContacts(true);
      try {
        const response = await fetch(
          `https://desarrollotecnologicoar.com/api9/contacts?company_id=${companyId}`
        );
        const data = await response.json();
        setFilteredContacts(data);
      } catch (error) {
        console.error("Error al cargar contactos:", error);
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchContacts();
  }, [companyId]);

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Box component="form" sx={{ display: "flex", flexDirection: "column" }} autoComplete="off">
        <TextField
          {...register("titulo", { required: "Este campo es obligatorio" })}
          error={!!errors.titulo}
          helperText={errors.titulo?.message}
          margin="normal"
          fullWidth
          label="Título"
        />

        <TextField
          {...register("descripcion", { required: "Este campo es obligatorio" })}
          error={!!errors.descripcion}
          helperText={errors.descripcion?.message}
          margin="normal"
          label="Descripción"
          multiline
          rows={3}
        />

        <TextField
          {...register("fecha_vencimiento", { required: "Este campo es obligatorio" })}
          error={!!errors.fecha_vencimiento}
          helperText={errors.fecha_vencimiento?.message}
          margin="normal"
          fullWidth
          label="Fecha de Vencimiento"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
        />

        <Controller
          control={control}
          name="etapa"
          rules={{ required: "Este campo es obligatorio" }}
          render={({ field }) => (
            <Autocomplete
              options={["TODO", "IN PROGRESS", "IN REVIEW", "DONE"]}
              getOptionLabel={(option) => option}
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

        {/* Empresa */}
        <Controller
          control={control}
          name="company_id"
          rules={{ required: "Este campo es obligatorio" }}
          render={({ field }) => (
            <Autocomplete
              {...companyAutocompleteProps}
              options={companyAutocompleteProps.options}
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

        {/* Contacto filtrado por empresa */}
        <Controller
          control={control}
          name="contact_id"
          rules={{ required: "Este campo es obligatorio" }}
          render={({ field }) => (
            <Autocomplete
              options={filteredContacts}
              loading={loadingContacts}
              getOptionLabel={(item) => item.nombre_completo || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, value) => field.onChange(value?.id)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Contacto"
                  margin="normal"
                  error={!!errors.contact_id}
                  helperText={errors.contact_id?.message}
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingContacts ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          )}
        />
      </Box>
    </Create>
  );
};