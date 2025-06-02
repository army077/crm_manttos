import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  IconButton
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import type { Etapa } from "../../entidades/tarea";

export interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    titulo: string;
    descripcion: string;
    etapa: Etapa;
    etiquetas: string[];
  }) => void;
  defaultEtapa: Etapa;
  availableEtapas: Etapa[];
  availableTags: string[];
}

export const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  open,
  onClose,
  onCreate,
  defaultEtapa,
  availableEtapas,
  availableTags,
}) => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [etapa, setEtapa] = useState<Etapa>(defaultEtapa);
  const [etiquetas, setEtiquetas] = useState<string[]>([]);

  const handleSubmit = () => {
    if (titulo.trim() === "") return;
    onCreate({ titulo, descripcion, etapa, etiquetas });
    setTitulo("");
    setDescripcion("");
    setEtapa(defaultEtapa);
    setEtiquetas([]);
    onClose();
  };

  const handleClose = () => {
    setTitulo("");
    setDescripcion("");
    setEtapa(defaultEtapa);
    setEtiquetas([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Nueva Tarea
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <TextField
            autoFocus
            fullWidth
            label="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            multiline
            rows={2}
          />
          <FormControl fullWidth>
            <InputLabel>Etapa</InputLabel>
            <Select
              value={etapa}
              label="Etapa"
              onChange={(e) => setEtapa(e.target.value as Etapa)}
            >
              {availableEtapas.map((etapa) => (
                <MenuItem key={etapa} value={etapa}>
                  {etapa}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Autocomplete
            multiple
            freeSolo
            options={availableTags}
            value={etiquetas}
            onChange={(_, newValue) => setEtiquetas(newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option}
                  size="small"
                  sx={{
                    backgroundColor: "#607d8b",
                    color: "white",
                  }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Etiquetas" placeholder="Agregar..." />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={titulo.trim() === ""}
        >
          Crear Tarea
        </Button>
      </DialogActions>
    </Dialog>
  );
};
