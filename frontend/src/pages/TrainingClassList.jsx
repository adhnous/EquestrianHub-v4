import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Avatar,
  Paper,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getTrainingClasses,
  createTrainingClass,
  updateTrainingClass,
  deleteTrainingClass, } from '../services';
  import {
    getTrainers,
    createTrainer,
    updateTrainer,
    deleteTrainer,
  } from '../services';

// Small palette of colors for Avatars
const avatarColors = [
  '#D32F2F', // Red
  '#1976D2', // Blue
  '#388E3C', // Green
  '#FBC02D', // Yellow
  '#7B1FA2', // Purple
  '#00796B', // Teal
];

// Utility to pick a random color from the palette
const getRandomColor = () => {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)];
};

const TrainingClassList = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    instructor: '',
    time: '',
    maxParticipants: '',
    description: '',
    price: '',
    level: 'beginner',
    discipline: 'western',
  });

  const queryClient = useQueryClient();

  // Fetch training classes
  const {
    data: classesData,
    isLoading,
    error,
  } = useQuery('trainingClasses', getTrainingClasses, {
    select: (response) => response?.data?.trainingClasses || [],
  });

  // Fetch trainers
  const {
    data: trainersData,
    isLoading: trainersLoading,
  } = useQuery('trainers', getTrainers, {
    select: (response) => response?.data?.trainers || [],
  });

  const classes = classesData || [];
  const trainers = trainersData || [];

  // Create
  const createMutation = useMutation(createTrainingClass, {
    onSuccess: () => {
      queryClient.invalidateQueries('trainingClasses');
      handleClose();
    },
  });

  // Update
  const updateMutation = useMutation(updateTrainingClass, {
    onSuccess: () => {
      queryClient.invalidateQueries('trainingClasses');
      handleClose();
    },
  });

  // Delete
  const deleteMutation = useMutation(deleteTrainingClass, {
    onSuccess: () => {
      queryClient.invalidateQueries('trainingClasses');
    },
  });

  // Open Dialog
  const handleOpen = (trainingClass = null) => {
    setSelectedClass(trainingClass);

    if (trainingClass) {
      setFormData({
        name: trainingClass.name,
        instructor: trainingClass.trainer?._id,
        time: trainingClass.schedule?.time,
        maxParticipants: trainingClass.maxParticipants,
        description: trainingClass.description,
        price: trainingClass.price?.amount,
        level: trainingClass.level,
        discipline: trainingClass.type,
      });
    } else {
      setFormData({
        name: '',
        instructor: '',
        time: '',
        maxParticipants: '',
        description: '',
        price: '',
        level: 'beginner',
        discipline: 'western',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedClass(null);
  };

  // Create / Update
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedClass) {
      updateMutation.mutate({ id: selectedClass._id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (window.confirm(t('trainingClass.actions.confirmDelete'))) {
      try {
        deleteMutation.mutate(id);
      } catch (err) {
        console.error('Error deleting class:', err);
      }
    }
  };

  if (isLoading || trainersLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(to right, #f2f2f2, #e0e0e0)',
        }}
      >
        <Typography>{t('common.loading')}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          minHeight: '100vh',
          background: 'linear-gradient(to right, #f2f2f2, #e0e0e0)',
        }}
      >
        <Typography color="error">{t('errors.somethingWentWrong')}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #fafafa, #f0f0f0)',
        p: { xs: 2, sm: 4 },
      }}
    >
      {/* Header section */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 4,
          backgroundColor: '#fff',
          borderRadius: 2,
          boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
              color: 'text.primary',
            }}
          >
            {t('trainingClass.title')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{
              boxShadow: '0px 2px 6px rgba(33, 150, 243, 0.3)',
            }}
            onClick={() => handleOpen()}
          >
            {t('trainingClass.addNew')}
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {classes.map((trainingClass) => (
          <Card
            key={trainingClass._id}
            sx={{
              width: 320,
              position: 'relative',
              transition: 'transform 0.25s ease',
              borderRadius: 2,
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                {/* Class Name & Avatar */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: getRandomColor(),
                      width: 48,
                      height: 48,
                    }}
                  >
                    {trainingClass.name?.charAt(0)?.toUpperCase() || 'C'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {trainingClass.name}
                    </Typography>
                  </Box>
                </Stack>

                {/* Trainer / Time / Participants */}
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" />
                    <Typography variant="body2">
                      {trainingClass.trainer?.username}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon fontSize="small" />
                    <Typography variant="body2">
                      {trainingClass.schedule?.time}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupIcon fontSize="small" />
                    <Typography variant="body2">
                      {t('trainingClass.maxParticipants')}:{' '}
                      {trainingClass.maxParticipants}
                    </Typography>
                  </Box>
                </Stack>

                {/* Chips for Level & Discipline */}
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={t(`trainingClass.level.${trainingClass.level}`)}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={t(`trainingClass.discipline.${trainingClass.type}`)}
                    color="secondary"
                    size="small"
                  />
                </Stack>

                {/* Description */}
                <Typography variant="body2" color="text.secondary">
                  {trainingClass.description}
                </Typography>

                {/* Price */}
                <Typography variant="h6" color="primary" fontWeight={600}>
                  USD ${trainingClass.price?.amount}
                </Typography>

                {/* Divider & Card Actions */}
                <Divider sx={{ mt: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpen(trainingClass)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(trainingClass._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Dialog for Add/Edit Training Class */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 600 }}>
            {selectedClass
              ? t('trainingClass.editClass')
              : t('trainingClass.addNew')}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label={t('trainingClass.name')}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('trainingClass.instructor')}</InputLabel>
              <Select
                value={formData.instructor}
                label={t('trainingClass.instructor')}
                onChange={(e) =>
                  setFormData({ ...formData, instructor: e.target.value })
                }
              >
                {trainers.map((trainer) => (
                  <MenuItem key={trainer._id} value={trainer._id}>
                    {trainer.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={t('trainingClass.time')}
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('trainingClass.maxParticipants')}
              type="number"
              value={formData.maxParticipants}
              onChange={(e) =>
                setFormData({ ...formData, maxParticipants: e.target.value })
              }
              margin="normal"
              required
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel id="level-label">
                {t('trainingClass.level.label')}
              </InputLabel>
              <Select
                labelId="level-label"
                value={formData.level}
                label={t('trainingClass.level.label')}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
              >
                <MenuItem value="beginner">
                  {t('trainingClass.level.beginner')}
                </MenuItem>
                <MenuItem value="intermediate">
                  {t('trainingClass.level.intermediate')}
                </MenuItem>
                <MenuItem value="advanced">
                  {t('trainingClass.level.advanced')}
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel id="discipline-label">
                {t('trainingClass.discipline.label')}
              </InputLabel>
              <Select
                labelId="discipline-label"
                value={formData.discipline}
                label={t('trainingClass.discipline.label')}
                onChange={(e) =>
                  setFormData({ ...formData, discipline: e.target.value })
                }
              >
                <MenuItem value="western">
                  {t('trainingClass.discipline.western')}
                </MenuItem>
                <MenuItem value="jumping">
                  {t('trainingClass.discipline.jumping')}
                </MenuItem>
                <MenuItem value="dressage">
                  {t('trainingClass.discipline.dressage')}
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label={t('trainingClass.description')}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label={t('trainingClass.price')}
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose}>{t('common.cancel')}</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {selectedClass ? t('common.save') : t('common.add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TrainingClassList;
