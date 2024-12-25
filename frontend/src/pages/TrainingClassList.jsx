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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getTrainingClasses, createTrainingClass, updateTrainingClass, deleteTrainingClass } from '../services/api';
import { getTrainers } from '../services/api';

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
    discipline: 'western'
  });

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery('trainingClasses', getTrainingClasses, {
    select: (response) => response?.data?.trainingClasses || []
  });

  const { data: trainersData, isLoading: trainersLoading } = useQuery('trainers', getTrainers, {
    select: (response) => response?.data?.trainers || []
  });

  const classes = data || [];
  const trainers = trainersData || [];

  const createMutation = useMutation(createTrainingClass, {
    onSuccess: () => {
      queryClient.invalidateQueries('trainingClasses');
      handleClose();
    },
  });

  const updateMutation = useMutation(updateTrainingClass, {
    onSuccess: () => {
      queryClient.invalidateQueries('trainingClasses');
      handleClose();
    },
  });

  const deleteMutation = useMutation(deleteTrainingClass, {
    onSuccess: () => {
      queryClient.invalidateQueries('trainingClasses');
    },
  });

  const handleOpen = (trainingClass = null) => {
    setSelectedClass(trainingClass);
    if (trainingClass) {
      setFormData({
        name: trainingClass.name,
        instructor: trainingClass.trainer._id,
        time: trainingClass.schedule.time,
        maxParticipants: trainingClass.maxParticipants,
        description: trainingClass.description,
        price: trainingClass.price.amount,
        level: trainingClass.level,
        discipline: trainingClass.type
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
        discipline: 'western'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedClass(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedClass) {
      updateMutation.mutate({ id: selectedClass._id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('trainingClass.actions.confirmDelete'))) {
      try {
        deleteMutation.mutate(id);
      } catch (error) {
        console.error('Error deleting class:', error);
      }
    }
  };

  if (isLoading || trainersLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>{t('common.loading')}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{t('errors.somethingWentWrong')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('trainingClass.title')}</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          {t('trainingClass.addNew')}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {classes.map((trainingClass) => (
          <Card key={trainingClass._id} sx={{ width: 300 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {trainingClass.name}
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon />
                  <Typography>{trainingClass.trainer?.username}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon />
                  <Typography>{trainingClass.schedule?.time}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon />
                  <Typography>
                    {t('trainingClass.maxParticipants')}: {trainingClass.maxParticipants}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {trainingClass.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  USD ${trainingClass.price?.amount}
                </Typography>
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedClass ? t('trainingClass.editClass') : t('trainingClass.addNew')}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label={t('trainingClass.name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('trainingClass.instructor')}</InputLabel>
              <Select
                value={formData.instructor}
                label={t('trainingClass.instructor')}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('trainingClass.maxParticipants')}
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="level-label">{t('trainingClass.level.label')}</InputLabel>
              <Select
                labelId="level-label"
                value={formData.level}
                label={t('trainingClass.level.label')}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              >
                <MenuItem value="beginner">{t('trainingClass.level.beginner')}</MenuItem>
                <MenuItem value="intermediate">{t('trainingClass.level.intermediate')}</MenuItem>
                <MenuItem value="advanced">{t('trainingClass.level.advanced')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="discipline-label">{t('trainingClass.discipline.label')}</InputLabel>
              <Select
                labelId="discipline-label"
                value={formData.discipline}
                label={t('trainingClass.discipline.label')}
                onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
              >
                <MenuItem value="western">{t('trainingClass.discipline.western')}</MenuItem>
                <MenuItem value="jumping">{t('trainingClass.discipline.jumping')}</MenuItem>
                <MenuItem value="dressage">{t('trainingClass.discipline.dressage')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={t('trainingClass.description')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label={t('trainingClass.price')}
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedClass ? t('common.save') : t('common.add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TrainingClassList;
