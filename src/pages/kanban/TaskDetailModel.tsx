import React from "react";
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
  Checkbox,
  FormControlLabel,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Badge,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Label as LabelIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  CalendarToday as CalendarTodayIcon,
  AttachFile as AttachFileIcon,
  CropOriginal as CropOriginalIcon,
  ViewHeadline as ViewHeadlineIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { Autocomplete } from '@mui/material';

interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  etapa: string;
  etiquetas?: string[];
  fecha_vencimiento?: string;
  fecha_creacion?: string;
  prioridad?: "alta" | "media" | "baja";
  checklist?: { id: number; texto: string; completado: boolean }[];
}

interface TaskDetailsModalProps {
  open: boolean;
  onClose: () => void;
  tarea: Tarea;
  onDelete: (id: number) => void;
  availableEtapas: string[];
  availableTags: string[];
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ 
  open, 
  onClose, 
  tarea, 
  onDelete,
  availableEtapas,
  availableTags
}) => {
  const [editedTask, setEditedTask] = React.useState<Tarea>({ 
    ...tarea, 
    etiquetas: tarea.etiquetas || [],
    checklist: tarea.checklist || [],
    prioridad: tarea.prioridad || "media"
  });
  const [nuevoItemChecklist, setNuevoItemChecklist] = React.useState("");

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: value }));
  };

  const handleEtiquetasChange = (_: any, newValue: string[]) => {
    setEditedTask(prev => ({ ...prev, etiquetas: newValue }));
  };

  const handleChecklistToggle = (id: number) => {
    setEditedTask(prev => ({
      ...prev,
      checklist: prev.checklist?.map(item => 
        item.id === id ? { ...item, completado: !item.completado } : item
      ) || []
    }));
  };

  const handleAddChecklistItem = () => {
    if (nuevoItemChecklist.trim()) {
      setEditedTask(prev => ({
        ...prev,
        checklist: [
          ...(prev.checklist || []),
          {
            id: Date.now(),
            texto: nuevoItemChecklist,
            completado: false
          }
        ]
      }));
      setNuevoItemChecklist("");
    }
  };

  const handleSave = () => {
    onClose();
  };

  const handleDelete = () => {
    onDelete(tarea.id);
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
      "S/Pendientes": "#cddc39"
    };
    return tagColors[tag] || "#9e9e9e";
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ borderBottom: "1px solid #eee", pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight="bold">{editedTask.titulo}</Typography>
            <Typography variant="caption" color="textSecondary">
              en la lista <strong>{editedTask.etapa}</strong>
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Etapa</InputLabel>
            <Select
              value={editedTask.etapa}
              onChange={(e) => setEditedTask({...editedTask, etapa: e.target.value as string})}
              label="Etapa"
            >
              {availableEtapas.map(etapa => (
                <MenuItem key={etapa} value={etapa}>{etapa}</MenuItem>
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
                Notificaciones
              </Typography>
              <Stack direction="row" spacing={2}>
                <FormControlLabel 
                  control={<Checkbox />} 
                  label="Seguir" 
                />
                <FormControlLabel 
                  control={<Checkbox checked />} 
                  label="Unirse" 
                />
                <FormControlLabel 
                  control={<Checkbox />} 
                  label="Miembros" 
                />
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Descripción
              </Typography>
              <TextField
                name="descripcion"
                value={editedTask.descripcion}
                onChange={handleFieldChange}
                placeholder="Añadir una descripción más detallada..."
                fullWidth
                multiline
                rows={4}
                variant="outlined"
              />
            </Box>

            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Etiquetas
              </Typography>
              <Autocomplete
                multiple
                options={availableTags}
                value={editedTask.etiquetas || []}
                onChange={handleEtiquetasChange}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option}
                      label={option}
                      size="small"
                      style={{
                        backgroundColor: getTagColor(option),
                        color: "white"
                      }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} placeholder="Seleccionar etiquetas" />
                )}
              />
            </Box>

            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Checklist ({editedTask.checklist?.filter(i => i.completado).length || 0}/{editedTask.checklist?.length || 0})
              </Typography>
              <Stack spacing={1} mb={2}>
                {editedTask.checklist?.map(item => (
                  <FormControlLabel
                    key={item.id}
                    control={
                      <Checkbox
                        checked={item.completado}
                        onChange={() => handleChecklistToggle(item.id)}
                        icon={<PlaylistAddCheckIcon color="disabled" />}
                        checkedIcon={<PlaylistAddCheckIcon color="success" />}
                      />
                    }
                    label={item.texto}
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="Añadir elemento a la checklist"
                  value={nuevoItemChecklist}
                  onChange={(e) => setNuevoItemChecklist(e.target.value)}
                  fullWidth
                />
                <Button onClick={handleAddChecklistItem}>Añadir</Button>
              </Stack>
            </Box>

            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Fechas
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                {editedTask.fecha_creacion && (
                  <Chip
                    icon={<CalendarTodayIcon />}
                    label={`Creada: ${new Date(editedTask.fecha_creacion).toLocaleDateString()}`}
                    variant="outlined"
                  />
                )}
                <TextField
                  type="date"
                  label="Fecha de vencimiento"
                  name="fecha_vencimiento"
                  value={editedTask.fecha_vencimiento || ""}
                  onChange={handleFieldChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Actividad
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="Escribe un comentario..."
                  fullWidth
                  multiline
                  rows={2}
                />
                <IconButton>
                  <AttachFileIcon />
                </IconButton>
                <IconButton>
                  <CropOriginalIcon />
                </IconButton>
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={4}>
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                Añadir a la tarjeta
              </Typography>
              
              <Button 
                startIcon={<PersonAddIcon />} 
                fullWidth 
                variant="outlined"
                sx={{ justifyContent: "flex-start" }}
              >
                Miembros
              </Button>
              
              <Button 
                startIcon={<LabelIcon />} 
                fullWidth 
                variant="outlined"
                sx={{ justifyContent: "flex-start" }}
              >
                Etiquetas
              </Button>
              
              <Button 
                startIcon={<PlaylistAddCheckIcon />} 
                fullWidth 
                variant="outlined"
                sx={{ justifyContent: "flex-start" }}
              >
                Checklist
              </Button>
              
              <Button 
                startIcon={<CalendarTodayIcon />} 
                fullWidth 
                variant="outlined"
                sx={{ justifyContent: "flex-start" }}
              >
                Fechas
              </Button>
              
              <Button 
                startIcon={<AttachFileIcon />} 
                fullWidth 
                variant="outlined"
                sx={{ justifyContent: "flex-start" }}
              >
                Adjunto
              </Button>
              
              <Button 
                startIcon={<CropOriginalIcon />} 
                fullWidth 
                variant="outlined"
                sx={{ justifyContent: "flex-start" }}
              >
                Portada
              </Button>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle1" fontWeight="bold">
                Acciones
              </Typography>
              
              <Button 
                startIcon={<VisibilityIcon />} 
                fullWidth 
                variant="outlined"
                sx={{ justifyContent: "flex-start" }}
              >
                Seguir
              </Button>
              
              <Button 
                startIcon={<ViewHeadlineIcon />} 
                fullWidth 
                variant="outlined"
                sx={{ justifyContent: "flex-start" }}
              >
                Archivar
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ borderTop: "1px solid #eee", p: 2 }}>
        <Stack direction="row" justifyContent="space-between" width="100%">
          <Stack direction="row" spacing={1}>
            <IconButton>
              <Badge badgeContent={0} color="primary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton>
              <LabelIcon />
            </IconButton>
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button onClick={handleDelete} color="error">
              Eliminar
            </Button>
            <Button onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave} variant="contained" color="primary">
              Guardar
            </Button>
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};