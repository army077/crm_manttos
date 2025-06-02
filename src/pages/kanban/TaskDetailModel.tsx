import React from "react";
import type { Tarea, Etapa } from "../../entidades/tarea";
import { useUpdate } from "@refinedev/core";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Stack,
  Box,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import {
  Delete as DeleteIcon,
} from "@mui/icons-material";

interface TaskDetailsModalProps {
  open: boolean;
  onClose: () => void;
  tarea: Tarea;
  onUpdate: (updatedTask: Tarea) => void;
  onDelete: (id: number) => void;
  availableEtapas: string[];
  availableTags: string[];
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  open,
  onClose,
  tarea,
  onUpdate,
  onDelete,
  availableEtapas,
  availableTags,
}) => {
  const { mutate: updateTask } = useUpdate();
  // Inicializa etiquetas siempre como array aunque venga undefined
  const [editedTask, setEditedTask] = React.useState<Tarea>({
    ...tarea,
    etiquetas: tarea.etiquetas ?? [],
    checklist: tarea.checklist ?? [],
    prioridad: tarea.prioridad || "media",
  });
  const [newTagInput, setNewTagInput] = React.useState("");

  const updateTagsInDatabase = (updatedTags: string[]) => {
    updateTask({
      resource: "sales-pipeline",
      id: editedTask.id,
      values: { ...editedTask, etiquetas: updatedTags },
      successNotification: {
        type: "success",
        message: "Etiquetas actualizadas",
      },
    });
    onUpdate({ ...editedTask, etiquetas: updatedTags });
  };

  const handleAddTag = (newTag: string) => {
    if (newTag.trim() && !editedTask.etiquetas!.includes(newTag)) {
      const updatedTags = [...editedTask.etiquetas!, newTag];
      setEditedTask(prev => ({ ...prev, etiquetas: updatedTags }));
      updateTagsInDatabase(updatedTags);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = (editedTask.etiquetas ?? []).filter(tag => tag !== tagToRemove);
    setEditedTask(prev => ({ ...prev, etiquetas: updatedTags }));
    updateTagsInDatabase(updatedTags);
  };

  const handleSave = () => {
    onUpdate(editedTask);
    onClose();
  };

  const getTagColor = (tag: string) => {
    const tagColors: Record<string, string> = {
      "C/Pendientes": "#ff5252",
      "Sin fecha": "#9e9e9e",
      "Contactado": "#4caf50",
      "Cotizado": "#2196f3",
      "Aceptado": "#8bc34a",
      "C/Fecha": "#ff9800",
      "Reagendado": "#ff5722",
      "Cancelado": "#f44336",
      "Confirmado": "#4caf50",
      "Sin confirmar": "#ff9800",
      "Pagado": "#4caf50",
      "No pagado": "#f44336",
      "Precio alto": "#9c27b0",
      "Falta de atención": "#607d8b",
      "No contestó": "#795548",
      "No usa la maquina": "#9e9e9e",
      "Maquina revendida": "#673ab7",
      "S/Pendientes": "#cddc39",
    };
    return tagColors[tag] || "#9e9e9e";
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <TextField
            fullWidth
            value={editedTask.titulo}
            onChange={(e) => setEditedTask({ ...editedTask, titulo: e.target.value })}
            variant="standard"
            InputProps={{ style: { fontSize: "1.5rem", fontWeight: "bold" } }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Etapa</InputLabel>
            <Select
              value={editedTask.etapa}
              onChange={(e) => setEditedTask({ ...editedTask, etapa: e.target.value as Etapa })}
              label="Etapa"
            >
              {availableEtapas.map((etapa) => (
                <MenuItem key={etapa} value={etapa}>
                  {etapa}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Descripción
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={editedTask.descripcion}
                onChange={(e) => setEditedTask({ ...editedTask, descripcion: e.target.value })}
                placeholder="Añadir descripción..."
              />
            </Box>

            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Etiquetas
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                options={availableTags}
                value={editedTask.etiquetas ?? []}
                onChange={(_, newValue) => {
                  setEditedTask({ ...editedTask, etiquetas: newValue });
                  updateTagsInDatabase(newValue);
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option}
                      label={option}
                      size="small"
                      onDelete={() => handleRemoveTag(option)}
                      sx={{
                        backgroundColor: getTagColor(option),
                        color: "white",
                        margin: "2px",
                      }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Añadir etiquetas..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newTagInput.trim()) {
                        handleAddTag(newTagInput);
                        setNewTagInput("");
                        e.preventDefault();
                      }
                    }}
                  />
                )}
              />
            </Box>

            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Fecha de Vencimiento
              </Typography>
              <TextField
                type="date"
                fullWidth
                value={editedTask.fecha_vencimiento || ""}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, fecha_vencimiento: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Grid>

          <Grid item xs={4}>
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                Acciones
              </Typography>
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                variant="outlined"
                onClick={() => {
                  onDelete(editedTask.id);
                  onClose();
                }}
              >
                Eliminar Tarea
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
};
